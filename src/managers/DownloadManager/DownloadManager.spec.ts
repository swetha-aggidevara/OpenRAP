import { expect } from 'chai';
import DownloadManager from './DownloadManager'
import { threadId } from 'worker_threads';
import FileSDK from '../../sdks/FileSDK';
import { EventManager } from '@project-sunbird/ext-framework-server/managers/EventManager';
import * as _ from 'lodash';


let downloadManager = new DownloadManager('testplugindownload')
let fileSDK = new FileSDK('testplugindownload');

describe('DownloadManager', () => {
    before(() => {
        process.env.COUCHDB_URL = 'http://admin:password@localhost:5984';
    })

    it('should download multiple files successfully', function (done) {
        this.timeout(10000);
        downloadManager.download([{
            id: 'do_312589002481041408120510',
            url: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_312589002481041408120510/aarthik-vikaas-kii-smjh_1554523454637_do_312589002481041408120510_2.0_spine.ecar'
        }, {
            id: 'do_312588883252060160117745',
            url: 'https://ntpproductionall.blob.core.windows.net/ntp-content-production/ecar_files/do_312588883252060160117745/raindrops_1554477690491_do_312588883252060160117745_2.0_spine.ecar'
        }], 'ecars').then(downloadId => {
            expect(downloadId).to.be.string;
        })
        EventManager.subscribe(`testplugindownload:download:complete`, (data) => {
            expect(data.status).to.be.equal('COMPLETED')
            if (!_.isEmpty(_.find(data.files, { 'id': 'do_312589002481041408120510' }))) {
                done()
            }
        })
    })

    it('should download single file successfully', function (done) {
        this.timeout(10000);
        downloadManager.download({
            id: '10MB_FILE',
            url: 'https://sample-videos.com/zip/10mb.zip'
        }, 'ecars').then(downloadId => {
            expect(downloadId).to.be.string;

        })
        EventManager.subscribe(`testplugindownload:download:complete`, (data) => {
            expect(data.status).to.be.equal('COMPLETED')
            if (!_.isEmpty(_.find(data.files, { 'id': '10MB_FILE' }))) {
                done()
            }
        })
    })


    it('should get the downloadObjects ', function (done) {
        downloadManager.list().then(downloadObjects => {
            expect(downloadObjects.length > 0).to.be.true;
            done()
        })
    })

    it('should get the downloadObjects with EVENTEMITTED status', function (done) {
        downloadManager.list('EVENTEMITTED').then(downloadObjects => {
            let flag = true;
            downloadObjects.forEach(d => {
                if (!(d.status === 'EVENTEMITTED')) flag = false;
            })
            expect(flag).to.be.true;
            done()
        })
    })

    it('should get the downloadObject', function (done) {
        downloadManager.list('EVENTEMITTED').then(downloadObjects => {
            return downloadManager.get(downloadObjects[0]['id'])
        }).then(data => {
            expect(data.status === 'EVENTEMITTED').to.be.true;
            done()
        })
    })



    after(() => {
        fileSDK.remove('')
    })
})