# ImgServer
A small js library for serving static files

Supported types:
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'

### Example:
```
var server = new imgServer({
    dir: filePath,
    port: 3000
});
server.start();
```
