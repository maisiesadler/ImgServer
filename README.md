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

Or, if you want to map multiple locations:

```
var server = new imgServer({
    map: [
        {
            from: '/t',
            to: filePath1
        },
        {
            from: '/m',
            to: filePath2
        }
    ],
    port: 3000
});
server.start();
```
