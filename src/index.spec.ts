import { DataBaseSDK } from './sdks/DataBaseSDK';
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { bootstrap } from './index';


const data = 'test data'

describe('Index file', () => {

  it('should create databases', (done) => {
    process.env.COUCHDB_URL = 'http://admin:password@localhost:5984';
      Promise
          .all([bootstrap()])
          .then(() => {
              let dataBase = new DataBaseSDK();
              return dataBase.list();
          }).then((data) => {
            expect(data.length).to.equal(4);
            done();
          })
  });

});