/**
 * @author Harish Kumar Gangula <harishg@ilimi.in>
 */
import nano from 'nano';

export class DataBaseSDK {
    connection: any;
    constructor() {
        this.connection = nano(process.env.COUCHDB_URL);
    }

    create = (database: string) => {
        return this.connection.db.create(database);
    }
    
    upsert = async (database: string, docId: string, doc: any) => {
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
    
    get = (database: string, Id: string) => {
        return this.connection.db.use(database).get(Id);
    }
    
    list = () => {
        return this.connection.db.list();
    }
}









