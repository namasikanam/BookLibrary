module.exports = {
    'GET /lends': async (ctx, next) => {
        var userID = ctx.cookies.get('userID', {
            signed: true
        });
        if (userID != 'admin') {
            var
                col = ctx.query.col,
                q = ctx.query.q,
                opt = ctx.query.opt;
            if (opt === 'return') {//还书
                if (col != 'recordID') return next();

                var record = await ctx.findOne('records', {
                    recordID: q,
                    status: 'lending'
                });
                var book = await ctx.findOne('books', {
                    bookID: record.bookID
                });
                if (record === null) return next();//illegal query or record has been returning

                record.status = 'returning';
                --book.lending;
                ++book.returning;

                book.save();
                record.save();

                ctx.render('lends.njk', {
                    userID: userID,
                    records: [record],
                    message: {
                        type: 'success',
                        head: 'Returning Request Success:',
                        body: 'Please wait for admin to verify.'
                    }
                })
            }
            else
                ctx.render('lends.njk', {
                    userID: userID,
                    records: await ctx.findAll('records', {
                        userID: userID,
                        status: 'lending'
                    })
                })
        }
        else return next();
    }
}