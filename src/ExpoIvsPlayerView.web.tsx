import * as React from 'react';

import { ExpoIvsPlayerViewProps } from './ExpoIvsPlayer.types';

export default function ExpoIvsPlayerView(props: ExpoIvsPlayerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
