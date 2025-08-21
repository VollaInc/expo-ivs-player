package com.volla.expo.ivs.player

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import com.amazonaws.ivs.player.*
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.*

class ExpoIvsPlayerView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  
  // Event dispatchers
  private val onSeek by EventDispatcher()
  private val onData by EventDispatcher()
  private val onVideoStatistics by EventDispatcher()
  private val onPlayerStateChange by EventDispatcher()
  private val onDurationChange by EventDispatcher()
  private val onQualityChange by EventDispatcher()
  private val onPipChange by EventDispatcher()
  private val onRebuffering by EventDispatcher()
  private val onLoadStart by EventDispatcher()
  private val onLoad by EventDispatcher()
  private val onLiveLatencyChange by EventDispatcher()
  private val onTextCue by EventDispatcher()
  private val onTextMetadataCue by EventDispatcher()
  private val onProgress by EventDispatcher()
  private val onError by EventDispatcher()
  private val onTimePoint by EventDispatcher()
  
  // IVS Player components
  private var playerView: PlayerView? = null
  private var player: Player? = null
  private var progressTimer: Timer? = null
  private val sources = mutableMapOf<Int, String>()
  private val handler = Handler(Looper.getMainLooper())
  
  // Properties
  var streamUrl: String? = null
    set(value) {
      field = value
      value?.let { loadStream(it) }
    }
  
  var paused: Boolean = false
    set(value) {
      field = value
      updatePlayPauseState()
    }
  
  var muted: Boolean = false
    set(value) {
      field = value
      player?.isMuted = value
    }
  
  var volume: Float = 1.0f
    set(value) {
      field = value
      player?.volume = value
    }
  
  var playbackRate: Float = 1.0f
    set(value) {
      field = value
      player?.playbackRate = value
    }
  
  var autoplay: Boolean = false
  var loop: Boolean = false
  var liveLowLatency: Boolean = true
  var rebufferToLive: Boolean = false
  var resizeMode: String = "aspectFit"
    set(value) {
      field = value
      setupVideoScaling()
    }
  
  var progressInterval: Double = 1.0
  var pipEnabled: Boolean = false
  var logLevel: String = "ERROR"
  var maxBitrate: Int = 0
  var initialBufferDuration: Double = 0.0
  var autoQualityMode: Boolean = true
  
  init {
    setupPlayer()
  }
  
  private fun setupPlayer() {
    try {
      // Create player view
      playerView = PlayerView(context)
      playerView?.layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      
      // Create player
      player = Player.create(context)
      playerView?.player = player
      
      // Add player view to this view
      playerView?.let { addView(it) }
      
      // Setup player listeners
      setupPlayerListeners()
      setupVideoScaling()
      
    } catch (e: Exception) {
      Log.e("ExpoIvsPlayerView", "Error setting up player: ${e.message}")
      onError(mapOf("error" to "Player setup failed: ${e.message}"))
    }
  }
  
  private fun setupPlayerListeners() {
    player?.let { player ->
      
      // Player state listener
      player.addListener(object : Player.Listener {
        override fun onStateChanged(state: Player.State) {
          val stateString = when (state) {
            Player.State.IDLE -> {
              stopProgressTimer()
              "Idle"
            }
            Player.State.READY -> {
              onLoad(mapOf("duration" to player.duration))
              
              // Send data event with qualities and session info
              val qualities = player.qualities.map { quality ->
                mapOf(
                  "name" to quality.name,
                  "codecs" to quality.codecs,
                  "bitrate" to quality.bitrate,
                  "framerate" to (quality.framerate ?: 0f),
                  "width" to (quality.width ?: 0),
                  "height" to (quality.height ?: 0)
                )
              }
              
              onData(mapOf(
                "qualities" to qualities,
                "version" to player.version,
                "sessionId" to (player.sessionId ?: "")
              ))
              
              if (autoplay && !paused) {
                player.play()
              }
              "Ready"
            }
            Player.State.BUFFERING -> {
              onRebuffering(emptyMap())
              "Buffering"
            }
            Player.State.PLAYING -> {
              startProgressTimer()
              "Playing"
            }
            Player.State.ENDED -> {
              stopProgressTimer()
              if (loop) {
                player.seekTo(0L)
                player.play()
              }
              "Ended"
            }
          }
          
          onPlayerStateChange(mapOf("state" to stateString))
        }
        
        override fun onDurationChanged(duration: Long) {
          val durationSeconds = if (duration >= 0) duration / 1000.0 else null
          onDurationChange(mapOf("duration" to durationSeconds))
        }
        
        override fun onQualityChanged(quality: Quality?) {
          if (quality != null) {
            onQualityChange(mapOf(
              "name" to quality.name,
              "codecs" to quality.codecs,
              "bitrate" to quality.bitrate,
              "framerate" to (quality.framerate ?: 0f),
              "width" to (quality.width ?: 0),
              "height" to (quality.height ?: 0)
            ))
          } else {
            onQualityChange(mapOf("quality" to null))
          }
        }
        
        override fun onError(exception: PlayerException) {
          this@ExpoIvsPlayerView.onError(mapOf("error" to exception.errorMessage))
        }
        
        override fun onRebuffering() {
          onRebuffering(emptyMap())
        }
        
        override fun onSeekCompleted(position: Long) {
          onSeek(mapOf("position" to position / 1000.0))
        }
        
        override fun onVideoStatistics(statistics: VideoStatistics) {
          onVideoStatistics(mapOf(
            "bitrate" to statistics.bitrate,
            "duration" to (statistics.duration ?: 0L) / 1000.0,
            "framesDecoded" to (statistics.framesDecoded ?: 0L),
            "framesDropped" to (statistics.framesDropped ?: 0L)
          ))
        }
        
        override fun onCue(cue: Cue) {
          when (cue) {
            is TextCue -> {
              onTextCue(mapOf(
                "type" to "text",
                "text" to cue.text,
                "line" to cue.line,
                "size" to cue.size,
                "position" to cue.position,
                "textAlignment" to cue.textAlignment.name
              ))
            }
            is TextMetadataCue -> {
              onTextMetadataCue(mapOf(
                "type" to "metadata",
                "text" to (cue.text ?: ""),
                "textDescription" to (cue.textDescription ?: "")
              ))
            }
          }
        }
        
        override fun onMetadata(type: String, data: String) {
          // Handle metadata if needed
        }
        
        override fun onLiveLatencyChanged(latency: Long) {
          onLiveLatencyChange(mapOf("latency" to latency))
        }
      })
    }
  }
  
  private fun setupVideoScaling() {
    playerView?.let { view ->
      when (resizeMode) {
        "aspectFill" -> view.videoScaleType = PlayerView.VideoScaleType.ZOOM
        "aspectFit" -> view.videoScaleType = PlayerView.VideoScaleType.FIT
        "aspectZoom" -> view.videoScaleType = PlayerView.VideoScaleType.FILL
        else -> view.videoScaleType = PlayerView.VideoScaleType.FIT
      }
    }
  }
  
  private fun loadStream(urlString: String) {
    try {
      onLoadStart(emptyMap())
      val uri = android.net.Uri.parse(urlString)
      player?.load(uri)
    } catch (e: Exception) {
      onError(mapOf("error" to "Invalid URL: $urlString"))
    }
  }
  
  private fun updatePlayPauseState() {
    if (paused) {
      player?.pause()
    } else {
      player?.play()
    }
  }
  
  private fun startProgressTimer() {
    stopProgressTimer()
    progressTimer = Timer()
    progressTimer?.scheduleAtFixedRate(object : TimerTask() {
      override fun run() {
        player?.let { player ->
          handler.post {
            val position = player.position / 1000.0
            onProgress(mapOf("progress" to position))
          }
        }
      }
    }, 0, (progressInterval * 1000).toLong())
  }
  
  private fun stopProgressTimer() {
    progressTimer?.cancel()
    progressTimer = null
  }
  
  // MARK: - Commands
  
  fun preload(url: String, sourceId: Int) {
    sources[sourceId] = url
  }
  
  fun loadSource(sourceId: Int) {
    sources[sourceId]?.let { url ->
      loadStream(url)
    }
  }
  
  fun releaseSource(sourceId: Int) {
    sources.remove(sourceId)
  }
  
  fun play() {
    player?.play()
  }
  
  fun pause() {
    player?.pause()
  }
  
  fun seekTo(position: Double) {
    val positionMs = (position * 1000).toLong()
    player?.seekTo(positionMs)
  }
  
  fun setOrigin(origin: String) {
    // Set origin for network requests if needed
    // This might require custom implementation based on requirements
  }
  
  fun togglePip() {
    // Picture-in-picture support would require additional Android PiP implementation
    // For now, dispatch event to indicate state
    onPipChange(mapOf("isActive" to false))
  }
  
  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    stopProgressTimer()
    player?.release()
  }
}