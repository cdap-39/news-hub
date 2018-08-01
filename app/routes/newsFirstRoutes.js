// newsFirstRoutes.js

var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var elasticsearchIP = '35.237.151.220:9200';

var client = new elasticsearch.Client({
    host: elasticsearchIP,
    log: 'trace'
});


router.route('/:time_range')
    // standard value for: 3d
    .get((req, res) => {
        client.search({
            index: 'newsfirst',
            type: 'doc',
            body: {
                query: {
                    range: {
                        "@timestamp": {
                            gte: "now-" + req.params.time_range
                        }
                    }
                },
                _source: ["heading", "content", "link", "date"],
                size: 100
            }
        }).then(function (resp) {
            var hits = resp.hits.hits;
            console.log('Retrieved records count: ', hits.length);
            res.send(hits);
        }, function (err) {
            console.trace(err);
            res.send(err);
        });
    })

module.exports = router;