/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

import { DataBaseSDK } from "../sdks/DataBaseSDK";
import { Inject, Singleton } from "typescript-ioc";
import * as _ from 'lodash';
import axios from 'axios';
import { machineId, machineIdSync } from 'node-machine-id';
import { logger } from "@project-sunbird/ext-framework-server/logger";
import { FrameworkAPI } from "@project-sunbird/ext-framework-server/api";
import * as jwt from 'jsonwebtoken';
import { list } from '../sdks/GlobalSDK';
import NetworkSDK from '../sdks/NetworkSDK';

@Singleton
export class TelemetrySyncManager {

    @Inject
    private databaseSdk: DataBaseSDK;
    @Inject
    private frameworkAPI: FrameworkAPI;
    @Inject
    private networkSDK: NetworkSDK;
    private TELEMETRY_PACKET_SIZE = process.env.TELEMETRY_PACKET_SIZE ? parseInt(process.env.TELEMETRY_PACKET_SIZE) : 200;

    async batchJob() {
        const pluginDetails = await list().catch(() => { // get the plugins from global registry
            return [];
        });
        if (!pluginDetails.length) {
            return;
        }
        _.forEach(pluginDetails, (pluginDetail) => {
            const pluginDbInstance = this.frameworkAPI.getCouchDBInstance(pluginDetail.id);
            this.createTelemetryPacket(pluginDbInstance, pluginDetail.id) // telemetry events by plugin from plugin's  and create the packet
        })
        this.createTelemetryPacket(this.databaseSdk.connection, '');// createTelemetryPacket job for OpenRap telemetry events
    }
    async createTelemetryPacket(pluginDbInstance, pluginId: string) {
        let dbFilters = {
            selector: {},
            limit: this.TELEMETRY_PACKET_SIZE * 10
        }
        const telemetryEvents = await pluginDbInstance.db.use('telemetry').find(dbFilters)
            .catch(error => logger.error('fetching telemetryEvents failed', error));
        logger.info('telemetry events length', telemetryEvents.docs.length);

        if (!telemetryEvents.docs.length) {
            return;
        }
        let formatedEvents = _.map(telemetryEvents.docs, (doc) => {
            return _.omit(doc, ['_id', '_rev']);
        })
        const packets = _.chunk(formatedEvents, this.TELEMETRY_PACKET_SIZE).map(data => ({
            pluginId: pluginId, // need to be changed
            syncStatus: false,
            createdOn: Date.now(),
            updateOn: Date.now(),
            events: data
        }));
        await this.databaseSdk.bulkDocs('telemetry_packets', packets) // insert the batch into batch table with plugin-Id and sync status as false
            .catch(error => logger.error('creating packets', error));

        const deleteEvents = _.map(telemetryEvents.docs, data => ({
            "_id": data._id,
            "_rev": data._rev,
            "_deleted": true
        }))
        await pluginDbInstance.db.use('telemetry').bulk({ docs: deleteEvents })  // clean the events in the plugin telemetry table
            .catch(error => logger.error('deleting telemetry events failed', error));
        this.createTelemetryPacket(pluginDbInstance, pluginId);
    }

    async syncJob() {
        const networkStatus = await this.networkSDK.isInternetAvailable().catch(status => false);
        if (!networkStatus) { // check network connectivity with plugin api base url since we try to sync to that endpoint
            console.log('sync job failed: network not available');
            return;
        }
        let apiKey = '';

        try {
            let { api_key } = await this.databaseSdk.getDoc('settings', 'device_token');
            apiKey = api_key;
            apiKey
        } catch (error) {
            logger.warn('device token is not set getting it from api');
            apiKey = await this.getAPIToken(machineIdSync()).catch(err => logger.error(`while getting the token ${err}`));
        }


        if (!apiKey) {
            console.log('sync job failed: api_key not available');
            return;
        }
        let dbFilters = {
            selector: {
                syncStatus: false
            },
            limit: 100
        }
        const telemetryPackets = await this.databaseSdk.findDocs('telemetry_packets', dbFilters) // get the batches from batch table where sync status is false
            .catch(error => console.log('fetching telemetryPackets failed', error));
        console.log('telemetryPackets length', telemetryPackets.docs.length);
        if (!telemetryPackets.docs.length) {
            return;
        }
        for (const telemetryPacket of telemetryPackets.docs) {
            await this.makeSyncApiCall(telemetryPacket.events, apiKey).then(data => { // sync each packet to the plugins  api base url 
                logger.info(`${data} telemetry synced for  packet ${telemetryPacket._id} of events ${telemetryPacket.events.length}`); // on successful sync update the batch sync status to true
                return this.databaseSdk.updateDoc('telemetry_packets', telemetryPacket._id, { syncStatus: true });
            }).catch(err => {
                logger.error(`error while syncing packets to telemetry service for  packet ${telemetryPacket._id} of events ${telemetryPacket.events.length}`);
            });
        }
    }
    async makeSyncApiCall(events, apiKey) {
        console.log('syncing telemetry');
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
        let body = {
            ets: Date.now(),
            events: events,
            id: "api.telemetry",
            ver: "1.0"
        }
        return await axios.post(process.env.APP_BASE_URL + '/api/data/v1/telemetry', body, { headers: headers })
    }
    // Clean up job implementation

    cleanUpJob() {
        // get the batches from telemetry batch table where sync status is true

        // create gz file with name as batch id with that batch data an store it to telemetry-archive folder

        // delete the files which are created 10 days back 

    }
    async getAPIToken(deviceId = machineIdSync()) {
        //const apiKey =;
        //let token = Buffer.from(apiKey, 'base64').toString('ascii');
        if (process.env.APP_BASE_URL_TOKEN && deviceId) {
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APP_BASE_URL_TOKEN}`
            }
            let body = {
                "id": "api.device.register",
                "ver": "1.0",
                "ts": Date.now(),
                "request": {
                    "key": deviceId
                }
            }
            let response = await axios.post(process.env.APP_BASE_URL + '/api/api-manager/v1/consumer/mobile_device/credential/register', body, { headers: headers })
                .catch(err => {
                    logger.error(`Error while registering the device status ${err.response.status} data ${err.response.data}`);
                    throw Error(err);
                });
            let key = _.get(response, 'data.result.key');
            let secret = _.get(response, 'data.result.secret');
            let apiKey = jwt.sign({ "iss": key }, secret, { algorithm: 'HS256' })
            await this.databaseSdk.upsertDoc('settings', 'device_token', { api_key: apiKey }).catch(err => {
                logger.error('while inserting the api key to the  database', err);
            })
            return apiKey;
        } else {
            throw Error(`token or deviceID missing to register device ${deviceId}`)
        }
    }
}