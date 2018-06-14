const _und = require("underscore");
const fs = require('fs');
const path = require('path');
module.exports = {
    'GET /': async (ctx, next) => {
        var userID = await ctx.cookies.get('userID', {
            signed: true
        });
        console.log(`Cookie:userID=${userID}`);
        console.log(`ctx.query=${JSON.stringify(ctx.query)}`);
        console.log(`ctx.querystring=${ctx.querystring}`);

        var
            table = ctx.query.table,
            col = ctx.query.col,
            q = ctx.query.q,
            opt = ctx.query.opt;

        if (userID === 'admin') {//admin
            if ((table && col && q) === undefined) ctx.render('admin.njk');
            else {
                if (table === 'books') {//users
                    if (opt === 'del') {
                        if (col != 'bookID') return next();
                        ctx.destroy('books', {
                            bookID: q
                        });
                        ctx.destroy('records', {
                            bookID: q
                        });

                        ctx.render('admin.njk', {
                            bookID: q,
                            message: {
                                type: 'success',
                                head: 'Delete Success:',
                                body: 'The book ' + q + ' is deleted.'
                            }
                        })
                    }
                    else if (opt == 'ebook') {
                        if (col != 'bookID') return next();
                        var book = await ctx.findOne('books', {
                            bookID: q
                        });
                        if (book === null) return ctx.render('admin.njk', {
                            message: {
                                type: 'warning',
                                head: 'Delete warning',
                                body: 'The book ' + q + ' has been deleted by someone.'
                            }
                        });

                        ctx.response.attachment(book['eBook']);
                        ctx.response.body = fs.createReadStream(path.join('./eBooks', book['bookID']));
                    }
                    else {//search
                        ctx.render('admin.njk', {
                            books: await ctx.findAll(table, {
                                [col]: q
                            })
                        });
                    }
                }
                else if (table === 'users') {//readers
                    if (opt === 'del') {
                        if (col != 'userID') return next();
                        ctx.destroy('users', {
                            userID: q
                        });
                        ctx.destroy('records', {
                            userID: q
                        });

                        ctx.render('admin.njk', {
                            userID: q,
                            message: {
                                type: 'success',
                                head: 'Delete Success:',
                                body: 'The user ' + q + ' is deleted.'
                            }
                        })
                    }
                    else {//search
                        ctx.render('admin.njk', {
                            users: await ctx.findAll(table, {
                                [col]: q
                            })
                        });
                    }
                }
                else {//records
                    if (table != 'records') return next();

                    if (opt === 'verify') {
                        if (col != 'recordID') return next();

                        var record = await ctx.findOne('records', {
                            recordID: q
                        });
                        if (record === null) return ctx.render('admin.njk', {
                            type: 'negative',
                            head: 'Record Error',
                            body: 'The book of the record ' + recordID + ' has been deleted by someone.'
                        })

                        var book = await ctx.findOne('books', {
                            bookID: record.bookID
                        });
                        if (book === null) return ctx.render('admin', {
                            type: 'negative',
                            head: 'Book Error',
                            body: 'The book ' + bookID + 'has been deleted by someone.'
                        })

                        if (record.status === 'pending') {
                            record.status = 'lending';
                            record.lendTime = new Date();
                            --book.pending;
                            ++book.lending;
                        }
                        else if (record.status === 'returning') {
                            record.status = 'returned';
                            record.returnTime = new Date();
                            --book.returning;
                            ++book.returned;
                        }
                        else return ctx.render('admin.njk', {
                            message: {
                                type: 'warning',
                                head: 'Verify Warning:',
                                body: 'The record has been verified.'
                            },
                            records: [record]
                        });

                        record.save();
                        book.save();

                        ctx.render('admin.njk', {
                            message: {
                                type: 'success',
                                head: 'Verify Success:',
                                body: 'Record ' + q + 'is verified.'
                            },
                            records: [record]
                        })
                    }
                    else ctx.render('admin.njk', {
                        records: await ctx.findAll(table, {
                            [col]: q
                        })
                    });
                }
            }
        }
        else if (userID && await ctx.findOne('users', { userID: userID })) {//user
            if ((table && col && q) === undefined)
                ctx.render('user.njk', {
                    userID: userID
                });
            else {
                if (opt === 'ebook') {//download ebook
                    if (col != 'bookID') return next();
                    var book = await ctx.findOne('books', {
                        bookID: q
                    });
                    if (book === null) return ctx.render('users', {
                        userID: userID,
                        message: {
                            type: 'negative',
                            head: 'Book Error',
                            body: 'The book ' + q + ' has been deleted.'
                        }
                    })

                    ctx.response.attachment(book['eBook']);
                    ctx.response.body = fs.createReadStream(path.join('./eBooks', book['bookID']));
                }
                else if (opt === 'lend') {//lending request
                    if (col != 'bookID') return next();
                    var book = await ctx.findOne('books', {
                        bookID: q
                    });
                    if (book === null) return ctx.render('users', {
                        userID: userID,
                        message: {
                            type: 'negative',
                            head: 'Lending Request Fail',
                            body: 'No book rest to be lended.'
                        }
                    });

                    if (book.returned) {//request success
                        --book.returned;
                        ++book.pending;

                        book.save();
                        ctx.create('records', {
                            recordID: Math.random() * 2 ** 63,
                            bookID: q,
                            userID: userID,
                            lendTime: new Date(0),
                            returnTime: new Date(0),
                            status: 'pending'
                        });

                        ctx.render('user.njk', {
                            userID: userID,
                            books: [book],
                            message: {
                                type: 'success',
                                head: 'Lending Request Success',
                                message: 'Please wait for admin to verify.'
                            }
                        });
                    }
                    else//request fail
                        ctx.render('user.njk', {
                            userID: userID,
                            books: [book],
                            message: {
                                type: 'negative',
                                head: 'Lending Request Fail',
                                body: 'No book returned to be lended.'
                            }
                        });
                }
                else {//普通search
                    ctx.render('user.njk', {
                        userID: userID,
                        books: await ctx.findAll('books', {
                            [col]: q
                        })
                    });
                }
            }
        }
        else ctx.render('index.njk');//sign out
    }
}