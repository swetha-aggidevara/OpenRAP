import { DataBaseSDK } from './sdks/DataBaseSDK';
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { bootstrap } from './index';


const data = 'test data'

describe('Index file', () => {

  it('should create databases', (done) => {
    process.env.COUCHDB_URL = 'http://admin:password@localhost:5984';
    let schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'schemas.json'), { encoding: 'utf8' }))
    let databases = schema.databases;
    bootstrap()
      .then(() => {
        let dataBase = new DataBaseSDK();
        return dataBase.listDBs();
      }).then((dbs) => {
        for (let db of databases) {
          expect((dbs.indexOf(db.name) !== -1)).to.be.true;
        }
        done()
      })
  });

});