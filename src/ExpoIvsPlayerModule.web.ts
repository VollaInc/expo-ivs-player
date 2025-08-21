import { registerWebModule, NativeModule } from 'expo';

import { ExpoIvsPlayerModuleEvents } from './ExpoIvsPlayer.types';

class ExpoIvsPlayerModule extends NativeModule<ExpoIvsPlayerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoIvsPlayerModule, 'ExpoIvsPlayerModule');
