import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import IVSPlayer, { 
  IVSPlayerRef, 
  PlayerState, 
  Quality,
  ResizeMode,
  LogLevel,
  PlayerData,
  VideoData,
  TextCue,
  TextMetadataCue
} from 'expo-ivs-player';

const SAMPLE_STREAM_URL = 'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8';

export default function App() {
  const playerRef = useRef<IVSPlayerRef>(null);
  const [streamUrl, setStreamUrl] = useState(SAMPLE_STREAM_URL);
  const [inputUrl, setInputUrl] = useState(SAMPLE_STREAM_URL);
  
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.Idle);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('aspectFit');
  
  // Player info
  const [duration, setDuration] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [currentQuality, setCurrentQuality] = useState<Quality | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [version, setVersion] = useState('');
  const [videoStats, setVideoStats] = useState<VideoData | null>(null);
  
  // Event handlers
  const handlePlayerStateChange = useCallback((state: PlayerState) => {
    console.log('Player state changed:', state);
    setPlayerState(state);
  }, []);

  const handleData = useCallback((data: PlayerData) => {
    console.log('Player data:', data);
    setQualities(data.qualities);
    setSessionId(data.sessionId);
    setVersion(data.version);
  }, []);

  const handleVideoStatistics = useCallback((data: VideoData) => {
    setVideoStats(data);
  }, []);

  const handleDurationChange = useCallback((newDuration: number | null) => {
    console.log('Duration changed:', newDuration);
    setDuration(newDuration);
  }, []);

  const handleQualityChange = useCallback((quality: Quality | null) => {
    console.log('Quality changed:', quality);
    setCurrentQuality(quality);
  }, []);

  const handleProgress = useCallback((position: number) => {
    setProgress(position);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Player error:', error);
    Alert.alert('Player Error', error);
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('Load started');
  }, []);

  const handleLoad = useCallback((loadDuration: number | null) => {
    console.log('Loaded with duration:', loadDuration);
  }, []);

  const handleTextCue = useCallback((cue: TextCue) => {
    console.log('Text cue:', cue);
  }, []);

  const handleTextMetadataCue = useCallback((cue: TextMetadataCue) => {
    console.log('Text metadata cue:', cue);
  }, []);

  const handlePipChange = useCallback((isActive: boolean) => {
    console.log('PiP active:', isActive);
  }, []);

  const handleSeek = useCallback((position: number) => {
    console.log('Seeked to:', position);
  }, []);

  // Control functions
  const loadNewStream = () => {
    setStreamUrl(inputUrl);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const seekForward = () => {
    if (playerRef.current && duration) {
      const newPosition = Math.min(progress + 10, duration);
      playerRef.current.seekTo(newPosition);
    }
  };

  const seekBackward = () => {
    if (playerRef.current) {
      const newPosition = Math.max(progress - 10, 0);
      playerRef.current.seekTo(newPosition);
    }
  };

  const togglePip = () => {
    if (playerRef.current) {
      playerRef.current.togglePip();
    }
  };

  const cycleResizeMode = () => {
    const modes: ResizeMode[] = ['aspectFit', 'aspectFill', 'aspectZoom'];
    const currentIndex = modes.indexOf(resizeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setResizeMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.playerContainer}>
        <IVSPlayer
          ref={playerRef}
          style={styles.player}
          streamUrl={streamUrl}
          paused={paused}
          muted={muted}
          volume={volume}
          playbackRate={playbackRate}
          loop={loop}
          autoplay={autoplay}
          resizeMode={resizeMode}
          pipEnabled={pipEnabled}
          progressInterval={1}
          logLevel={LogLevel.IVSLogLevelWarning}
          liveLowLatency={true}
          onPlayerStateChange={handlePlayerStateChange}
          onData={handleData}
          onVideoStatistics={handleVideoStatistics}
          onDurationChange={handleDurationChange}
          onQualityChange={handleQualityChange}
          onProgress={handleProgress}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onTextCue={handleTextCue}
          onTextMetadataCue={handleTextMetadataCue}
          onPipChange={handlePipChange}
          onSeek={handleSeek}
        />
        
        <View style={styles.overlay}>
          <Text style={styles.stateText}>State: {playerState}</Text>
          {duration && (
            <Text style={styles.timeText}>
              {formatTime(progress)} / {formatTime(duration)}
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.controls} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stream URL</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="Enter stream URL"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Load Stream" onPress={loadNewStream} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback Controls</Text>
          <View style={styles.buttonRow}>
            <Button title="⏪ -10s" onPress={seekBackward} />
            <Button title={paused ? "▶️ Play" : "⏸ Pause"} onPress={togglePlayPause} />
            <Button title="⏩ +10s" onPress={seekForward} />
          </View>
          {Platform.OS === 'ios' && (
            <Button title="📱 Toggle PiP" onPress={togglePip} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.setting}>
            <Text>Muted</Text>
            <Switch value={muted} onValueChange={setMuted} />
          </View>
          
          <View style={styles.setting}>
            <Text>Loop</Text>
            <Switch value={loop} onValueChange={setLoop} />
          </View>
          
          <View style={styles.setting}>
            <Text>Autoplay</Text>
            <Switch value={autoplay} onValueChange={setAutoplay} />
          </View>
          
          {Platform.OS === 'ios' && (
            <View style={styles.setting}>
              <Text>PiP Enabled</Text>
              <Switch value={pipEnabled} onValueChange={setPipEnabled} />
            </View>
          )}
          
          <View style={styles.setting}>
            <Text>Resize Mode: {resizeMode}</Text>
            <Button title="Change" onPress={cycleResizeMode} />
          </View>
          
          <View style={styles.setting}>
            <Text>Volume: {Math.round(volume * 100)}%</Text>
            <View style={styles.buttonRow}>
              <Button title="-" onPress={() => setVolume(Math.max(0, volume - 0.1))} />
              <Button title="+" onPress={() => setVolume(Math.min(1, volume + 0.1))} />
            </View>
          </View>
          
          <View style={styles.setting}>
            <Text>Playback Rate: {playbackRate}x</Text>
            <View style={styles.buttonRow}>
              <Button title="0.5x" onPress={() => setPlaybackRate(0.5)} />
              <Button title="1x" onPress={() => setPlaybackRate(1)} />
              <Button title="1.5x" onPress={() => setPlaybackRate(1.5)} />
              <Button title="2x" onPress={() => setPlaybackRate(2)} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Info</Text>
          <Text style={styles.infoText}>Session ID: {sessionId}</Text>
          <Text style={styles.infoText}>Version: {version}</Text>
          {currentQuality && (
            <>
              <Text style={styles.infoText}>
                Quality: {currentQuality.name} ({currentQuality.width}x{currentQuality.height})
              </Text>
              <Text style={styles.infoText}>
                Bitrate: {Math.round(currentQuality.bitrate / 1000)} kbps
              </Text>
            </>
          )}
          {videoStats && (
            <>
              <Text style={styles.infoText}>
                Frames Decoded: {videoStats.framesDecoded}
              </Text>
              <Text style={styles.infoText}>
                Frames Dropped: {videoStats.framesDropped}
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Qualities</Text>
          {qualities.map((quality, index) => (
            <Text key={index} style={styles.infoText}>
              {quality.name}: {quality.width}x{quality.height} @ {Math.round(quality.bitrate / 1000)} kbps
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  playerContainer: {
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  player: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  timeText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
  },
  controls: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoText: {
    paddingVertical: 2,
    color: '#666',
  },
});