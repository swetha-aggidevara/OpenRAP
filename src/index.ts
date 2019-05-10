
import express from 'express';
import * as bodyParser from 'body-parser';
import { frameworkAPI } from '@project-sunbird/ext-framework-server/api';
import { frameworkConfig } from './framework.config';
import { logger } from '@project-sunbird/ext-framework-server/logger';


const app = express();
app.use(bodyParser.json());

const subApp = express()
subApp.use(bodyParser.json({ limit: '50mb' }))

app.use('/', subApp);
frameworkAPI
    .bootstrap(frameworkConfig, subApp).then(() => startApp())
    .catch((error: any) => {
        console.error(error)
        startApp()
    })


export default function startApp() {
    app.listen(process.env.port, (error: any) => {
        if (error)
            logger.error(error);
        else
            logger.info("listening on " + process.env.port);
    })
}
