function createHeroMedia(url, onFrameAvailable) {
  const rate = 24;
  const network = new AbortController();
  const frames = new Map();
  const cachedGroups = new Set();
  const availableGroups = new Set();
  const pendingGroups = new Set();
  let target = 0;
  let direction = 1;
  let decoder;
  let video;
  let nativeFrame = -1;
  let activeGroup;
  let samples;
  let bytes;
  let downloadedBytes = 0;
  let acceptsRanges = true;
  let disposed = false;

  const releaseDecodedFrames = () => {
    for (const frame of frames.values()) frame.close();
    frames.clear();
    cachedGroups.clear();
    availableGroups.clear();
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
    video.addEventListener('seeked', () => {
      if (!disposed) {
        nativeFrame = Math.floor(video.currentTime * rate);
        onFrameAvailable();
      }
    });
    video.src = url;
  };

  const decodeAround = () => {
    if (!decoder || !bytes || activeGroup !== undefined) return;
    const group = samples[target][2];
    // Drop frames far from the playhead before asking the decoder for more work.
    for (const [index, frame] of frames) {
      if (Math.abs(samples[index][2] - group) <= 2) continue;
      frame.close();
      frames.delete(index);
      cachedGroups.delete(samples[index][2]);
    }

    const nextGroup = [group, group + direction, group - direction, group + 2 * direction].find(index =>
      index >= 0 && index <= samples.at(-1)[2] && !cachedGroups.has(index));
    if (nextGroup === undefined) return;
    const start = samples.findIndex(sample => sample[2] === nextGroup);
    const end = samples.findLastIndex(sample => sample[2] === nextGroup);
    if (downloadedBytes < samples[end][0] + samples[end][1] && !availableGroups.has(nextGroup)) {
      if (nextGroup === group) fetchGroup(nextGroup, start, end);
      return;
    }
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
      if (Math.abs(samples[target][2] - nextGroup) <= 2
        && samples.slice(start, end + 1).every((_, offset) => frames.has(start + offset))) {
        cachedGroups.add(nextGroup);
      }
      activeGroup = undefined;
      onFrameAvailable();
    }).catch(() => useNativeVideo());
  };

  const fetchMedia = async (url, options = {}) => {
    const response = await fetch(url, { ...options, signal: network.signal });
    if (!response.ok) throw new Error('No se pudo cargar el video de portada');
    return response;
  };

  // Prioritize the user's current position when the full video is still
  // downloading. A six-frame keyframe group is independently decodable.
  const fetchGroup = async (group, start, end) => {
    if (!acceptsRanges || pendingGroups.has(group)) return;
    pendingGroups.add(group);
    const first = samples[start][0];
    const last = samples[end][0] + samples[end][1] - 1;
    try {
      const response = await fetchMedia(url, {
        headers: { Range: `bytes=${first}-${last}` },
        priority: 'high',
      });
      if (response.status !== 206) {
        acceptsRanges = false;
        response.body?.cancel();
        return;
      }
      const block = new Uint8Array(await response.arrayBuffer());
      if (disposed || video || !bytes || block.length !== last - first + 1) return;
      bytes.set(block, first);
      availableGroups.add(group);
      decodeAround();
    } catch {
      // Sequential download remains available when a range request fails.
    } finally {
      pendingGroups.delete(group);
    }
  };

  const loadMovie = async response => {
    const [lastOffset, lastLength] = samples.at(-1);
    bytes = new Uint8Array(lastOffset + lastLength);
    const reader = response.body.getReader();
    try {
      while (downloadedBytes < bytes.length) {
        const { value, done } = await reader.read();
        if (disposed || video) return;
        if (done) throw new Error('El video de portada está incompleto');
        const part = value.subarray(0, bytes.length - downloadedBytes);
        bytes.set(part, downloadedBytes);
        downloadedBytes += part.length;
        decodeAround();
      }
    } finally {
      reader.releaseLock();
    }
  };

  const prepare = async () => {
    if (typeof VideoDecoder !== 'function') {
      useNativeVideo();
      return;
    }

    try {
      const [index, response] = await Promise.all([
        fetchMedia(url.replace(/\.mp4$/, '.json')).then(response => response.json()),
        fetchMedia(url, { priority: 'low' }),
      ]);
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
      decoder = new VideoDecoder({
        output: frame => {
          const index = Math.round(frame.timestamp * rate / 1e6);
          const group = samples?.[index]?.[2];
          if (!samples || Math.abs(samples[target][2] - group) > 2) {
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
      await loadMovie(response);
    } catch {
      useNativeVideo();
    }
  };

  prepare();
  return {
    frameAt(position) {
      if (position !== target) direction = position < target ? -1 : 1;
      target = position;
      if (video) {
        if (nativeFrame === target) return video;
        seekVideo();
        return null;
      }
      decodeAround();
      return frames.get(target);
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
