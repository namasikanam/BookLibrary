const
    fs = require('fs'),
    router = require('koa-router')();

for (var f of (fs.readdirSync('./controllers')).filter(f => f.endsWith('.js'))) {
    let mapping = require('./controllers/' + f);
    for (var url in mapping)
        if (url.startsWith('GET ')) {
            router.get(url.substring(4), mapping[url]);
            console.log(`register URL mapping: ${url}`);
        }
        else if (url.startsWith('POST ')) {
            router.post(url.substring(5), mapping[url]);
            console.log(`register URL mapping: ${url}`);
        }
}

module.exports = router.routes();