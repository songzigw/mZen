/*!
 * @auth zhangsong
 * @date 2016年3月24日
 */
var http = require('http');
var path = require('path');
var urlparse = require('url').parse;
var express = require('express');

var app = express();
app.use("/proxy", function (req, res) {
    var url = req.url.substr(5);
    var target = urlparse(url);
    var headers = {};
    for (var k in req.headers) {
        if (k === 'host' || k === 'connection') {
            continue;
        }
        headers[k] = req.headers[k];
    }
    console.log(url);
    console.log(target.path);
    var options = {
        host: target.hostname,
        port: target.port || 80,
        path: target.path,
        method: req.method,
        headers: headers
    };

    var proxyReq = http.request(options, function (response) {
        res.writeHead(response.statusCode, response.headers);
        response.on('data', function (chunk) {
            res.write(chunk);
        });
        response.on('end', function () {
            res.end();
        });
    });

    proxyReq.on('error', function (err) {
        proxyReq.abort();
        res.writeHead(500);
        res.end(url + ' error: ' + err.message);
    });

    req.on('data', function (chunk) {
        proxyReq.write(chunk);
    });
    req.on('end', function () {
        proxyReq.end();
    });
});

app.use(express.static(__dirname));

app.listen(3000);
console.log("Server is launching at http://localhost:3000");