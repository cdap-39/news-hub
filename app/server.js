// server.js

// BASE SETUP
// =============================================================================

// required packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');

// configure server to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// API ROUTES 
// =============================================================================
var newsFirstRoutes = require('./routes/newsFirstRoutes');
var hiruNewsRoutes = require('./routes/hiruNewsRoutes');

// REGISTER ROUTES -------------------------------
app.use('/api/newsfirst', newsFirstRoutes);
app.use('/api/hirunews', hiruNewsRoutes);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('news-hub listening on port: ' + port);
