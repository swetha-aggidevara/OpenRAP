import { DataBaseSDK } from "./DataBaseSDK";

/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */


let dbName = 'settings';

/*
 * Method to put the setting
 * @param key String - The key for the config/setting
 * @param value Object - The value of the setting
 */
export const put = async (key: string, value: object): Promise<any> => {
    let dbSDK = new DataBaseSDK()
    await dbSDK.upsertDoc(dbName, key, value);
    return true;
};

/*
 * Method to get the setting
 * @param key String - The key for the config/setting
 * @return value Object
 */
export const get = async (key: string): Promise<any> => {
    let dbSDK = new DataBaseSDK()
    let setting = await dbSDK.getDoc(dbName, key);
    delete setting['_id'];
    delete setting['_rev'];
    console.log('setting: ', setting)
    return Promise.resolve(setting);
};