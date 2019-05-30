var requestSyuc = require('sync-request');
var request = require('request');;
const fs = require('fs');

var express = require('express');
var app = express();
app.listen(process.env.PORT);

require('./app/steam_id_api')(client, app, request);