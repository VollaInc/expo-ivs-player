import ExpoModulesCore
import AmazonIVSPlayer
import UIKit
import AVKit

class ExpoIvsPlayerView: ExpoView, IVSPlayer.Delegate {
  private var playerView: IVSPlayerView?
  private var player: IVSPlayer?
  private var pipController: AVPictureInPictureController?
  private var progressTimer: Timer?
  private var sources: [Int: String] = [:]
  
  // Event handlers
  let onSeek = EventDispatcher()
  let onData = EventDispatcher()
  let onVideoStatistics = EventDispatcher()
  let onPlayerStateChange = EventDispatcher()
  let onDurationChange = EventDispatcher()
  let onQualityChange = EventDispatcher()
  let onPipChange = EventDispatcher()
  let onRebuffering = EventDispatcher()
  let onLoadStart = EventDispatcher()
  let onLoad = EventDispatcher()
  let onLiveLatencyChange = EventDispatcher()
  let onTextCue = EventDispatcher()
  let onTextMetadataCue = EventDispatcher()
  let onProgress = EventDispatcher()
  let onError = EventDispatcher()
  let onTimePoint = EventDispatcher()
  
  // Properties
  var streamUrl: String? {
    didSet {
      if let url = streamUrl {
        loadStream(url)
      }
    }
  }
  
  var paused: Bool = false {
    didSet {
      updatePlayPauseState()
    }
  }
  
  var muted: Bool = false {
    didSet {
      player?.muted = muted
    }
  }
  
  var volume: Float = 1.0 {
    didSet {
      playerView?.player?.volume = volume
    }
  }
  
  var playbackRate: Float = 1.0 {
    didSet {
      player?.playbackRate = playbackRate
    }
  }
  
  var autoplay: Bool = false
  var loop: Bool = false
  var liveLowLatency: Bool = true
  var rebufferToLive: Bool = false
  var resizeMode: String = "aspectFit"
  var progressInterval: Double = 1.0
  var pipEnabled: Bool = false
  var logLevel: String = "IVSLogLevelError"
  var maxBitrate: Int = 0
  var initialBufferDuration: Double = 0
  var autoQualityMode: Bool = true
  var showControls: Bool = false {
    didSet {
      // IVSPlayerView doesn't have built-in controls on iOS
      // This prop is added for API consistency with Android
      // Custom controls can be implemented if needed
    }
  }
  
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupPlayer()
  }
  
  private func setupPlayer() {
    playerView = IVSPlayerView()
    player = IVSPlayer()
    player?.delegate = self
    playerView?.player = player
    
    if let playerView = playerView {
      addSubview(playerView)
      playerView.translatesAutoresizingMaskIntoConstraints = false
      NSLayoutConstraint.activate([
        playerView.topAnchor.constraint(equalTo: topAnchor),
        playerView.leadingAnchor.constraint(equalTo: leadingAnchor),
        playerView.trailingAnchor.constraint(equalTo: trailingAnchor),
        playerView.bottomAnchor.constraint(equalTo: bottomAnchor)
      ])
    }
    
    setupVideoGravity()
    setupPictureInPicture()
  }
  
  func setupVideoGravity() {
    guard let playerView = playerView else { return }
    
    switch resizeMode {
    case "aspectFill":
      playerView.videoGravity = .resizeAspectFill
    case "aspectFit":
      playerView.videoGravity = .resizeAspect
    case "aspectZoom":
      playerView.videoGravity = .resize
    default:
      playerView.videoGravity = .resizeAspect
    }
  }
  
  func setupPictureInPicture() {
    guard pipEnabled else { return }
    
    // PiP is not directly supported with IVSPlayerView
    // This would require custom implementation with AVPlayerLayer
    // For now, we'll skip PiP support for IVS Player
  }
  
  private func loadStream(_ urlString: String) {
    guard let url = URL(string: urlString) else {
      onError(["error": "Invalid URL: \(urlString)"])
      return
    }
    
    onLoadStart([:])
    player?.load(url)
  }
  
  private func updatePlayPauseState() {
    if paused {
      player?.pause()
    } else {
      player?.play()
    }
  }
  
  private func startProgressTimer() {
    stopProgressTimer()
    progressTimer = Timer.scheduledTimer(withTimeInterval: progressInterval, repeats: true) { [weak self] _ in
      guard let self = self, let player = self.player else { return }
      let position = player.position
      self.onProgress(["progress": position])
    }
  }
  
  private func stopProgressTimer() {
    progressTimer?.invalidate()
    progressTimer = nil
  }
  
  // MARK: - Commands
  
  func preload(url: String, sourceId: Int) {
    sources[sourceId] = url
  }
  
  func loadSource(sourceId: Int) {
    if let url = sources[sourceId] {
      loadStream(url)
    }
  }
  
  func releaseSource(sourceId: Int) {
    sources.removeValue(forKey: sourceId)
  }
  
  func play() {
    player?.play()
  }
  
  func pause() {
    player?.pause()
  }
  
  func seekTo(position: Double) {
    player?.seek(to: CMTime(seconds: position, preferredTimescale: 1000)) { [weak self] _ in
      self?.onSeek(["position": position])
    }
  }
  
  func setOrigin(origin: String) {
    // Set origin for network requests if needed
  }
  
  func togglePip() {
    if pipController?.isPictureInPictureActive == true {
      pipController?.stopPictureInPicture()
    } else {
      pipController?.startPictureInPicture()
    }
  }
  
  // MARK: - IVSPlayerDelegate
  
  func player(_ player: IVSPlayer, didChangeState state: IVSPlayer.State) {
    let stateString: String
    switch state {
    case .idle:
      stateString = "Idle"
      stopProgressTimer()
    case .ready:
      stateString = "Ready"
      onLoad(["duration": player.duration])
      
      let qualities = player.qualities
      if !qualities.isEmpty {
        let qualitiesData = qualities.map { quality in
          return [
            "name": quality.name,
            "codecs": quality.codecs,
            "bitrate": quality.bitrate,
            "framerate": quality.framerate,
            "width": quality.width,
            "height": quality.height
          ]
        }
        
        onData([
          "qualities": qualitiesData,
          "version": player.version,
          "sessionId": player.sessionId
        ])
      }
      
      if autoplay && !paused {
        player.play()
      }
    case .buffering:
      stateString = "Buffering"
      onRebuffering([:])
    case .playing:
      stateString = "Playing"
      startProgressTimer()
    case .ended:
      stateString = "Ended"
      stopProgressTimer()
      if loop {
        player.seek(to: .zero) { _ in
          player.play()
        }
      }
    @unknown default:
      stateString = "Unknown"
    }
    
    onPlayerStateChange(["state": stateString])
  }
  
  func player(_ player: IVSPlayer, didOutputCue cue: IVSCue) {
    switch cue {
    case let textCue as IVSTextCue:
      onTextCue([
        "type": "text",
        "text": textCue.text,
        "line": textCue.line,
        "size": textCue.size,
        "position": textCue.position,
        "textAlignment": String(describing: textCue.textAlignment)
      ])
    case let metadataCue as IVSTextMetadataCue:
      onTextMetadataCue([
        "type": "metadata",
        "text": metadataCue.text,
        "textDescription": metadataCue.textDescription
      ])
    default:
      break
    }
  }
  
  func player(_ player: IVSPlayer, didChangeQuality quality: IVSQuality?) {
    if let quality = quality {
      onQualityChange([
        "name": quality.name,
        "codecs": quality.codecs,
        "bitrate": quality.bitrate,
        "framerate": quality.framerate,
        "width": quality.width,
        "height": quality.height
      ])
    } else {
      onQualityChange([:])
    }
  }
  
  func player(_ player: IVSPlayer, didChangeDuration duration: CMTime) {
    let durationSeconds = duration.isValid && !duration.isIndefinite ? duration.seconds : nil
    onDurationChange(["duration": durationSeconds as Any])
  }
  
  func player(_ player: IVSPlayer, didFailWithError error: Error) {
    onError(["error": error.localizedDescription])
  }
  
  func playerWillRebuffer(_ player: IVSPlayer) {
    onRebuffering([:])
  }
  
  deinit {
    stopProgressTimer()
    player?.delegate = nil
  }
}

// MARK: - AVPictureInPictureControllerDelegate

extension ExpoIvsPlayerView: AVPictureInPictureControllerDelegate {
  func pictureInPictureControllerWillStartPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
    onPipChange(["isActive": true])
  }
  
  func pictureInPictureControllerDidStopPictureInPicture(_ pictureInPictureController: AVPictureInPictureController) {
    onPipChange(["isActive": false])
  }
}
