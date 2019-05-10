/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

/*
 * Plugin to register with the container on initialization.
 */

interface pluginConfig {
    pluginVer: string,
    apiToken: string,
    apiBaseURL: string,
    apiTokenRefreshFn: any
}
export function register(pluginId: string, pluginConfig: object) {

};

/*
 * Get the plugin configuration.
 * @param pluginId String
 * @return pluginConfig
 */
export function get(pluginId: string): pluginConfig {


    return {} as pluginConfig;
}