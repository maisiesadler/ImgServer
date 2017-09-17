var express = require('express');
var fs = require('fs');
var path = require('path');
var HashMap = require('hashmap').HashMap;
const app = express();

var imgServer = function(settings){
    if (settings == null){
        settings = {};
    }

    var port;
    if (settings.dir == null && settings.map == null) {
        throw new Error("Set working directory in settings. Example { dir: 'filepath', port: 3000 }");
    }
    if (settings.port == null) {
        console.log("port is undefined, setting port 3000");
        settings.port = 3000;
    }

    port = settings.port;

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
            console.log("adding new img to cache: " + file);
            console.log(text);
            imgs.set(file, text);
            fs.stat(file, function(err, stats){
                cacheMetaData.set(file, stats);
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

    var serve = function(location, dir) {
        var p = location;
        if (!location.endsWith("/")) {
            p += "/"
        }
        p += "*";
        console.log("listening on " + p + " for directory " + dir)
        app.get(p, function (req, res) {
            var requestUrl = req.url.replace(location, "");
            var file = path.join(dir, requestUrl);
            var type = mime[path.extname(file).slice(1)] || 'text/plain';
            res.set('Content-Type', type);

            if (imgs.has(file)) {
                fs.stat(file, function(err, stats){
                    if (err){
                        console.log(err);
                        serveFromCache(file, res);
                    } else {
                        var oldStats = cacheMetaData.get(file);
                        if (stats.mtime.toISOString() !== oldStats.mtime.toISOString()) {
                            serveFromFile(file, res, file);
                        } else {
                            serveFromCache(file, res);
                        }
                    }
                });
            } else {
                fs.stat(file, function(err, stats){
                    if (err){
                        console.log(err);
                        res.set('Content-Type', 'text/plain');
                        res.status(404).end('Not found');
                    } else {
                        serveFromFile(file, res, file);
                    }
                });
            }
        });
    };

    if (settings.dir){
        serve('/', settings.dir);
    }
    if (settings.map){
        settings.map.forEach(m => {
            serve(m.from, m.to);
        }) 
    }

    this.start = function() {
        app.listen(port, function () {
            console.log('img-server is listening on port ' + port)
        });
    };
};

module.exports.imgServer = imgServer;