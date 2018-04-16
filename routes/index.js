const express = require('express');
const router = express.Router();
const cheerio = require("cheerio");
const axios = require('axios');
const async = require('async');
const Q = require('q');
router.get('/I/want/title', function (req, res, next) {
    if (req.query) {
        if (req.query.address === undefined) {
            return res.send({message: "address cannot be undefined"});
        }

        /* makeCalls1(req.query.address, function(result){
            res.render(
                'index', {
                    "title": "Following are the titles of given websites:",
                    urls: result
                }
            )
        });*/

 /*       makeCalls2(req.query.address, function(result){
            res.render(
                'index', {
                    "title": "Following are the titles of given websites:",
                    urls: result
                }
            )
        });*/
  /*      makeCalls3(req.query.address)
            .then((result) => {
                return res.render(
                    'index', {
                        "title": "Following are the titles of given websites:",
                        urls: result
                    });
            })
            .catch((err) => {
                console.log(err);
                return res.send({message: "address cannot be undefined"});
            })*/
    }
});

function makeCalls2(urls, callback){
    let result = [];
    if (Array.isArray(urls)){
        async.times(urls.length, function (n, next) {
            makeRequest(urls[n], function (response) {
                result.push(response);
                next(null, result);
            });
        }, function (err, res) {
            return callback(result);
        });
    } else {
        makeRequest(urls, function (response) {
            result.push(response);
            return callback(result);
        });
    }

}
function makeCalls1(urls, callback){
    let onComplete = function(res){
        return callback(res);
    };
    let result = [];
    if(Array.isArray(urls)){
        let itemsProcessed = 0;
        urls.forEach((url, index, array) => {
            makeRequest(url, function (response) {
                itemsProcessed++;
                result.push(response);
                if (itemsProcessed === array.length) {
                    return onComplete(result);
                }
            });
        });

    } else {
        makeRequest(urls, function(response) {
            result.push(response);
            return onComplete(result);
        });
    }


}
function makeCalls3(urls){

    const deferred = Q.defer();
    if(Array.isArray(urls)) {
        const promises = [];
        for (var i = 0; i < urls.length; i++) {
            let promise = makeRequest3(urls[i]);
            promises.push(promise);
        }
        Q.all(promises)
            .then((res) => {
                console.log(res);
                deferred.resolve(res);
            })
            .catch((err) => {
                console.log(err);
                deferred.reject(err);
            });
        return deferred.promise;
    } else {
        makeRequest3(urls)
            .then((response) => {
                console.log(response);
                deferred.resolve([response]);
            })
            .catch((err) => {
                console.log(err);
                return deferred.reject(err);
            })
        return deferred.promise;
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

function makeRequest3(url) {
    var deferred = Q.defer();
    const urlPrefix = url.match(/.*?:\/\//g);
    const prefix = "https://";
    let newUrl = url;
    if (!urlPrefix)
        newUrl = prefix + url;
    axios.get(newUrl)
        .then(function (response) {
            const $ = cheerio.load(response.data);
            const title = $("title").text();
            console.log(title);
            deferred.resolve({name: url, title: title});
        })
        .catch(function (err) {
            console.log(err);
            deferred.resolve({name: url, title: "NO RESPONSE"});
        })
    return deferred.promise;

}

module.exports = router;
