require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoIvsPlayer'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.5'
  s.source         = { git: 'https://github.com/VollaInc/expo-ivs-player' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  
  # IVS SDK dependency with configurable version
  ivs_version = ENV['IVS_PLAYER_VERSION'] || '~> 1.33.0'
  s.dependency 'AmazonIVSPlayer', ivs_version

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
