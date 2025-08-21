import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { ViewStyle, NativeModules } from "react-native";
import { requireNativeViewManager } from "expo-modules-core";
import {
  Quality,
  PlayerData,
  VideoData,
  TextCue,
  TextMetadataCue,
  Source,
  IVSPlayerRef,
  ResizeMode,
} from "./types";
import { LogLevel, PlayerState } from "./enums";

export interface IVSPlayerProps {
  style?: ViewStyle;
  testID?: string;
  paused?: boolean;
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  streamUrl?: string;
  liveLowLatency?: boolean;
  rebufferToLive?: boolean;
  playbackRate?: number;
  logLevel?: LogLevel;
  resizeMode?: ResizeMode;
  progressInterval?: number;
  volume?: number;
  quality?: Quality | null;
  autoMaxQuality?: Quality | null;
  autoQualityMode?: boolean;
  breakpoints?: number[];
  maxBitrate?: number;
  initialBufferDuration?: number;
  pipEnabled?: boolean;

  onSeek?: (position: number) => void;
  onData?: (data: PlayerData) => void;
  onVideoStatistics?: (data: VideoData) => void;
  onPlayerStateChange?: (state: PlayerState) => void;
  onDurationChange?: (duration: number | null) => void;
  onQualityChange?: (quality: Quality | null) => void;
  onPipChange?: (isActive: boolean) => void;
  onRebuffering?: () => void;
  onLoadStart?: () => void;
  onLoad?: (duration: number | null) => void;
  onLiveLatencyChange?: (liveLatency: number) => void;
  onTextCue?: (textCue: TextCue) => void;
  onTextMetadataCue?: (textMetadataCue: TextMetadataCue) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
  onTimePoint?: (position: number) => void;
}

const ExpoIvsPlayerView = requireNativeViewManager("ExpoIvsPlayer");
const ExpoIvsPlayerModule = NativeModules.ExpoIvsPlayer;

const IVSPlayer = forwardRef<IVSPlayerRef, IVSPlayerProps>((props, ref) => {
  const nativeRef = useRef<any>(null);
  const sourceIdCounter = useRef(0);
  const sources = useRef<Map<number, Source>>(new Map());

  const dispatchCommand = async (commandName: string, args: any[] = []) => {
    if (!ExpoIvsPlayerModule || !ExpoIvsPlayerModule[commandName]) {
      console.warn(`ExpoIvsPlayer: Command ${commandName} not available`);
      return;
    }

    const viewTag = nativeRef.current?._nativeTag;
    if (!viewTag) {
      console.warn("ExpoIvsPlayer: Native view not ready");
      return;
    }

    try {
      await ExpoIvsPlayerModule[commandName](viewTag, ...args);
    } catch (error) {
      console.error(`ExpoIvsPlayer: Error calling ${commandName}:`, error);
    }
  };

  useImperativeHandle(ref, () => ({
    preload: (url: string) => {
      const id = sourceIdCounter.current++;
      const source: Source = {
        getId: () => id,
        getUri: () => url,
      };
      sources.current.set(id, source);
      dispatchCommand("preload", [url, id]);
      return source;
    },
    loadSource: (source: Source) => {
      dispatchCommand("loadSource", [source.getId()]);
    },
    releaseSource: (source: Source) => {
      const id = source.getId();
      sources.current.delete(id);
      dispatchCommand("releaseSource", [id]);
    },
    play: () => {
      dispatchCommand("play");
    },
    pause: () => {
      dispatchCommand("pause");
    },
    seekTo: (position: number) => {
      dispatchCommand("seekTo", [position]);
    },
    setOrigin: (origin: string) => {
      dispatchCommand("setOrigin", [origin]);
    },
    togglePip: () => {
      dispatchCommand("togglePip");
    },
  }));

  // Process event handlers
  const processedProps = {
    ...props,
    onSeek: props.onSeek
      ? (event: any) => props.onSeek!(event.nativeEvent.position)
      : undefined,
    onData: props.onData
      ? (event: any) => props.onData!(event.nativeEvent)
      : undefined,
    onVideoStatistics: props.onVideoStatistics
      ? (event: any) => props.onVideoStatistics!(event.nativeEvent)
      : undefined,
    onPlayerStateChange: props.onPlayerStateChange
      ? (event: any) => props.onPlayerStateChange!(event.nativeEvent.state)
      : undefined,
    onDurationChange: props.onDurationChange
      ? (event: any) => props.onDurationChange!(event.nativeEvent.duration)
      : undefined,
    onQualityChange: props.onQualityChange
      ? (event: any) => props.onQualityChange!(event.nativeEvent.quality)
      : undefined,
    onPipChange: props.onPipChange
      ? (event: any) => props.onPipChange!(event.nativeEvent.isActive)
      : undefined,
    onRebuffering: props.onRebuffering
      ? (event: any) => props.onRebuffering!()
      : undefined,
    onLoadStart: props.onLoadStart
      ? (event: any) => props.onLoadStart!()
      : undefined,
    onLoad: props.onLoad
      ? (event: any) => props.onLoad!(event.nativeEvent.duration)
      : undefined,
    onLiveLatencyChange: props.onLiveLatencyChange
      ? (event: any) =>
          props.onLiveLatencyChange!(event.nativeEvent.liveLatency)
      : undefined,
    onTextCue: props.onTextCue
      ? (event: any) => props.onTextCue!(event.nativeEvent)
      : undefined,
    onTextMetadataCue: props.onTextMetadataCue
      ? (event: any) => props.onTextMetadataCue!(event.nativeEvent)
      : undefined,
    onProgress: props.onProgress
      ? (event: any) => props.onProgress!(event.nativeEvent.progress)
      : undefined,
    onError: props.onError
      ? (event: any) => props.onError!(event.nativeEvent.error)
      : undefined,
    onTimePoint: props.onTimePoint
      ? (event: any) => props.onTimePoint!(event.nativeEvent.position)
      : undefined,
  };

  return (
    <ExpoIvsPlayerView
      ref={nativeRef}
      style={props.style}
      {...processedProps}
    />
  );
});

IVSPlayer.displayName = "IVSPlayer";

export default IVSPlayer;
