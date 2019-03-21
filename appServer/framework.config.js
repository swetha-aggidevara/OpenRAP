
module.exports = {
    db: {
        cassandra: {
            contactPoints: ["127.0.0.1"]
        },
        elasticsearch: {
            host: "127.0.0.1:9200",
            disabledApis: ["cat", "cluster", "ingest", "nodes", "remote", "snapshot", "tasks"]
        },
        couchdb: {
            url: 'http://127.0.0.1:5984'
        }
    },
    telemetry: {
        dispatcher: 'http', // default
        pdata: {
            'id': 'openRAP',
            'ver': 0.12,
            'pid': 'sunbird-openRAP'
        },
        env: 'offline',
        channel: process.env.channel,
        endpoint: 'v1/telemetry',
        batchsize: 1,
        host: process.env.telemetry_host,
        runningEnv: 'server'
    },
    plugins: [
        { id: "openrap-sunbirded-plugin", version: "1.0" }
    ],
    pluginBasePath: __dirname + '/node_modules/',
    logLevel: 'error'
}
