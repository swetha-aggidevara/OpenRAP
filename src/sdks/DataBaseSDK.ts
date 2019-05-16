/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */
import { Singleton } from 'typescript-ioc'
import nano from 'nano';
import { async } from 'rxjs/internal/scheduler/async';
@Singleton
export class DataBaseSDK {
    connection: any;
    constructor() {
        this.connection = nano(process.env.COUCHDB_URL);
    }

    createDB = (database: string) => {
        return this.connection.db.create(database);
    }

    listDBs = () => {
        return this.connection.db.list();
    }

    createIndex(database: string, indexDef) {
        return this.connection.db.use(database).createIndex(indexDef);
    }

    insertDoc = (database: string, doc: any, Id?: string) => {
        if (Id) {
            return this.connection.db.use(database).insert(doc, Id);
        }
        return this.connection.db.use(database).insert(doc);
    }

    upsertDoc = async (database: string, docId: string, doc: any) => {
        let db = this.connection.db.use(database);
        let docNotFound = false;
        let docResponse = await db.get(docId).catch(err => {
            if (err.statusCode === 404) {
                docNotFound = true;
            } else {
                // if error is not doc not found then throwing error 
                throw Error(err)
            }
        });
        let result;
        if (docNotFound) {
            result = await db.insert(doc, docId);
        } else {
            doc._id = docResponse['_id'];
            doc._rev = docResponse['_rev'];
            result = await db.insert(doc);
        }

        return result;
    }

    getDoc = (database: string, Id: string) => {
        return this.connection.db.use(database).get(Id);
    }

    updateDoc = async (database: string, Id: string, document: any) => {
        let doc = await this.connection.db.use(database).get(Id);
        let updatedDoc = { ...doc, ...document }
        return this.connection.db.use(database).insert(updatedDoc);
    }

    bulkDocs(database: string, documents: Object[]) {
        return this.connection.db.use(database).bulk({ docs: documents });
    }

    find(database: string, searchObj: Object) {
        return this.connection.db.use(database).find(searchObj);
    }
}
