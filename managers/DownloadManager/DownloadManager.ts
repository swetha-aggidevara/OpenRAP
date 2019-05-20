/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */

import { DownloadObject, DownloadFile } from '../../interfaces';
import { Inject } from 'typescript-ioc'

import * as _ from 'lodash';
import uuid4 from 'uuid/v4';
import * as path from 'path';
import { DataBaseSDK } from '../../sdks/DataBaseSDK';
import FileSDK from '../../sdks/FileSDK';

import { DownloadManagerHelper } from './DownloadManagerHelper';

/*
* Below are the status for the download manager with different status
*/
export enum STATUS {
    Submitted = "SUBMITTED",
    InProgress = "INPROGRESS",
    Completed = "COMPLETED",
    Failed = "FAILED",
    Cancelled = "CANCELLED",
    EventEmitted = "EVENTEMITTED"
}

export enum STATUS_MESSAGE {
    Submitted = "Request is submitted. It will process soon.",
    InProgress = "Downloading is in progress.",
    Completed = "Downloaded  successfully.",
    Failed = "Download failed."
}




export default class DownloadManager {

    @Inject
    private downloadManagerHelper: DownloadManagerHelper;

    pluginId: string;

    @Inject
    private dbSDK: DataBaseSDK;

    private fileSDK: FileSDK;

    private dataBaseName = 'download_queue';

    constructor(pluginId: string) {
        this.pluginId = pluginId;
        this.fileSDK = new FileSDK(pluginId);
    }
    /*
            * Method to queue the download of a file
            * @param files - The file urls to download
            * @param location - Path to download the file
            * @return downloadId - The download id reference
            */
    download = async (files: DownloadFile | DownloadFile[], location: string): Promise<string> => {
        /* TODO: need to handle the error cases like 
        1. when same file used to download in single file or multiple files
        2. when the it fails to add to the queue
        **/


        //ensure dest location exists
        await this.fileSDK.mkdir(location)
        let docId = uuid4();
        // insert the download request with data to database
        if (_.isArray(files)) {
            let fileSizes = _.map(files, file => file.size);
            let totalSize = _.reduce(fileSizes, (sum, n) => {
                return sum + n;
            }, 0);
            let doc = {
                pluginId: this.pluginId,
                status: STATUS.Submitted,
                statusMsg: STATUS_MESSAGE.Submitted,
                createdOn: Date.now(),
                updatedOn: Date.now(),
                stats: {
                    totalFiles: (files as DownloadFile[]).length,
                    downloadedFiles: 0,
                    totalSize: totalSize,
                    downloadedSize: 0,
                },
                files: []
            }
            for (const file of (files as DownloadFile[])) {
                let fileId = (file as DownloadFile).id;
                let downloadUrl = (file as DownloadFile).url;
                let fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
                let downloadObj = {
                    id: fileId,
                    file: fileName,
                    source: downloadUrl,
                    path: this.fileSDK.getAbsPath(location),
                    size: 0,
                    downloaded: 0 // Downloaded until now
                }
                doc.files.push(downloadObj);

                // push the request to download queue
                let locations = {
                    url: downloadUrl,
                    savePath: this.fileSDK.getAbsPath(path.join(location, fileName))
                }
                // while adding to queue we will prefix with docId if same content is requested again we will download it again
                this.downloadManagerHelper.queueDownload(`${docId}_${fileId}`, this.pluginId, locations, this.downloadManagerHelper.downloadObserver(fileId, docId));
            }
            await this.dbSDK.insertDoc(this.dataBaseName, doc, docId);
            return Promise.resolve(docId)
        } else {
            let fileId = (files as DownloadFile).id;
            let downloadUrl = (files as DownloadFile).url;
            let totalSize = files.size
            let fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
            let doc = {
                pluginId: this.pluginId,
                status: STATUS.Submitted,
                statusMsg: "Request is submitted. It will process soon",
                createdOn: Date.now(),
                updatedOn: Date.now(),
                stats: {
                    totalFiles: 1,
                    downloadedFiles: 0,
                    totalSize: totalSize,
                    downloadedSize: 0
                },
                files: [{
                    id: fileId,
                    file: fileName,
                    source: downloadUrl,
                    path: this.fileSDK.getAbsPath(location),
                    size: totalSize,
                    downloaded: 0 // Downloaded until now
                }]
            }

            await this.dbSDK.insertDoc(this.dataBaseName, doc, docId);

            // push the request to download queue
            let locations = {
                url: downloadUrl,
                savePath: this.fileSDK.getAbsPath(path.join(location, fileName))
            }
            // while adding to queue we will prefix with docId if same content is requested again we will download it again
            this.downloadManagerHelper.queueDownload(`${docId}_${fileId}`, this.pluginId, locations, this.downloadManagerHelper.downloadObserver(fileId, docId));
            return Promise.resolve(docId)
        }

    };

    /*
     * Method to get the status of the download
     * @param downloadId String
     * @return Download object
     */
    get = async (downloadId: string): Promise<DownloadObject> => {
        // Read status of the request with downloadId and return downloadObject
        let downloadObject: DownloadObject;
        downloadObject = await this.dbSDK.getDoc(this.dataBaseName, downloadId);
        _.omit(downloadObject, ['pluginId', 'statusMsg', '_rev'])
        downloadObject.id = downloadObject['_id'];
        delete downloadObject['_id'];
        return Promise.resolve(downloadObject);
    };

    /*
     * Method to pause the download
     * @param downloadId String
     */
    pause = (downloadId: string) => {
        //TODO: need to implement
        //return this.downloadManagerHelper.pause(downloadId);
    };

    /*
     * Method to cancel the download
     * @param downloadId String
     */
    cancel = async (downloadId: string): Promise<boolean> => {
        //TODO: need to implement
        //await this.dbSDK.updateDoc(this.dataBaseName, downloadId, { status: STATUS.Cancelled });
        //return Promise.resolve(this.downloadManagerHelper.cancel(downloadId));
        return Promise.resolve(true);
    };

    /*
     * Method to pause all the downloads for the given plugin
     * @param downloadId String
     */
    pauseAll = (): void => {
        //TODO: need to implement
        //this.downloadManagerHelper.pauseAll();
    };

    /*
     * Method to cancel all the downloads for the given plugin
     * @param downloadId String
     */
    cancelAll = async (): Promise<boolean> => {// get all the downloadIds which are not completed// call killDownload with all the downloadIds on the queue and return the promise
        //TODO: need to implement
        // let flag = this.downloadManagerHelper.cancelAll()
        // // get the docs which are in status submitted and in progress
        // let { docs } = await this.dbSDK.find(this.dataBaseName, {
        //     selector: {
        //         status: { "$in": [STATUS.Submitted, STATUS.InProgress] }
        //     }
        // })

        // // change the status of the docs to cancelled
        // if (docs.length) {
        //     let updatedDocs = _.map(docs, doc => {
        //         doc.status = STATUS.Cancelled;
        //         return doc;
        //     })
        //     await this.dbSDK.bulkDocs(this.dataBaseName, updatedDocs)
        // }
        return Promise.resolve(true);
    };

    /*
     * Method to list the download queue based on the status
     * @param status String - The status of the download - Submitted, Complete, InProgress, Failed. Blank option will return all status
     * @return Array - Array of download objects
     */
    list = async (status?: string): Promise<DownloadObject[]> => {
        // get the list of items from database if status is provided otherwise get all the status
        let downloadObjects: DownloadObject[] = [];
        let selector = {
            selector: {}
        }
        if (status) {
            selector = {
                selector: {
                    status: {
                        "$in": [status as STATUS]
                    }
                }
            }
        }
        let { docs } = await this.dbSDK.findDocs(this.dataBaseName, selector)
        downloadObjects = _.map(docs, doc => {
            doc.id = doc['_id'];
            delete doc['_id'];
            delete doc['pluginId'];
            delete doc['statusMsg'];
            delete doc['_rev'];
            return doc;
        })
        return Promise.resolve(downloadObjects);
    }

    async resume(downloadIds: string[]) {
        // get the data from db with download ids

        // if doc.length > 0
        // get the files from each id if the downloaded is less than  sized add to queue 
        // update the updatedOn for each downloadId


        // else Promise.resolve(false)

    }


}

/*
     This method will ensure that when the service is started/restarted updates the queue using data from download_queue database
     */
export const reconciliation = async () => {

    // Get the data from database where status is completed

    // try {

    //     @Inject
    //     const dbSDK: DataBaseSDK;
    //     let completedDocs = await 
    // } catch (error) {
    //     logger.error('while executing download manager reconciliation', error)
    // }

    // Emit the events for downloaded files which are not emitted the events

    // Add the downloads to queue if the files are having status Submitted, In-Progress
    // By invoking the resume method in downloadManager with downloadIds
}
