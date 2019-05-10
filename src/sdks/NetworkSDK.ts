import * as dns from 'dns';
import * as url from 'url';
// import * as events from 'events';



export const isInternetAvailable = async () => {
    return new Promise((resolve, reject) => {
        let protocol = url.parse(process.env.APP_BASE_URL).protocol;
        let endPoint = process.env.APP_BASE_URL.slice((protocol + '//').length)
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