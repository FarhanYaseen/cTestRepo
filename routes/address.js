const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const qs = require('querystring');
const cheerio = require("cheerio");
const axios = require('axios');
router.get('/I/want/title', function (req, res, next) {
    if (req.query) {
        if (req.query.address === undefined) {
            return res.send({message: "address cannot be undefined"});
        }
        makeCalls(req.query.address, function(result){
            res.render(
                'index', {
                    "title": "Following are the titles of given websites:",
                    urls: result
                }
            )
        });
    }
});

function makeCalls(urls, callback){
    let onComplete = function(res){
        return callback(res);
    };
    let result = [];
    if(Array.isArray(urls)){
        for (let i = 0; i < urls.length; i++){
            let temp = i;
            makeRequest(urls[i], function(response) {
                result.push(response);

                if (++temp === urls.length) {
                    return onComplete(result);
                }
            });
        }
    } else {
        makeRequest(urls, function(response) {
            result.push(response);
            return onComplete(result);
        });
    }


}

function makeRequest(url , callback){
    const urlPrefix = url.match(/.*?:\/\//g);
    const prefix = "https://";
    let newUrl = url;
    if (!urlPrefix)
        newUrl = prefix + url;
    axios.get(newUrl)
        .then(function(response){
            const $ = cheerio.load(response.data);
            const title = $("title").text();
            console.log(title);
            callback({name: url, title: title});
        })
        .catch(function (err) {
            console.log(err);
            callback({name: url, title: "NO RESPONSE"});
        })

}

module.exports = router;
