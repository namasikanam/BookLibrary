const fs = require('fs');
const path = require('path');

module.exports = {
    'GET /editBook': async (ctx, next) => {
        var userID = ctx.cookies.get('userID', {
            signed: true
        });
        console.log('Cookie:userID=' + userID);

        if (userID === 'admin') {
            var
                table = ctx.query.table,
                col = ctx.query.col,
                q = ctx.query.q;

            if (table != 'books' && col != 'bookID') return next();
            var book = await ctx.findOne('books', {
                bookID: q
            });
            if (book)
                ctx.render('editBook.njk', {
                    book: book
                });
            else
                ctx.render('admin.njk', {
                    message: {
                        type: 'negative',
                        head: 'Edit Book Failed',
                        body: 'The bookID ' + bookID + " doesn't exist."
                    }
                });
        }
        else return next();
    },
    'POST /editBook': async (ctx, next) => {
        var
            bookID = ctx.request.body.bookID,
            bookName = ctx.request.body.bookName,
            eBook = ctx.request.files.eBook,
            book = await ctx.findOne('books', {
                bookID: bookID
            });
        console.log('bookID=' + bookID);
        console.log('bookName=' + bookName);

        if (book) {
            book.bookName = bookName;
            book.author = ctx.request.body.author;
            book.press = ctx.request.body.press;
            book.returned += ctx.request.body.number;

            if (eBook) {
                book.eBook = eBook.name;
                fs.unlinkSync(path.join('./eBooks', bookID));
                var
                    reader = fs.createReadStream(ctx.request.files.eBook.path),
                    writer = fs.createWriteStream(path.join('./eBooks', bookID));
                reader.pipe(writer);
            }
            book.save();

            ctx.render('editBook.njk', {
                book: book,
                message: {
                    type: 'success',
                    head: 'Edit Book Success',
                    body: 'You have edited the book: ' + bookName + '(' + bookID + ')'
                }
            });
        }
        else ctx.render('admin.njk', {
            message: {
                type: 'negative',
                head: 'Edit Book Failed',
                body: 'The bookID ' + bookID + " doesn't exist."
            }
        });
    },

    'GET /editUser': async (ctx, next) => {
        var userID = ctx.cookies.get('userID', {
            signed: true
        });
        if (userID === 'admin') {
            var
                table = ctx.query.table,
                col = ctx.query.col,
                q = ctx.query.q;

            if (table != 'users' && col != 'userID') return next();
            var user = await ctx.findOne('users', {
                userID: q
            });

            if (user)
                ctx.render('editUser.njk', {
                    user: user
                });
            else ctx.render('admin.njk', {
                message: {
                    type: 'negative',
                    head: 'Edit User Error:',
                    body: 'Username ' + userID + " doesn't exist."
                }
            });
        }
        else return next();
    },
    'POST /editUser': async (ctx, next) => {
        var userID = ctx.request.body.userID,
            userName = ctx.request.body.userName,
            password = ctx.request.body.password,
            exist = await ctx.update('users', userID, {
                password: password,
                userName: userName
            });
        if (exist[0])
            ctx.render('editUser.njk', {
                user: {
                    userID: userID,
                    userName: userName,
                    password: password
                },
                message: {
                    type: 'success',
                    head: 'Edit User Success:',
                    body: 'Username: ' + userID + ', Name: ' + userName
                }
            });
        else ctx.render('admin.njk', {
            message: {
                type: 'negative',
                head: 'Edit User Error:',
                body: 'Username ' + userID + " doesn't exist."
            }
        });
    }
}