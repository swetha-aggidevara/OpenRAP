import { Singleton, Inject } from "typescript-ioc";
import { TelemetryService } from "./telemetryService";
import { TelemetryConfig } from "../../interfaces/telemetryConfig";
import { DataBaseSDK } from "../../sdks/DataBaseSDK";
import * as _ from "lodash";
import { sessionId } from "../..";
import { logger } from "@project-sunbird/ext-framework-server/logger";

@Singleton
export class TelemetryInstance {
  private instance: TelemetryService;

  @Inject
  private databaseSdk: DataBaseSDK;
  constructor() {
    let telemetryValidation =
      _.toLower(process.env.TELEMETRY_VALIDATION) === "true" ? true : false;
    let config: TelemetryConfig = {
      pdata: {
        id: process.env.APP_ID,
        ver: process.env.APP_VERSION,
        pid: "OpenRAP"
      },
      sid: sessionId, // need check with DC
      env: "container",
      rootOrgId: process.env.ROOT_ORG_ID,
      hashTagId: process.env.ROOT_ORG_HASH_TAG_ID,
      batchSize: 1,
      enableValidation: telemetryValidation,
      runningEnv: "server",
      dispatcher: this.dispatcher.bind(this)
    };
    this.instance = new TelemetryService(config);
  }
  get() {
    return this.instance;
  }

  dispatcher(events): void {
    logger.error(`OPENRAP: ${events}`);
    return this.databaseSdk.bulkDocs("telemetry", events);
  }
}
