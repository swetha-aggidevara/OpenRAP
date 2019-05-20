import { DataBaseSDK } from "./DataBaseSDK";
import { PluginConfig } from "../interfaces";

/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

/*
 * Plugin to register with the container on initialization.
 */

let databaseName = 'plugin_registry';
export const register = async (pluginId: string, pluginConfig: object): Promise<boolean> => {
    let dbSDK = new DataBaseSDK()
    await dbSDK.upsertDoc(databaseName, pluginId, pluginConfig);
    return true;
};

/*
 * Get the plugin configuration.
 * @param pluginId String
 * @return pluginConfig
 */
export const get = async (pluginId: string): Promise<PluginConfig> => {
    let dbSDK = new DataBaseSDK()
    let pluginConfig = await dbSDK.getDoc(databaseName, pluginId);
    delete pluginConfig['_id'];
    delete pluginConfig['_rev'];
    return Promise.resolve(pluginConfig)
}