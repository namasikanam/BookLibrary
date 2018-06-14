const Sequelize = require('sequelize');

module.exports = {
    database: 'lib',
    username: 'root',
    password: 'Winter_is_coming',
    host: 'localhost',
    port: 3306,

    tables: {
        debug: true,

        users: {
            userID: {
                type: Sequelize.STRING(16),
                primaryKey: true
            },
            userName: Sequelize.STRING(32),
            password: Sequelize.STRING(24)
        },
        books: {
            bookID: {
                type: Sequelize.STRING(128),
                primaryKey: true
            },
            bookName: Sequelize.STRING(128),
            author: Sequelize.STRING(128),
            press: Sequelize.STRING(128),
            pending: Sequelize.INTEGER,
            lending: Sequelize.INTEGER,
            returning: Sequelize.INTEGER,
            returned: Sequelize.INTEGER,
            eBook: Sequelize.STRING(128)
        },
        records: {
            recordID: {
                type: Sequelize.BIGINT,
                primaryKey: true
            },
            bookID: Sequelize.STRING(128),
            userID: Sequelize.STRING(16),
            lendTime: Sequelize.DATE,
            returnTime: Sequelize.DATE,
            status: Sequelize.STRING(9)//"pending","lending","returning","returned"
        }
    }
};