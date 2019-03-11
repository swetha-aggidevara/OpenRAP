/*
    Server entry file.
    No changes are required here to load a plugin
*/

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.raw());
app.use(bodyParser.json());
const glob = require('glob');
const pluginPath = '/opt/opencdn/appServer/plugins';
const { frameworkAPI } = require('@project-sunbird/ext-framework-server/api');
const frameworkConfig = require('./framework.config.js');
/*
    Loading all the plugins from plugin directory
*/

glob(pluginPath + "/**/*.routes.js", function (er, files) {
    for (let i = 0; i < files.length; i++) {
        require(files[i])(app);
    }
});

/**
 * Here we will create a subApp from express and add prefix for plugins route
 * and bootstrap the framework with framework config and subApp and start the service
 * Even the bootstrapping of the framework throws error we will startApp 
 */

const subApp = express()
subApp.use(bodyParser.json({ limit: '50mb' }))

app.use('/', subApp)
frameworkAPI.bootstrap(frameworkConfig, subApp).then(data => startApp())
    .catch(error => {
        startApp()
    })


function startApp() {
    app.listen(process.env.port, err => {
        if (err)
            console.log(err);
        else
            console.log("listening on " + process.env.port);
    })
}
