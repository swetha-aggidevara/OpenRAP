import * as dns from 'dns';
import * as url from 'url';
// import * as events from 'events';



export const isInternetAvailable = async (baseUrl?: string) => {
    return new Promise((resolve, reject) => {
        let endPointUrl: string = baseUrl ? baseUrl : (process.env.APP_BASE_URL as string);
        let protocol = url.parse(endPointUrl).protocol;
        let endPoint = endPointUrl.slice((protocol + '//').length)
        dns.resolve(endPoint, function (err) {
            if (err) {
                reject(false);
            } else {
                resolve(true);
            }
        });
    })
};

//TODO: need to implement the event emitter for network connection
// export const EventManager = new events.EventEmitter();

// setInterval(() => {

// }, 30000);


//network:available
//network:disconnected