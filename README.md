# expo-ivs-player

An Expo module for Amazon Interactive Video Service (IVS) player, providing a complete React Native interface matching the official `amazon-ivs-react-native-player`.

## Features

- 🎥 Full IVS player functionality for iOS and Android
- 📱 Picture-in-Picture support (iOS)
- 🎨 Multiple resize modes (aspectFit, aspectFill, aspectZoom)
- 📊 Quality management and statistics
- 🎮 Complete playback controls
- 📝 Text and metadata cue support
- ⚡ Low latency streaming support
- 🔧 Configurable IVS SDK versions

## Installation

```bash
npm install expo-ivs-player
# or
yarn add expo-ivs-player
```

### iOS Setup

Add to your `ios/Podfile` or set environment variable to configure IVS SDK version:

```ruby
ENV['IVS_PLAYER_VERSION'] = '~> 1.30.0'  # Optional, defaults to 1.30.0
```

Then run:

```bash
cd ios && pod install
```

### Android Setup

Add to your `android/build.gradle` to configure IVS SDK version:

```gradle
ext {
    ivsPlayerVersion = "1.30.0"  // Optional, defaults to 1.30.0
}
```

## Usage

```tsx
import IVSPlayer, { IVSPlayerRef, PlayerState, LogLevel } from 'expo-ivs-player';

function App() {
  const playerRef = useRef<IVSPlayerRef>(null);
  const [paused, setPaused] = useState(false);

  const handlePlayerStateChange = (state: PlayerState) => {
    console.log('Player state:', state);
  };

  const handleError = (error: string) => {
    console.error('Player error:', error);
  };

  return (
    <IVSPlayer
      ref={playerRef}
      streamUrl="https://your-stream-url.m3u8"
      paused={paused}
      muted={false}
      autoplay={true}
      resizeMode="aspectFit"
      onPlayerStateChange={handlePlayerStateChange}
      onError={handleError}
    />
  );
}
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `streamUrl` | `string` | - | The URL of the stream to play |
| `paused` | `boolean` | `false` | Whether the player is paused |
| `muted` | `boolean` | `false` | Whether the player is muted |
| `volume` | `number` | `1.0` | Volume level (0.0 to 1.0) |
| `playbackRate` | `number` | `1.0` | Playback speed multiplier |
| `loop` | `boolean` | `false` | Whether to loop playback |
| `autoplay` | `boolean` | `false` | Whether to autoplay when ready |
| `resizeMode` | `ResizeMode` | `'aspectFit'` | Video resize mode |
| `liveLowLatency` | `boolean` | `true` | Enable low latency mode |
| `rebufferToLive` | `boolean` | `false` | Rebuffer to live edge |
| `progressInterval` | `number` | `1.0` | Progress update interval in seconds |
| `pipEnabled` | `boolean` | `false` | Enable PiP support (iOS only) |
| `logLevel` | `LogLevel` | `'IVSLogLevelError'` | Logging level |
| `maxBitrate` | `number` | `0` | Maximum bitrate (0 = unlimited) |
| `initialBufferDuration` | `number` | `0` | Initial buffer duration |
| `autoQualityMode` | `boolean` | `true` | Enable automatic quality switching |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onPlayerStateChange` | `PlayerState` | Player state changed |
| `onData` | `PlayerData` | Player data available |
| `onVideoStatistics` | `VideoData` | Video statistics updated |
| `onDurationChange` | `number \| null` | Duration changed |
| `onQualityChange` | `Quality \| null` | Quality changed |
| `onProgress` | `number` | Progress updated |
| `onError` | `string` | Error occurred |
| `onLoadStart` | - | Loading started |
| `onLoad` | `number \| null` | Loading completed |
| `onSeek` | `number` | Seek completed |
| `onPipChange` | `boolean` | PiP state changed |
| `onRebuffering` | - | Rebuffering started |
| `onLiveLatencyChange` | `number` | Live latency changed |
| `onTextCue` | `TextCue` | Text cue received |
| `onTextMetadataCue` | `TextMetadataCue` | Metadata cue received |
| `onTimePoint` | `number` | Time point reached |

### Methods (via ref)

```tsx
const playerRef = useRef<IVSPlayerRef>(null);

// Play/pause
playerRef.current?.play();
playerRef.current?.pause();

// Seek
playerRef.current?.seekTo(30); // Seek to 30 seconds

// Source management
const source = playerRef.current?.preload(url);
playerRef.current?.loadSource(source);
playerRef.current?.releaseSource(source);

// PiP toggle (iOS only)
playerRef.current?.togglePip();

// Set origin for CORS
playerRef.current?.setOrigin('https://example.com');
```

## Types

### PlayerState

```tsx
enum PlayerState {
  Idle = 'Idle',
  Ready = 'Ready',
  Buffering = 'Buffering',
  Playing = 'Playing',
  Ended = 'Ended',
}
```

### ResizeMode

```tsx
type ResizeMode = 'aspectFill' | 'aspectFit' | 'aspectZoom';
```

### LogLevel

```tsx
enum LogLevel {
  IVSLogLevelDebug = 'IVSLogLevelDebug',
  IVSLogLevelInfo = 'IVSLogLevelInfo',
  IVSLogLevelWarning = 'IVSLogLevelWarning',
  IVSLogLevelError = 'IVSLogLevelError',
}
```

### Quality

```tsx
interface Quality {
  name: string;
  codecs: string;
  bitrate: number;
  framerate: number;
  width: number;
  height: number;
}
```

### PlayerData

```tsx
interface PlayerData {
  qualities: Quality[];
  version: string;
  sessionId: string;
}
```

## Platform Support

| Platform | Supported | Notes |
|----------|-----------|-------|
| iOS | ✅ | iOS 15.1+ required |
| Android | ✅ | Android SDK 21+ required |
| Web | ⚠️ | Basic iframe fallback |

## Example

See the [example](./example) directory for a complete example app demonstrating all features.

## Troubleshooting

### iOS Build Issues

1. Ensure you've run `pod install` after installation
2. Check that your iOS deployment target is 15.1 or higher
3. Verify the IVS SDK is properly linked

### Android Build Issues

1. Ensure your `minSdkVersion` is 21 or higher
2. Check that the IVS SDK dependency is resolved
3. Verify Kotlin is properly configured

### Player Not Loading

1. Check the stream URL is valid and accessible
2. Verify network permissions are granted
3. Check console logs for error messages

## License

MIT

## Credits

This module provides an Expo-compatible interface matching the [amazon-ivs-react-native-player](https://github.com/aws/amazon-ivs-react-native-player) API.