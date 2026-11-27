function createHeroMedia(url, onFrameAvailable, onPlaybackError, { initialFrame = 0, detailOnly = false } = {}) {
  const rate = 24;
  const network = new AbortController();
  const indexRequest = new AbortController();
  const frames = new Map();
  const cachedGroups = new Set();
  const groups = [];
  const transfers = { forward: null, seek: null };
  let presented = 0;
  let settled = true;
  let settleTimer;
  let stallTimer;
  let stalled = false;
  let lastProgress = 0;
  let jumped = false;
  let target = initialFrame;
  let interacting = false;
  let direction = 1;
  let decoder;
  let video;
  let nativeFrame = -1;
  let soughtNativeFrame = -1;
  let nativeRequest;
  let localURL;
  let activeGroup;
  let samples;
  let bytes;
  let acceptsRanges;
  let deferredFullResponse = false;
  let largeFrames = false;
  let disposed = false;

  // Start the clock only for a requested, stationary frame. Ignore slow but
  // advancing downloads. The page checks visibility before acting on a stall.
  const watchForStall = () => {
    if (stallTimer !== undefined || stalled || !settled || !interacting || !target
      || video || disposed || frames.has(target) || (!detailOnly && target === presented)) return;
    const timeout = 3500;
    lastProgress = performance.now();
    const check = () => {
      stallTimer = undefined;
      if (video || disposed || frames.has(target) || (!detailOnly && target === presented)) return;
      const remaining = timeout - (performance.now() - lastProgress);
      if (remaining > 0) {
        stallTimer = setTimeout(check, remaining);
      } else {
        stalled = true;
        onFrameAvailable();
      }
    };
    stallTimer = setTimeout(check, timeout);
  };

  const releaseDecodedFrames = () => {
    indexRequest.abort();
    clearTimeout(stallTimer);
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
    if (nativeRequest || video.readyState < 1 || video.seeking || nativeFrame === target) return;
    soughtNativeFrame = target;
    // Seek into the middle of the source frame to stay clear of timestamp rounding.
    video.currentTime = (target + .25) / rate;
  };

  // Native seeking needs byte ranges. If a static host ignores the one-byte
  // probe, use that same response as a seekable Blob, without a second download.
  const attachNativeSource = async () => {
    if (acceptsRanges === true) {
      video.src = url;
      return;
    }
    const controller = new AbortController();
    nativeRequest = controller;
    try {
      const headers = acceptsRanges === false ? {} : { Range: 'bytes=0-0' };
      const response = await fetch(url, { headers, signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo cargar el video de portada');
      acceptsRanges = response.status === 206;
      if (acceptsRanges) {
        await response.arrayBuffer();
        if (!disposed) video.src = url;
      } else {
        const blob = await response.blob();
        if (disposed) return;
        localURL = URL.createObjectURL(blob);
        nativeFrame = -1;
        video.src = localURL;
      }
    } catch {
      if (!disposed) onPlaybackError();
    } finally {
      nativeRequest = undefined;
    }
  };

  const useNativeVideo = (direct = false) => {
    if (disposed || video) return;
    releaseDecodedFrames();
    video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = interacting ? 'auto' : 'metadata';
    video.addEventListener('loadedmetadata', onFrameAvailable);
    video.addEventListener('loadeddata', onFrameAvailable);
    video.addEventListener('error', () => {
      if (!disposed) onPlaybackError();
    });
    video.addEventListener('seeked', () => {
      if (!disposed && !nativeRequest) {
        nativeFrame = Math.floor(video.currentTime * rate);
        const rangeEnd = video.seekable.length ? video.seekable.end(video.seekable.length - 1) : 0;
        if (!localURL && nativeFrame !== soughtNativeFrame && soughtNativeFrame / rate > rangeEnd) {
          acceptsRanges = false;
          attachNativeSource();
          return;
        }
        onFrameAvailable();
      }
    });
    if (direct) {
      video.src = url;
    } else if (interacting || detailOnly) {
      attachNativeSource();
    } else {
      // Learn whether normal video seeking works while the poster is visible,
      // without asking the server for movie bytes before the first gesture.
      fetch(url, { method: 'HEAD', priority: 'low', signal: network.signal })
        .then(response => {
          if (acceptsRanges === undefined && response.headers.get('Accept-Ranges') === 'bytes') acceptsRanges = true;
        }).catch(() => {});
    }
  };

  const ready = group => groups[group] && groups[group].loaded === groups[group].limit;

  const decodeAround = () => {
    if (!decoder || !bytes) return;
    const group = samples[target][2];
    scheduleTransfer(group);
    if (activeGroup !== undefined) return;
    const nearby = [group];
    if (!detailOnly && !ready(group) && Math.sign(target - presented) === direction) {
      // During a continuous sweep the network may trail the finger. Decode the
      // nearest complete group that actually advances the frame on screen.
      const limit = samples[presented][2];
      for (let g = group - direction; (g - limit) * direction >= 0; g -= direction) {
        if (ready(g)) { nearby.push(g); break; }
      }
    }
    if (!detailOnly) nearby.push(group + direction, group - direction, group + 2 * direction);
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

  const cancelTransfer = key => {
    transfers[key]?.controller.abort();
    transfers[key] = null;
  };

  const scheduleTransfer = group => {
    if (acceptsRanges === false) {
      if (deferredFullResponse && interacting && !transfers.forward) {
        deferredFullResponse = false;
        startTransfer('forward', 0, groups.length - 1);
      }
      return;
    }
    const current = groups[group];
    if (detailOnly) {
      if (transfers.seek && transfers.seek.first !== group) cancelTransfer('seek');
      if (!ready(group) && !transfers.seek) startTransfer('seek', group, group);
      return;
    }
    // Warm only the first few frames behind the poster. Once scrolling starts,
    // read a contiguous motion stream; reverse passes reuse the downloaded bytes.
    const background = transfers.forward;
    const seek = transfers.seek;
    if (seek && seek.first !== group && (jumped || settled)) cancelTransfer('seek');
    const behind = background && (group < background.first || group > background.last
      || current.loaded - background.cursor > (settled ? 96 : 384) * 1024);
    if (interacting && behind && !ready(group) && !transfers.seek && (settled || jumped)) {
      startTransfer('seek', group, group);
    }
    jumped = false;
    if (background) return;
    let first = group;
    while (ready(first)) first++;
    if (!groups[first] || (!interacting && first > 0)) return;
    const limit = interacting ? groups.length - 1 : Math.min(groups.length - 1, 2);
    let last = first;
    while (last < limit && !ready(last + 1)) last++;
    startTransfer('forward', first, last);
  };

  const startTransfer = async (key, first, last) => {
    const controller = new AbortController();
    const job = { first, last, cursor: groups[first].loaded, controller };
    transfers[key] = job;
    try {
      const response = await fetch(url, {
        headers: { Range: `bytes=${job.cursor}-${groups[last].limit - 1}` },
        priority: detailOnly || !interacting ? 'low' : 'high',
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
        if (!interacting && !detailOnly) {
          // A host without byte ranges would turn idle preparation into an
          // entire movie download. Wait for the user's first scroll instead.
          deferredFullResponse = true;
          controller.abort();
          return;
        }
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
          if (length) lastProgress = performance.now();
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
      const response = await fetch(url.replace(/\.mp4(?=\?|$)/, '.json'), { priority: 'low', signal: indexRequest.signal });
      if (!response.ok) throw new Error('No se pudo cargar el índice de video');
      const index = await response.json();
      if (disposed || video) return;
      lastProgress = performance.now();
      const config = {
        codec: index.codec,
        codedWidth: index.width,
        codedHeight: index.height,
        description: Uint8Array.from(atob(index.description), byte => byte.charCodeAt(0)),
        optimizeForLatency: true,
      };
      const support = await VideoDecoder.isConfigSupported(config);
      if (disposed || video) return;
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
    frameAt(position, drawnAt, active = true) {
      interacting ||= active;
      presented = Math.max(0, drawnAt ?? 0);
      if (position !== target) {
        const next = Math.sign(position - target);
        jumped = Math.abs(position - target) >= 12 || next !== direction;
        settled = stalled = false;
        clearTimeout(stallTimer);
        stallTimer = undefined;
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          settled = true;
          decodeAround();
          watchForStall();
        }, 100);
        direction = next;
        target = position;
      }
      if (stalled && !video && !frames.has(target) && (detailOnly || position !== presented)) useNativeVideo(true);
      const advances = index => (index - presented) * direction > 0 && (target - index) * direction >= 0;
      if (video) {
        if (!interacting || nativeRequest) return null;
        if (!video.hasAttribute('src')) attachNativeSource();
        if (video.preload !== 'auto') video.preload = 'auto';
        if (nativeFrame === target) return { image: video, index: target };
        if (!video.seeking && advances(nativeFrame)) {
          queueMicrotask(() => { if (!disposed) seekVideo(); });
          return { image: video, index: nativeFrame };
        }
        seekVideo();
        return null;
      }
      decodeAround();
      watchForStall();
      if (frames.has(target)) return { image: frames.get(target), index: target };
      let closest = presented;
      for (const index of frames.keys()) {
        if (advances(index) && (index - closest) * direction > 0) closest = index;
      }
      return closest === presented ? null : { image: frames.get(closest), index: closest };
    },
    cachedFrame(position) {
      const image = frames.get(position);
      return image ? { image, index: position } : null;
    },
    dispose() {
      disposed = true;
      network.abort();
      nativeRequest?.abort();
      releaseDecodedFrames();
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
      if (localURL) URL.revokeObjectURL(localURL);
    },
  };
}
