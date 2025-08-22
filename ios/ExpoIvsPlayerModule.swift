import ExpoModulesCore

public class ExpoIvsPlayerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoIvsPlayer")
    
    View(ExpoIvsPlayerView.self) {
      // Events
      Events([
        "onSeek",
        "onData",
        "onVideoStatistics",
        "onPlayerStateChange",
        "onDurationChange",
        "onQualityChange",
        "onPipChange",
        "onRebuffering",
        "onLoadStart",
        "onLoad",
        "onLiveLatencyChange",
        "onTextCue",
        "onTextMetadataCue",
        "onProgress",
        "onError",
        "onTimePoint"
      ])
      
      // Properties
      Prop("streamUrl") { (view: ExpoIvsPlayerView, streamUrl: String?) in
        view.streamUrl = streamUrl
      }
      
      Prop("paused") { (view: ExpoIvsPlayerView, paused: Bool) in
        view.paused = paused
      }
      
      Prop("muted") { (view: ExpoIvsPlayerView, muted: Bool) in
        view.muted = muted
      }
      
      Prop("volume") { (view: ExpoIvsPlayerView, volume: Float) in
        view.volume = volume
      }
      
      Prop("playbackRate") { (view: ExpoIvsPlayerView, playbackRate: Float) in
        view.playbackRate = playbackRate
      }
      
      Prop("autoplay") { (view: ExpoIvsPlayerView, autoplay: Bool) in
        view.autoplay = autoplay
      }
      
      Prop("loop") { (view: ExpoIvsPlayerView, loop: Bool) in
        view.loop = loop
      }
      
      Prop("liveLowLatency") { (view: ExpoIvsPlayerView, liveLowLatency: Bool) in
        view.liveLowLatency = liveLowLatency
      }
      
      Prop("rebufferToLive") { (view: ExpoIvsPlayerView, rebufferToLive: Bool) in
        view.rebufferToLive = rebufferToLive
      }
      
      Prop("resizeMode") { (view: ExpoIvsPlayerView, resizeMode: String) in
        view.resizeMode = resizeMode
        view.setupVideoGravity()
      }
      
      Prop("progressInterval") { (view: ExpoIvsPlayerView, progressInterval: Double) in
        view.progressInterval = progressInterval
      }
      
      Prop("pipEnabled") { (view: ExpoIvsPlayerView, pipEnabled: Bool) in
        view.pipEnabled = pipEnabled
        view.setupPictureInPicture()
      }
      
      Prop("logLevel") { (view: ExpoIvsPlayerView, logLevel: String) in
        view.logLevel = logLevel
      }
      
      Prop("maxBitrate") { (view: ExpoIvsPlayerView, maxBitrate: Int) in
        view.maxBitrate = maxBitrate
      }
      
      Prop("initialBufferDuration") { (view: ExpoIvsPlayerView, initialBufferDuration: Double) in
        view.initialBufferDuration = initialBufferDuration
      }
      
      Prop("autoQualityMode") { (view: ExpoIvsPlayerView, autoQualityMode: Bool) in
        view.autoQualityMode = autoQualityMode
      }
      
      Prop("showControls") { (view: ExpoIvsPlayerView, showControls: Bool) in
        view.showControls = showControls
      }
      
      // Commands
      AsyncFunction("preload") { (view: ExpoIvsPlayerView, url: String, sourceId: Int) in
        view.preload(url: url, sourceId: sourceId)
      }
      
      AsyncFunction("loadSource") { (view: ExpoIvsPlayerView, sourceId: Int) in
        view.loadSource(sourceId: sourceId)
      }
      
      AsyncFunction("releaseSource") { (view: ExpoIvsPlayerView, sourceId: Int) in
        view.releaseSource(sourceId: sourceId)
      }
      
      AsyncFunction("play") { (view: ExpoIvsPlayerView) in
        view.play()
      }
      
      AsyncFunction("pause") { (view: ExpoIvsPlayerView) in
        view.pause()
      }
      
      AsyncFunction("seekTo") { (view: ExpoIvsPlayerView, position: Double) in
        view.seekTo(position: position)
      }
      
      AsyncFunction("setOrigin") { (view: ExpoIvsPlayerView, origin: String) in
        view.setOrigin(origin: origin)
      }
      
      AsyncFunction("togglePip") { (view: ExpoIvsPlayerView) in
        view.togglePip()
      }
    }
  }
}