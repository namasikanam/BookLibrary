const
    Sequelize = require('sequelize'),
    config = require('./config');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    define: { timestamps: false }
});

const
    tables = config.tables,
    models = {
        users: sequelize.define('user', tables.users),
        books: sequelize.define('book', tables.books),
        records: sequelize.define('record', tables.records)
    };

(async () => {
    for (let model in models)
        await models[model].sync({
            force: true
        });
})();

const fs = require('fs');
const path = require('path');

var files = fs.readdirSync('./eBooks');
for (let f of files)
    fs.unlinkSync(path.join('./eBooks', f));