const
    path = require('path'),
    mime = require('mime'),
    fs = require('mz/fs');

module.exports = async(ctx, next) => {
    let rpath = ctx.request.path;
    if (rpath.startsWith('/static/')) {
        let fp = path.join(__dirname, rpath);
        if (await fs.exists(fp)) {
            ctx.response.type = mime.lookup(rpath);
            ctx.response.body = await fs.readFile(fp);
            return;
        }
    }
    await next();
}