export interface Quality {
  name: string;
  codecs: string;
  bitrate: number;
  framerate: number;
  width: number;
  height: number;
}

export interface PlayerData {
  qualities: Quality[];
  version: string;
  sessionId: string;
}

export interface VideoData {
  bitrate: number;
  duration: number | null;
  framesDecoded: number | null;
  framesDropped: number | null;
}

export interface TextCue {
  type: string;
  line: number;
  size: number;
  position: number;
  text: string;
  textAlignment: string;
}

export interface TextMetadataCue {
  type: string;
  text: string;
  textDescription: string;
}

export interface Source {
  getId: () => number;
  getUri: () => string;
}

export interface IVSPlayerRef {
  preload: (url: string) => Source;
  loadSource: (source: Source) => void;
  releaseSource: (source: Source) => void;
  play: () => void;
  pause: () => void;
  seekTo: (position: number) => void;
  setOrigin: (origin: string) => void;
  togglePip: () => void;
}

export type ResizeMode = 'aspectFill' | 'aspectFit' | 'aspectZoom';