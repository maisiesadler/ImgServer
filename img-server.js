var express = require('express');
var fs = require('fs');
var path = require('path');
var HashMap = require('hashmap').HashMap;
const app = express();

var imgServer = function(dir, port){
    if (!dir){
        throw new Error("Dir is undefined");
    }

    var mime = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        js: 'application/javascript'
    };

    var imgs =  new HashMap();
    var cacheMetaData = new HashMap();

    var serveFromFile = function(file, res, pathName){
        var s = fs.createReadStream(file);
        var text = [];

        s.on('data', function(chunk) {
            text.push(chunk);
        });
        s.on('end', function() {
            console.log("adding new img to cache: " + pathName);
            console.log(text);
            imgs.set(pathName, text);
            fs.stat(file, function(err, stats){
                cacheMetaData.set(pathName, stats);
            });
        });
        s.on('open', function () {
            s.pipe(res);
        });
        s.on('error', function () {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
        });
    };

    var serveFromCache = function(pathName, res){
        console.log("getting from cache");
        var s = imgs.get(pathName);
        res.send(s[0]);
    }

    app.get('*', function (req, res) {
        var file = path.join(dir, req.path);
        var type = mime[path.extname(file).slice(1)] || 'text/plain';
        res.set('Content-Type', type);

        if (imgs.has(req.path)) {
            fs.stat(file, function(err, stats){
                if (err){
                    console.log(err);
                    serveFromCache(req.path, res);
                } else {
                    var oldStats = cacheMetaData.get(req.path);
                    if (stats.mtime.toISOString() !== oldStats.mtime.toISOString()){
                        serveFromFile(file, res, req.path);
                    } else {
                        serveFromCache(req.path, res);
                    }
                }
            });
        } else {
            fs.stat(file, function(err, stats){
                if (err){
                    console.log(err);
                    res.status(404).end('Not found');
                } else {
                    serveFromFile(file, res, req.path);
                }
            });
        }
    });

    this.start = function(){
        app.listen(port, function () {
            console.log('img-server is listening on port ' + port)
        });
    };
};

exports.imgServer = imgServer;