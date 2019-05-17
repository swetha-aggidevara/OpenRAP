import express from 'express';
import * as bodyParser from 'body-parser';
import { frameworkAPI } from '@project-sunbird/ext-framework-server/api';
import { frameworkConfig } from './framework.config';
import { logger } from '@project-sunbird/ext-framework-server/logger';
import { DataBaseSDK } from './sdks/DataBaseSDK';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

const app = express();
app.use(bodyParser.json());
const subApp = express()
subApp.use(bodyParser.json({ limit: '50mb' }))
app.use('/', subApp);

// Initialize container
export const bootstrap = async () => {

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


}

// Initialize ext framework
export const framework = async (cb) => {
    frameworkAPI
        .bootstrap(frameworkConfig, subApp).then(() => startApp(cb))
        .catch((error: any) => {
            console.error(error)
            startApp(cb)
        })
}

// start the app
export default function startApp(cb) {
    app.listen(process.env.APPLICATION_PORT, (error: any) => {
        if (error)
            logger.error(error);
        else {
            logger.info("listening on " + process.env.APPLICATION_PORT);
            cb()
        }
    })
}
