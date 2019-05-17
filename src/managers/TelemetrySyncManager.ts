/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

import { frameworkAPI } from '@project-sunbird/ext-framework-server/api/index'

export default class TelemetrySyncManager {

    // initialize  the Manager


    // Batching Job implementation

    batchJob = () => {

        // get the plugins from global registry

        // telemetry events by plugin from plugin's  and create the packet

        // insert the batch into batch table with plugin-Id and sync status as false

        // clean the events in the plugin telemetry table

    }

    // Clean up job implementation

    cleanUpJob = () => {
        // get the batches from telemetry batch table where sync status is true

        // create gz file with name as batch id with that batch data an store it to telemetry-archive folder

        // delete the files which are created 10 days back 

    }



    // Sync job implementation

    syncJob = () => {

        // get the plugin info from global SDK

        // check network connectivity with plugin api base url since we try to sync to that endpoint

        // get the batches from batch table where sync status is false

        // sync each packet to the plugins  api base url 

        // on successful sync update the batch sync status to true

    }

}