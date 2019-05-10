import express from 'express';
import * as bodyParser from 'body-parser';
import { frameworkAPI } from '@project-sunbird/ext-framework-server/api';
import { frameworkConfig } from './framework.config';
import { logger } from '@project-sunbird/ext-framework-server/logger';
import { DataBaseSDK } from './sdks/DataBaseSDK';

const app = express();
app.use(bodyParser.json());
const subApp = express()
subApp.use(bodyParser.json({ limit: '50mb' }))
app.use('/', subApp);

// Initialize container
export const bootstrap = async () => {
    let dataBase = new DataBaseSDK();
    let dbList = await dataBase.list();
    let databases = ['plugin_registry', 'settings', 'telemetry_packets', 'download_queue'];

    // Removing duplicate databases
    databases = databases.filter(function (el) {
        return dbList.indexOf(el) < 0;
    });

    for (const db of databases) {
        await dataBase.create(db);
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
    app.listen(process.env.port, (error: any) => {
        if (error)
            logger.error(error);
        else{
            logger.info("listening on " + process.env.port);
            cb()
        }
    })
}
