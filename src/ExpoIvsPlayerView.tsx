import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoIvsPlayerViewProps } from './ExpoIvsPlayer.types';

const NativeView: React.ComponentType<ExpoIvsPlayerViewProps> =
  requireNativeView('ExpoIvsPlayer');

export default function ExpoIvsPlayerView(props: ExpoIvsPlayerViewProps) {
  return <NativeView {...props} />;
}
