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

//该怎样让这里强行同步呢？
//我没有继续考虑这个问题，因为这里的异步只是在服务器刚刚启动的时候出现，对客户端的影响我猜可以忽略不计。
(async () => {
    for (let model in models)
        await models[model].sync();
})();

module.exports = async (ctx, next) => {
    //精确检索
    ctx.findOne = async (table, where) => {
        if ((table && where) === undefined) throw new Error("No enough arguments for findOne!");

        return models[table].findOne({
            where: where
        });
    };
    ctx.findAll = async (table, where) => {
        if ((table && where) === undefined) throw new Error("No enough arguments for findAll!");

        return models[table].findAll({
            where: where
        });
    };

    //有就加进去，否则就不加。
    ctx.findOrCreate = async (table, ID, defaults) => {
        if ((table && ID && defaults) === undefined) throw new Error("No enough arguments for findOrCreate!");
        return models[table].findOrCreate({
            where: {
                [table.substring(0, table.length - 1) + "ID"]: ID
            },
            defaults: defaults
        });
    };
    ctx.create = async (table, instance) => {
        return models[table].create(instance);
    }

    //更新
    ctx.update = async (table, ID, set) => {
        return models[table].update(set, {
            where: {
                [table.substring(0, table.length - 1) + 'ID']: ID
            }
        });
    };

    //删除还是需要绑定的
    ctx.destroy = async (table, where) => {
        return models[table].destroy({
            where: where
        });
    }

    await next();
}