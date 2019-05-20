import { DataBaseSDK } from './sdks/DataBaseSDK';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { reconciliation } from './managers/DownloadManager/DownloadManager';



// Initialize container
export const bootstrap = async () => {

    let envs = JSON.parse(fs.readFileSync(path.join(__dirname, 'env.json'), { encoding: 'utf-8' }));
    _.forEach(envs, function (value, key) {
        process.env[key] = value;
    });

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
}

