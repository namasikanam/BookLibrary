module.exports = {
    'GET /signOut': async (ctx, next) => {
        await ctx.cookies.set('userID', '', {
            signed: true,
            expires: '-1',
            maxAge: '0',
            path: '/'
        });
        await ctx.render('index.njk', {
            message: {
                type: 'success',
                head: 'Sign out Success:',
                body: 'You have signed out.'
            }
        });
    },

    'POST /signIn': async (ctx, next) => {
        var
            userID = ctx.request.body.userID,
            password = ctx.request.body.password,
            user = await ctx.findOne('users', {
                userID: userID
            });

        console.log(`userID=${userID}`);
        console.log(`password=${password}`);

        if (userID === 'admin' && password === 'TAisnotadmin.') {
            await ctx.cookies.set('userID', 'admin', {
                signed: true
            });
            ctx.render('admin.njk', {
                message: {
                    type: 'success',
                    head: 'Sign in Success:',
                    body: 'Hi, admin. Welcome to your library.'
                }
            });
        }
        else if (user && user.password === password) {
            await ctx.cookies.set('userID', userID, {
                signed: true
            });
            ctx.render('user.njk', {
                userID: userID,
                message: {
                    type: 'success',
                    head: 'Sign in Success:',
                    body: 'Hi, ' + userID + '. Welcome to your library.'
                }
            });
        }
        else ctx.render('index.njk', {
            message: {
                type: 'negative',
                head: 'Sign in Error:',
                body: 'Invalid username or password.'
            }
        });
    },

    'GET /signUp': async (ctx, next) => {
        ctx.render('signUp.njk');
    },
    'POST /signUp': async (ctx, next) => {
        var userID = ctx.request.body.userID,
            user = await ctx.findOrCreate('users', userID, {
                password: ctx.request.body.password,
                userName: ctx.request.body.userName
            });
        if (user[1]) {
            await ctx.cookies.set('userID', userID, {
                signed: true
            });
            ctx.render('user.njk', {
                userID: userID,
                message: {
                    type: 'success',
                    head: 'Sign up Success:',
                    body: 'Hi, ' + userID + '. Now you have signed in.'
                }
            });
        }
        else ctx.render('signUp.njk', {
            userID: userID
        });
    }
}