import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { ViewStyle, requireNativeComponent, UIManager, findNodeHandle, Platform } from 'react-native';
import { 
  Quality, 
  PlayerData, 
  VideoData, 
  TextCue, 
  TextMetadataCue, 
  Source, 
  IVSPlayerRef, 
  ResizeMode 
} from './types';
import { LogLevel, PlayerState } from './enums';

const LINKING_ERROR =
  `The package 'expo-ivs-player' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ComponentName = 'ExpoIvsPlayerView';

const ExpoIvsPlayerView =
  UIManager.getViewManagerConfig?.(ComponentName) != null
    ? requireNativeComponent<NativeProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

interface NativeProps extends IVSPlayerProps {
  ref?: React.Ref<any>;
}

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

const IVSPlayer = forwardRef<IVSPlayerRef, IVSPlayerProps>((props, ref) => {
  const nativeRef = useRef<any>(null);
  const sourceIdCounter = useRef(0);
  const sources = useRef<Map<number, Source>>(new Map());

  const dispatchCommand = (commandName: string, args: any[] = []) => {
    if (nativeRef.current) {
      const handle = findNodeHandle(nativeRef.current);
      if (handle) {
        UIManager.dispatchViewManagerCommand(handle, commandName, args);
      }
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
      dispatchCommand('preload', [url, id]);
      return source;
    },
    loadSource: (source: Source) => {
      dispatchCommand('loadSource', [source.getId()]);
    },
    releaseSource: (source: Source) => {
      const id = source.getId();
      sources.current.delete(id);
      dispatchCommand('releaseSource', [id]);
    },
    play: () => {
      dispatchCommand('play');
    },
    pause: () => {
      dispatchCommand('pause');
    },
    seekTo: (position: number) => {
      dispatchCommand('seekTo', [position]);
    },
    setOrigin: (origin: string) => {
      dispatchCommand('setOrigin', [origin]);
    },
    togglePip: () => {
      dispatchCommand('togglePip');
    },
  }));

  useEffect(() => {
    if (props.streamUrl && props.autoplay) {
      // Auto-play logic will be handled by native module
    }
  }, [props.streamUrl, props.autoplay]);

  return (
    <ExpoIvsPlayerView
      ref={nativeRef}
      style={props.style}
      testID={props.testID}
      paused={props.paused}
      muted={props.muted}
      loop={props.loop}
      autoplay={props.autoplay}
      streamUrl={props.streamUrl}
      liveLowLatency={props.liveLowLatency}
      rebufferToLive={props.rebufferToLive}
      playbackRate={props.playbackRate}
      logLevel={props.logLevel}
      resizeMode={props.resizeMode}
      progressInterval={props.progressInterval}
      volume={props.volume}
      quality={props.quality}
      autoMaxQuality={props.autoMaxQuality}
      autoQualityMode={props.autoQualityMode}
      breakpoints={props.breakpoints}
      maxBitrate={props.maxBitrate}
      initialBufferDuration={props.initialBufferDuration}
      pipEnabled={props.pipEnabled}
      onSeek={props.onSeek}
      onData={props.onData}
      onVideoStatistics={props.onVideoStatistics}
      onPlayerStateChange={props.onPlayerStateChange}
      onDurationChange={props.onDurationChange}
      onQualityChange={props.onQualityChange}
      onPipChange={props.onPipChange}
      onRebuffering={props.onRebuffering}
      onLoadStart={props.onLoadStart}
      onLoad={props.onLoad}
      onLiveLatencyChange={props.onLiveLatencyChange}
      onTextCue={props.onTextCue}
      onTextMetadataCue={props.onTextMetadataCue}
      onProgress={props.onProgress}
      onError={props.onError}
      onTimePoint={props.onTimePoint}
    />
  );
});

IVSPlayer.displayName = 'IVSPlayer';

export default IVSPlayer;