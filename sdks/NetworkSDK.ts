import { HTTPService } from '@project-sunbird/ext-framework-server/services';
import { EventManager } from '@project-sunbird/ext-framework-server/managers/EventManager';
import { Singleton } from 'typescript-ioc';

@Singleton
export default class NetworkSDK {



    private internetStatus;
    constructor() {
        this.setInitialStatus();
        this.setEventEmitter()
    }

    isInternetAvailable = (baseUrl?: string): Promise<boolean> => {
        return new Promise((resolve) => {
            let endPointUrl: string = baseUrl ? baseUrl : (process.env.APP_BASE_URL as string);
            HTTPService.head(endPointUrl)
                .toPromise()
                .then(() => {
                    resolve(true)
                }).catch(err => {
                    resolve(false)
                })
        })
    };
    private async setInitialStatus() {
        this.internetStatus = await this.isInternetAvailable();
    }
    private setEventEmitter() {
        setInterval(async () => {
            let status = await this.isInternetAvailable();
            if (this.internetStatus !== status) {
                if (status) {
                    EventManager.emit('network:available', {})
                    this.internetStatus = status;
                } else {
                    EventManager.emit('network:disconnected', {})
                    this.internetStatus = status;
                }

            }
        }, 30000);
    }
}




//network:available
//network:disconnected