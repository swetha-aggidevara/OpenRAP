import { expect } from 'chai';
import { put, get } from './SettingSDK';
import * as _ from 'lodash';

describe('SettingSDK', () => {
    let dbSetting = {
        DB_PORT: 5984
    }
    it('should put seeting', (done) => {
        put('DB_DETAILS', dbSetting).then(() => {
            done()
        })
    })

    it('should get the setting', (done) => {
        get('DB_DETAILS').then(dbSettingRes => {
            expect(_.isEqual(dbSettingRes, { DB_PORT: 5984 })).to.be.true;
            done()
        })
    })
})