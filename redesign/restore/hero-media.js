function createHeroMedia(url, onFrameAvailable, onPlaybackError) {
  const rate = 24;
  const network = new AbortController();
  const frames = new Map();
  const cachedGroups = new Set();
  const downloadedWindows = new Set();
  const pendingWindows = new Set();
  const groupsPerWindow = 4;
  let target = 0;
  let direction = 1;
  let decoder;
  let video;
  let nativeFrame = -1;
  let activeGroup;
  let samples;
  let bytes;
  let downloadedBytes = 0;
  let acceptsRanges;
  let largeFrames = false;
  let disposed = false;

  const releaseDecodedFrames = () => {
    for (const frame of frames.values()) frame.close();
    frames.clear();
    cachedGroups.clear();
    downloadedWindows.clear();
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

  const keepGroup = (index, group) => largeFrames
    ? index === group || index === group + direction
    : Math.abs(index - group) <= 2;

  const decodeAround = () => {
    if (!decoder || !bytes) return;
    const group = samples[target][2];
    const window = Math.floor(group / groupsPerWindow);
    fetchWindow(window);
    if (downloadedWindows.has(window)) fetchWindow(window + direction);
    if (activeGroup !== undefined) return;
    // Drop frames far from the playhead before asking the decoder for more work.
    for (const [index, frame] of frames) {
      if (keepGroup(samples[index][2], group)) continue;
      frame.close();
      frames.delete(index);
      cachedGroups.delete(samples[index][2]);
    }

    // At the native 4K size two four-frame groups already occupy about 100 MB.
    const nearby = largeFrames ? [group, group + direction] : [group, group + direction, group - direction, group + 2 * direction];
    const nextGroup = nearby.find(index =>
      index >= 0 && index <= samples.at(-1)[2] && !cachedGroups.has(index));
    if (nextGroup === undefined) return;
    const start = samples.findIndex(sample => sample[2] === nextGroup);
    const end = samples.findLastIndex(sample => sample[2] === nextGroup);
    if (downloadedBytes < samples[end][0] + samples[end][1]
      && !downloadedWindows.has(Math.floor(nextGroup / groupsPerWindow))) return;
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
      if (keepGroup(nextGroup, samples[target][2])
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

  // Read a window around the playhead and one in its direction of travel.
  // Pausing or leaving the hero does not require downloading the remaining 4K film.
  const fetchWindow = async window => {
    if (acceptsRanges === false || window < 0 || window * groupsPerWindow > samples.at(-1)[2]
      || pendingWindows.size >= (acceptsRanges ? 2 : 1)
      || downloadedWindows.has(window) || pendingWindows.has(window)) return;
    pendingWindows.add(window);
    const start = samples.findIndex(sample => sample[2] === window * groupsPerWindow);
    const end = samples.findLastIndex(sample => Math.floor(sample[2] / groupsPerWindow) === window);
    const first = samples[start][0];
    const last = samples[end][0] + samples[end][1] - 1;
    try {
      const response = await fetchMedia(url, {
        headers: { Range: `bytes=${first}-${last}` },
        priority: Math.floor(samples[target][2] / groupsPerWindow) === window ? 'high' : 'low',
      });
      if (response.status !== 206) {
        acceptsRanges = false;
        await loadMovie(response);
        return;
      }
      const block = new Uint8Array(await response.arrayBuffer());
      if (disposed || video || !bytes) return;
      if (block.length !== last - first + 1) throw new Error('Rango de video incompleto');
      acceptsRanges = true;
      bytes.set(block, first);
      downloadedWindows.add(window);
    } catch {
      useNativeVideo();
    } finally {
      pendingWindows.delete(window);
      if (!disposed && !video) decodeAround();
    }
  };

  const loadMovie = async response => {
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
      const index = await fetchMedia(url.replace(/\.mp4$/, '.json')).then(response => response.json());
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
      const [lastOffset, lastLength] = samples.at(-1);
      bytes = new Uint8Array(lastOffset + lastLength);
      largeFrames = index.width * index.height > 4e6;
      decoder = new VideoDecoder({
        output: frame => {
          const index = Math.round(frame.timestamp * rate / 1e6);
          const group = samples?.[index]?.[2];
          if (!samples || !keepGroup(group, samples[target][2])) {
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
