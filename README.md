# ImgServer
A small js library for serving static files

Supported types:
> * .html 
> * .txt
> * .css
> * .gif
> * .jpg
> * .png
> * .svg
> * .js

### Example:
```
var server = new imgServer({
    dir: filePath,
    port: 3000
});
server.start();
```
