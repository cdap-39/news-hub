// newsFirstRoutes.js

var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var config = require('../../config')

var client = new elasticsearch.Client({
    host: config.elasticsearch.IP + ':' + config.elasticsearch.port,
    log: 'error',
    requestTimeout: 30000
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
                sort: {
                    "@timestamp": { "order": "desc" }
                },
                _source: ["heading", "content", "link", "date"],
                size: 10000
            }
        }).then(function (resp) {
            var hits = resp.hits.hits;
            console.log('Retrieved records count: ', hits.length);
            var formattedHits = hits.map(hit => {
                return {
                    "heading": hit._source.heading,
                    "content": hit._source.content.replace(/\(adsbygoogle.+/i, '').trim().replace(/\r?\n|\r/g, ''),
                    "date": hit._source.date,
                    "link": hit._source.link
                }
            })
            res.send(formattedHits);
        }, function (err) {
            console.trace(err);
            res.send(err);
        });
    })

module.exports = router;