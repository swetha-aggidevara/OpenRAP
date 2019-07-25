import { machineIdSync } from "node-machine-id";
import { Singleton } from "typescript-ioc";
@Singleton
export default class SystemSDK {
  private deviceId;
  constructor(pluginId?: string) {
    this.deviceId = machineIdSync();
  }

  getDeviceId() {
    return this.deviceId;
  }

  getDiskSpaceInfo() {}

  getMemoryInfo() {}

  getDeviceInfo() {
    {
    }
  }

  getAll() {}
}
