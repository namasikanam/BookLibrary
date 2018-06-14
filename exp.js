'use strict';

const app = new (require('koa'))();
const logger = require('koa-logger');
const nunjucks = require('nunjucks');
const koaBody = require('koa-body');

const staticfiles = require('./staticfiles');
const controller = require('./controller');
const database = require('./database');

//logger
app.use(logger());

//读取静态文件
app.use(staticfiles);

//绑定render
app.use(async (ctx, next) => {
    const env = nunjucks.configure('views', {
        watch: true
    })
    ctx.render = function (view, model) {
        ctx.response.type = 'text/html';
        ctx.response.body = env.render(view, model);

        console.log(`Render:${view}:`);
        for (let prop in model) console.log(`   ${prop}:${model[prop]}`);
    };
    await next();
})

//绑定sequelize方法
app.use(database);

//bodyParser
app.use(koaBody({
    multipart: true
}));

//route
app.keys = ['secret', 'key'];
app.use(async (ctx, next) => {
    ctx.render('exp.njk', {
        value: 'zzz'
    });
})

//404

app.listen(3000, function () {
    console.log('Web app is listening on port 3000!');
});