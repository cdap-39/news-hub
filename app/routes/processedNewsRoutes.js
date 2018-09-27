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

var moment = require('moment');


router.route('/')
    .get((req, res) => {
        client.search({
            index: ['processed_news'],
            type: 'doc',
            body: {
                query: {
                    match_all: {}
                },
                sort: {
                    "date": { "order": "desc" }
                },
                _source: ["heading", "content", "link", "date", "ref", "category", "image", "media-link", "video-link", "media_ethics"],
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
                    "link": hit._source.link,
                    "ref": hit._source.ref,
                    "category": hit._source.category,
                    "image": hit._source.image,
                    "media-link": hit._source['media-link'],
                    "video-link": hit._source['video-link'],
                    "media_ethics": hit._source.media_ethics
                }
            })
            res.send(formattedHits);
        }, function (err) {
            console.trace(err);
            res.send(err);
        });
    })
    .put((req, res) => {
        var requestBody = prepareBulkRequest(req.body);

        client.bulk({
            body: requestBody
        }).then((resp) => {
            res.send(resp);
        }).catch((err) => {
            res.send(err);
        })
    })

function prepareBulkRequest(data) {
    var requestBody = [];

    
    data.forEach(record => {
        var action = { update: { _index: 'processed_news', _type: 'doc', _id: "" } }
        var doc = {
            "doc": {},
            "doc_as_upsert": true
        }

        if (!record.heading) {
            return;
        }

        action.update._id = record.heading;
        doc.doc = record;
        doc.doc.date = moment(record.date);

        requestBody.push(action);
        requestBody.push(doc);
    });

    return requestBody;
}

module.exports = router;