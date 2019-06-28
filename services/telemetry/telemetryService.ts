
import { Inject, Singleton } from "typescript-ioc";
import { DataBaseSDK } from "../../sdks/DataBaseSDK";
import * as path from 'path';
import { logger } from "@project-sunbird/ext-framework-server/logger";
import * as _ from 'lodash';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { TelemetryHelper } from './telemetry-helper';
import { machineIdSync } from 'node-machine-id';
import SystemSDK from "../../sdks/SystemSDK";

let uuid = require('uuid/v1')

@Singleton
export class TelemetryService extends TelemetryHelper {

    @Inject
    private databaseSdk: DataBaseSDK;

    telemetryBatch = [];
    telemetryConfig: any = {};
    async initialize(pluginId: string) {
        let systemSDK = new SystemSDK();
        const orgDetails = await this.databaseSdk.getDoc('organization', process.env.CHANNEL);
        // get mode from process env if standalone use machine id as did for client telemetry also
        this.telemetryConfig = {
            userOrgDetails: {
                userId: systemSDK.getDeviceId(),
                rootOrgId: orgDetails.rootOrgId,
                organisationIds: [orgDetails.hashTagId]
            },
            config: {
                pdata: {
                    id: process.env.APP_ID,
                    ver: '1.0',
                    pid: pluginId
                },
                batchsize: 10,
                endpoint: '',
                apislug: '',
                sid: uuid(),
                channel: orgDetails.hashTagId,
                env: 'container',
                enableValidation: false,
                timeDiff: 0,
                runningEnv: 'server',
                dispatcher: {
                    dispatch: this.dispatcher.bind(this)
                }
            }
        }
        this.init(this.telemetryConfig);
    }
    dispatcher(data) {
        this.telemetryBatch.push(data);
        console.log('dispatcher called', this.telemetryBatch.length);
        if (this.telemetryBatch.length >= this.telemetryConfig.config.batchsize) {
            this.addEvents(this.telemetryBatch.splice(0, this.telemetryBatch.length)).catch(() => {
                console.log('error syncing telemetry events to db');
            })
        }
    }
    addEvents(events: object[]) {
        // Add the events to database
        return this.databaseSdk.bulkDocs('telemetry', events)

        //  TODO: Check the events count is greater or equal to the sync batch size if yes create gzip
        // if gzip created delete the events

        // if not having required docs skip the gzip
    }
}
