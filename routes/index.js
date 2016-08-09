var express = require('express');
var router = express.Router();
var request = require('request');

var util = require('util'),
    exec = require('child_process').exec;

function makePromise(socialMediaPlatform, username) {
    var command = "casperjs /Users/lainekendall/workspace/InfluencerMetrics/public/javascripts/casperjs/";
    if (socialMediaPlatform == "instagram") {
        command += "instagram.js '";
    } else if (socialMediaPlatform == "youtube") {
        command += "youtube.js '";
    }
    command += username + "'";
    return new Promise(function (resolve, reject) {
        exec(command, function (error, stdout, stderr) {
            if (error != null) {
                console.log('exec error: ' + error);
                // reject(stderr); // `TODO
            }
            console.log('stdout: ' + stdout);
            if (stdout.includes("timeout")) {
                resolve({"error":"timeout"});
            } else {
                resolve(JSON.parse(stdout));
            }
            console.log("done with promise");
        });
    });
}

function finish(req) {
    var influencers = req.body;
    console.log(influencers);
    var promiseArray = [],
        promise;
    for (i = 0; i < influencers.length; i++) {
        var influencer = influencers[i];
        if (influencer.hasOwnProperty("instagramUsername")) {
            console.log('instagram');
            promise = makePromise("instagram", influencer.instagramUsername);
            promiseArray.push(promise);
        } if (influencer.hasOwnProperty("youtubeUsername")) {
            console.log('youtube');
            promise = makePromise("youtube", influencer.youtubeUsername);
            promiseArray.push(promise);
        }
    }
    console.log("here1");
    var promiseWrapper = Promise.all(promiseArray);
    console.log("here2");
    promiseWrapper.then(function(resultArray) {
        console.log("callback for array");
        postToTrove(resultArray);
    }).catch(function(e) {
        console.log("catch");
        postToTrove({"error": e});
    });
}

function postToTrove(response) {
    console.log("posting to trove");
    var endpoint;
    if (process.env.ENV === 'production') {
        endpoint = "http://project-troveup-dev.appspot.com/worker/updateinfluencermetricscallback";
    } else {
        endpoint = "http://localhost:8080/worker/updateinfluencermetricscallback"
    }
    var options = {
        url: endpoint,
        method: "POST",
        body: {"influencers": response},
        json: true
    };
    request(options, function(err, res) {
        console.log("err: " + err);
        console.log("res: " + res);
    })
}

router.post('/json', function(req, res) {
    res.sendStatus(200);
    finish(req);
});

module.exports = router;