import { DataBaseSDK } from './sdks/DataBaseSDK';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { reconciliation } from './managers/DownloadManager/DownloadManager';
import NetworkSDK from './sdks/NetworkSDK';
import { TelemetrySyncManager } from './managers/TelemetrySyncManager';

const initializeEnv = () => {
    let envs = JSON.parse(fs.readFileSync(path.join(__dirname, 'env.json'), { encoding: 'utf-8' }));
    _.forEach(envs, (value, key) => {
        process.env[key] = value;
    });
}
// Initialize container
const bootstrap = async () => {

    // create databases for the container 
    let dataBase = new DataBaseSDK();
    let dbList = await dataBase.listDBs();
    let schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'schemas.json'), { encoding: 'utf8' }))
    let databases = schema.databases;
    let filteredDbs = databases.filter((db) => { return dbList.indexOf(db.name) === -1; });
    for (const db of filteredDbs) {
        await dataBase.createDB(db.name);
    }

    for (const db of filteredDbs) {
        if (!_.isEmpty(db['indexes'])) {
            for (const index of db.indexes) {
                await dataBase.createIndex(db.name, index)
            }
        }
    }
    await reconciliation()
    const telemetrySyncManager = new TelemetrySyncManager();
    setTimeout(() => telemetrySyncManager.batchJob(), 30000);
    setTimeout(() => telemetrySyncManager.syncJob(), 30000);
    // initialize the network sdk to emit the internet available or disconnected events
    new NetworkSDK()

}
export {
    initializeEnv,
    bootstrap
}
