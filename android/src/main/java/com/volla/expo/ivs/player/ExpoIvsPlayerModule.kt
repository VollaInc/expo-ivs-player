package com.volla.expo.ivs.player

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoIvsPlayerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoIvsPlayer")
    
    View(ExpoIvsPlayerView::class) {
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
      Prop("streamUrl") { view: ExpoIvsPlayerView, streamUrl: String? ->
        view.streamUrl = streamUrl
      }
      
      Prop("paused") { view: ExpoIvsPlayerView, paused: Boolean ->
        view.paused = paused
      }
      
      Prop("muted") { view: ExpoIvsPlayerView, muted: Boolean ->
        view.muted = muted
      }
      
      Prop("volume") { view: ExpoIvsPlayerView, volume: Float ->
        view.volume = volume
      }
      
      Prop("playbackRate") { view: ExpoIvsPlayerView, playbackRate: Float ->
        view.playbackRate = playbackRate
      }
      
      Prop("autoplay") { view: ExpoIvsPlayerView, autoplay: Boolean ->
        view.autoplay = autoplay
      }
      
      Prop("loop") { view: ExpoIvsPlayerView, loop: Boolean ->
        view.loop = loop
      }
      
      Prop("liveLowLatency") { view: ExpoIvsPlayerView, liveLowLatency: Boolean ->
        view.liveLowLatency = liveLowLatency
      }
      
      Prop("rebufferToLive") { view: ExpoIvsPlayerView, rebufferToLive: Boolean ->
        view.rebufferToLive = rebufferToLive
      }
      
      Prop("resizeMode") { view: ExpoIvsPlayerView, resizeMode: String ->
        view.resizeMode = resizeMode
      }
      
      Prop("progressInterval") { view: ExpoIvsPlayerView, progressInterval: Double ->
        view.progressInterval = progressInterval
      }
      
      Prop("pipEnabled") { view: ExpoIvsPlayerView, pipEnabled: Boolean ->
        view.pipEnabled = pipEnabled
      }
      
      Prop("logLevel") { view: ExpoIvsPlayerView, logLevel: String ->
        view.logLevel = logLevel
      }
      
      Prop("maxBitrate") { view: ExpoIvsPlayerView, maxBitrate: Int ->
        view.maxBitrate = maxBitrate
      }
      
      Prop("initialBufferDuration") { view: ExpoIvsPlayerView, initialBufferDuration: Double ->
        view.initialBufferDuration = initialBufferDuration
      }
      
      Prop("autoQualityMode") { view: ExpoIvsPlayerView, autoQualityMode: Boolean ->
        view.autoQualityMode = autoQualityMode
      }
      
      // Commands
      AsyncFunction("preload") { view: ExpoIvsPlayerView, url: String, sourceId: Int ->
        view.preload(url, sourceId)
      }
      
      AsyncFunction("loadSource") { view: ExpoIvsPlayerView, sourceId: Int ->
        view.loadSource(sourceId)
      }
      
      AsyncFunction("releaseSource") { view: ExpoIvsPlayerView, sourceId: Int ->
        view.releaseSource(sourceId)
      }
      
      AsyncFunction("play") { view: ExpoIvsPlayerView ->
        view.play()
      }
      
      AsyncFunction("pause") { view: ExpoIvsPlayerView ->
        view.pause()
      }
      
      AsyncFunction("seekTo") { view: ExpoIvsPlayerView, position: Double ->
        view.seekTo(position)
      }
      
      AsyncFunction("setOrigin") { view: ExpoIvsPlayerView, origin: String ->
        view.setOrigin(origin)
      }
      
      AsyncFunction("togglePip") { view: ExpoIvsPlayerView ->
        view.togglePip()
      }
    }
  }
}
