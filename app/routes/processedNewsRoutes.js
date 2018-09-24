// newsFirstRoutes.js

var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');

var elasticsearchIP = '35.237.151.220:9200';

var client = new elasticsearch.Client({
    host: elasticsearchIP,
    log: 'error'
});


router.route('/')
    .get((req, res) => {
        client.search({
            index: ['processed_news'],
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
        requestBody.push(action);
        requestBody.push(doc);
    });

    return requestBody;
}

module.exports = router;