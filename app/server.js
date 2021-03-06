// server.js

// BASE SETUP
// =============================================================================

// required packages
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');
var cors = require('cors');

// configure server to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());

var port = process.env.PORT || 8081;

// API ROUTES 
// =============================================================================
var newsFirstRoutes = require('./routes/newsFirstRoutes');
var hiruNewsRoutes = require('./routes/hiruNewsRoutes');
var newsRoutes = require('./routes/newsRoutes');
var processedNewsRoutes = require('./routes/processedNewsRoutes');

// REGISTER ROUTES -------------------------------
app.use('/api/newsfirst', newsFirstRoutes);
app.use('/api/hirunews', hiruNewsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/processed_news', processedNewsRoutes);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('news-hub listening on port: ' + port);
