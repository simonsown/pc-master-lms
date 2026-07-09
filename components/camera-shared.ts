let sharedStream: MediaStream | null = null;
let sharedVideo: HTMLVideoElement | null = null;
let listeners: Array<() => void> = [];

export function setSharedStream(stream: MediaStream) {
  sharedStream = stream;
  listeners.forEach(fn => fn());
}

export function getSharedStream(): MediaStream | null {
  return sharedStream;
}

export function setSharedVideo(video: HTMLVideoElement | null) {
  sharedVideo = video;
}

export function getSharedVideo(): HTMLVideoElement | null {
  return sharedVideo;
}

export function onStreamReady(fn: () => void) {
  listeners.push(fn);
  if (sharedStream) fn();
  return () => { listeners = listeners.filter(f => f !== fn); };
}
