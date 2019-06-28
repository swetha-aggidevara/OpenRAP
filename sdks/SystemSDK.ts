import { machineIdSync } from 'node-machine-id';

export default class SystemSDK {

    private deviceId;
    constructor(pluginId?: string) {
        this.deviceId = machineIdSync()
    }

    getDeviceId() {
        return this.deviceId;
    }

    getDiskSpaceInfo() {

    }

    getMemoryInfo() {

    }

    getDeviceInfo() {
        {

        }
    }


    getAll() {

    }

}