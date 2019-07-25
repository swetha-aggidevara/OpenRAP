import { DataBaseSDK } from "./sdks/DataBaseSDK";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import { reconciliation } from "./managers/DownloadManager/DownloadManager";
import NetworkSDK from "./sdks/NetworkSDK";
import { TelemetrySyncManager } from "./managers/TelemetrySyncManager";
import { TelemetryInstance } from "./services/telemetry/telemetryInstance";
import uuid = require("uuid");
import { TelemetryService } from "./services";

let sessionId = null;
let telemetryInstance: TelemetryService;
// Initialize container
const bootstrap = async () => {
  sessionId = uuid.v4();
  // initialize the telemetry instance, to get it in other modules
  telemetryInstance = new TelemetryInstance().get();
  // create databases for the container
  let dataBase = new DataBaseSDK();
  let schema = JSON.parse(
    fs.readFileSync(path.join(__dirname, "db", "schemas.json"), {
      encoding: "utf8"
    })
  );
  let databases = schema.databases;
  for (const db of databases) {
    dataBase.createDB(db.name);
  }

  for (const db of databases) {
    if (!_.isEmpty(db["indexes"])) {
      for (const index of db.indexes) {
        await dataBase.createIndex(db.name, index);
      }
    }
  }
  await reconciliation();
  const telemetrySyncManager = new TelemetrySyncManager();
  let interval =
    parseInt(process.env.TELEMETRY_SYNC_INTERVAL_IN_SECS) * 1000 || 30000;
  setInterval(() => telemetrySyncManager.batchJob(), interval);
  setInterval(() => telemetrySyncManager.syncJob(), interval);
  setInterval(() => telemetrySyncManager.cleanUpJob(), interval);
  // initialize the network sdk to emit the internet available or disconnected events
  new NetworkSDK();
};

export { bootstrap, sessionId, telemetryInstance };
