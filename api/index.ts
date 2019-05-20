/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

import { Singleton } from 'typescript-ioc';
import { bootstrap } from './../index'
import { PluginConfig } from '../interfaces';
import { register } from '../sdks/GlobalSDK';
import SettingSDK from '../sdks/SettingSDK';
import FileSDK from '../sdks/FileSDK';
import { isInternetAvailable } from '../sdks/NetworkSDK';
import DownloadManager from '../managers/DownloadManager/DownloadManager';

@Singleton
class ContainerAPI {

    public async bootstrap() {
        await bootstrap();
    }

    public async register(pluginId: string, pluginInfo: PluginConfig) {
        await register(pluginId, pluginInfo);
    }

    // get the Setting SDK by plugin

    public getSettingSDKInstance(pluginId: string) {
        return new SettingSDK(pluginId)
    }

    // get file SDK by plugin

    public getFileSDKInstance(pluginId: string): FileSDK {
        let fileSDK = new FileSDK(pluginId)
        return fileSDK;
    }

    // get the Network SDK 

    public async getNetworkStatus(url: string): Promise<boolean> {
        let status: boolean = await isInternetAvailable(url)
        return status;
    }

    // get the downloadManager Instance

    public async getDownloadManagerInstance(pluginId: string): Promise<DownloadManager> {
        return new DownloadManager(pluginId);
    }


}

export const containerAPI = new ContainerAPI();