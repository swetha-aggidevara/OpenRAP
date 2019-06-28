/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */
import { Singleton } from 'typescript-ioc'
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));
import * as path from 'path';
@Singleton
export class DataBaseSDK {
    dbPath: string = process.env.DATABASE_PATH;
    dbInstances: object = {}
    constructor() {

    }

    private getDBInstance(database: string) {
        if (!this.dbInstances[database]) {
            this.dbInstances[database] = new PouchDB(path.join(this.dbPath, database));
        }
        return this.dbInstances[database]
    }

    createDB(database: string) {
        this.dbInstances[database] = new PouchDB(path.join(this.dbPath, database));
        return this.dbInstances[database];
    }

    createIndex(database: string, indexDef) {

        return this.getDBInstance(database).createIndex(indexDef);
    }

    insertDoc(database: string, doc: any, Id?: string) {
        if (Id) {
            doc._id = Id;
            return this.getDBInstance(database).put(doc);
        }
        return this.getDBInstance(database).post(doc);
    }

    async upsertDoc(database: string, docId: string, doc: any) {
        let db = this.getDBInstance(database);
        let docNotFound = false;
        let docResponse = await db.get(docId).catch(err => {
            if (err.status === 404) {
                docNotFound = true;
            } else {
                // if error is not doc not found then throwing error 
                throw Error(err)
            }
        });
        let result;
        if (docNotFound) {
            doc._id = docId;
            result = await db.put(doc);
        } else {
            doc._id = docResponse['_id'];
            doc._rev = docResponse['_rev'];
            result = await db.put(doc);
        }

        return result;
    }

    getDoc(database: string, Id: string) {
        return this.getDBInstance(database).get(Id);
    }

    async updateDoc(database: string, Id: string, document: any) {
        let doc = await this.getDBInstance(database).get(Id);
        let updatedDoc = { ...doc, ...document }
        return this.getDBInstance(database).put(updatedDoc);
    }

    bulkDocs(database: string, documents: Object[]) {
        return this.getDBInstance(database).bulkDocs(documents);
    }

    find(database: string, searchObj: Object) {
        return this.getDBInstance(database).find(searchObj);
    }
}
