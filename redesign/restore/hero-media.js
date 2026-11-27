function createHeroMedia(url, onFrameAvailable, onPlaybackError, manifest) {
  const rate = 24;
  const network = new AbortController();
  const frames = new Map();
  const cachedGroups = new Set();
  const groups = [];
  const transfers = { forward: null, seek: null };
  let presented = 0;
  let settled = true;
  let settleTimer;
  let jumped = false;
  let target = 0;
  let direction = 1;
  let decoder;
  let video;
  let nativeFrame = -1;
  let activeGroup;
  let samples;
  let bytes;
  let acceptsRanges;
  let largeFrames = false;
  let disposed = false;

  const releaseDecodedFrames = () => {
    for (const frame of frames.values()) frame.close();
    frames.clear();
    cachedGroups.clear();
    clearTimeout(settleTimer);
    for (const key of Object.keys(transfers)) cancelTransfer(key);
    groups.length = 0;
    if (decoder && decoder.state !== 'closed') decoder.close();
    decoder = undefined;
    bytes = undefined;
    samples = undefined;
  };

  const seekVideo = () => {
    if (video.readyState < 1 || video.seeking || nativeFrame === target) return;
    // Seek into the middle of the source frame to stay clear of timestamp rounding.
    video.currentTime = (target + .25) / rate;
  };

  const useNativeVideo = () => {
    if (disposed || video) return;
    network.abort();
    releaseDecodedFrames();
    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.addEventListener('loadedmetadata', onFrameAvailable);
    video.addEventListener('loadeddata', onFrameAvailable);
    video.addEventListener('error', () => {
      if (!disposed) onPlaybackError();
    });
    video.addEventListener('seeked', () => {
      if (!disposed) {
        nativeFrame = Math.floor(video.currentTime * rate);
        onFrameAvailable();
      }
    });
    video.src = url;
  };

  const ready = group => groups[group] && groups[group].loaded === groups[group].limit;

  const decodeAround = () => {
    if (!decoder || !bytes) return;
    const group = samples[target][2];
    scheduleTransfer(group);
    if (activeGroup !== undefined) return;
    const nearby = [group];
    if (!ready(group) && Math.sign(target - presented) === direction) {
      // During a continuous sweep the network may trail the finger. Decode the
      // nearest complete group that actually advances the frame on screen.
      const limit = samples[presented][2];
      for (let g = group - direction; (g - limit) * direction >= 0; g -= direction) {
        if (ready(g)) { nearby.push(g); break; }
      }
    }
    nearby.push(group + direction, group - direction, group + 2 * direction);
    const wanted = [...new Set(nearby.filter(ready))].slice(0, largeFrames ? 2 : 4);
    for (const [index, frame] of frames) {
      if (wanted.includes(samples[index][2])) continue;
      frame.close();
      frames.delete(index);
      cachedGroups.delete(samples[index][2]);
    }
    const nextGroup = wanted.find(index => !cachedGroups.has(index));
    if (nextGroup === undefined) return;
    const { start, end } = groups[nextGroup];
    const currentDecoder = decoder;
    activeGroup = nextGroup;
    // A group starts on a keyframe and has no references to earlier groups.
    // Each new request can therefore start near the exact scroll position.
    try {
      for (let index = start; index <= end; index += 1) {
        const [offset, length] = samples[index];
        currentDecoder.decode(new EncodedVideoChunk({
          type: index === start ? 'key' : 'delta',
          timestamp: Math.round(index * 1e6 / rate),
          data: bytes.subarray(offset, offset + length),
        }));
      }
    } catch {
      useNativeVideo();
      return;
    }
    currentDecoder.flush().then(() => {
      if (decoder !== currentDecoder) return;
      cachedGroups.add(nextGroup);
      activeGroup = undefined;
      onFrameAvailable();
    }).catch(() => useNativeVideo());
  };

  const fetchMedia = async (url, options = {}) => {
    const response = await fetch(url, { ...options, signal: network.signal });
    if (!response.ok) throw new Error('No se pudo cargar el video de portada');
    return response;
  };

  const cancelTransfer = key => {
    transfers[key]?.controller.abort();
    transfers[key] = null;
  };

  const scheduleTransfer = group => {
    if (acceptsRanges === false) return;
    const current = groups[group];
    const next = group === groups.length - 1 ? -1 : group === 0 ? 1 : direction;
    const background = transfers.forward;
    const seek = transfers.seek;
    const covered = background && group >= background.first && group <= background.last;
    // A deliberate jump may replace old work. Ordinary adjacent scroll updates
    // leave an in-flight request alive long enough to deliver real frames.
    if (jumped && background && !covered) cancelTransfer('forward');
    if (seek && seek.first !== group && (jumped || settled)) cancelTransfer('seek');
    const farFromStream = !covered || current.loaded - background.cursor > (settled ? 96 : 1024) * 1024;
    if (!ready(group) && !transfers.seek && farFromStream && (group || transfers.forward)) {
      startTransfer('seek', group, group);
    }
    jumped = false;
    if (transfers.forward || (!acceptsRanges && transfers.seek)) return;
    // Start from the opening before the scrub begins. For a cold jump, give the
    // exact short seek first use of the connection, then read adjacent groups.
    if (!ready(group) && transfers.seek) return;
    let first = ready(group) ? group + next : group;
    while (ready(first)) first += next;
    if (!groups[first] || Math.abs(first - group) > 5) return;
    let last = first;
    while (Math.abs(last - first) < (next > 0 ? 15 : 5) && groups[last + next]
      && groups[last + next].loaded === groups[last + next].offset) last += next;
    startTransfer('forward', Math.min(first, last), Math.max(first, last));
  };

  const startTransfer = async (key, first, last) => {
    const controller = new AbortController();
    const job = { first, last, cursor: groups[first].loaded, controller };
    transfers[key] = job;
    try {
      const response = await fetch(url, {
        headers: { Range: `bytes=${job.cursor}-${groups[last].limit - 1}` },
        priority: key === 'seek' ? 'high' : 'low',
        signal: controller.signal,
      });
      if (transfers[key] !== job) return;
      if (!response.ok) throw new Error('No se pudo cargar el video de portada');
      acceptsRanges = response.status === 206;
      if (acceptsRanges) {
        const range = response.headers.get('Content-Range');
        if (range?.split('/')[0] !== `bytes ${job.cursor}-${groups[last].limit - 1}`) {
          throw new Error('Rango de video incorrecto');
        }
      }
      // A static server can ignore Range. Use its existing full response once.
      if (!acceptsRanges) {
        cancelTransfer(key === 'seek' ? 'forward' : 'seek');
        job.cursor = 0;
        first = 0;
        last = groups.length - 1;
      }
      const limit = groups[last].limit;
      const reader = response.body.getReader();
      try {
        let group = first;
        while (job.cursor < limit) {
          const { value, done } = await reader.read();
          if (transfers[key] !== job) return;
          if (done) throw new Error('Rango de video incompleto');
          const length = Math.min(value.length, limit - job.cursor);
          bytes.set(value.subarray(0, length), job.cursor);
          job.cursor += length;
          const previous = group;
          while (group <= last && job.cursor > groups[group].offset) {
            const chunk = groups[group];
            chunk.loaded = Math.max(chunk.loaded, Math.min(chunk.limit, job.cursor));
            if (chunk.loaded < chunk.limit) break;
            group++;
          }
          if (group !== previous && group <= last) decodeAround();
        }
      } finally {
        reader.releaseLock();
      }
    } catch {
      if (transfers[key] === job && !controller.signal.aborted) useNativeVideo();
    } finally {
      if (transfers[key] === job) {
        transfers[key] = null;
        decodeAround();
      }
    }
  };

  const prepare = async () => {
    if (typeof VideoDecoder !== 'function') {
      useNativeVideo();
      return;
    }

    try {
      const index = (await manifest) || await fetchMedia(url.replace(/\.mp4$/, '.json')).then(response => response.json());
      const config = {
        codec: index.codec,
        codedWidth: index.width,
        codedHeight: index.height,
        description: Uint8Array.from(atob(index.description), byte => byte.charCodeAt(0)),
        optimizeForLatency: true,
      };
      const support = await VideoDecoder.isConfigSupported(config);
      if (disposed) return;
      if (!support.supported) {
        useNativeVideo();
        return;
      }
      samples = index.samples;
      samples.forEach(([offset, length, group], frame) => {
        if (!groups[group]) groups[group] = { start: frame, offset, loaded: offset };
        groups[group].end = frame;
        groups[group].limit = offset + length;
      });
      const [lastOffset, lastLength] = samples.at(-1);
      bytes = new Uint8Array(lastOffset + lastLength);
      largeFrames = index.width * index.height > 4e6;
      decoder = new VideoDecoder({
        output: frame => {
          const index = Math.round(frame.timestamp * rate / 1e6);
          const group = samples?.[index]?.[2];
          if (!samples || group !== activeGroup) {
            frame.close();
            return;
          }
          frames.get(index)?.close();
          frames.set(index, frame);
          if (index === target) onFrameAvailable();
        },
        error: () => useNativeVideo(),
      });
      decoder.configure(config);
      decodeAround();
    } catch {
      useNativeVideo();
    }
  };

  prepare();
  return {
    frameAt(position, drawnAt) {
      presented = Math.max(0, drawnAt ?? 0);
      if (position !== target) {
        const next = Math.sign(position - target);
        jumped = Math.abs(position - target) >= 12 || next !== direction;
        settled = false;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          settled = true;
          decodeAround();
        }, 100);
        direction = next;
        target = position;
      }
      const advances = index => (index - presented) * direction > 0 && (target - index) * direction >= 0;
      if (video) {
        if (nativeFrame === target) return { image: video, index: target };
        if (!video.seeking && advances(nativeFrame)) {
          queueMicrotask(() => { if (!disposed) seekVideo(); });
          return { image: video, index: nativeFrame };
        }
        seekVideo();
        return null;
      }
      decodeAround();
      if (frames.has(target)) return { image: frames.get(target), index: target };
      let closest = presented;
      for (const index of frames.keys()) {
        if (advances(index) && (index - closest) * direction > 0) closest = index;
      }
      return closest === presented ? null : { image: frames.get(closest), index: closest };
    },
    dispose() {
      disposed = true;
      network.abort();
      releaseDecodedFrames();
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    },
  };
}
