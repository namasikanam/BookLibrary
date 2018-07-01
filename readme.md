## Introduction

This is an ordinary web application demo for a book library.

Some fundamental functions of a book library is supported.

The UI is powered by [Semantic-UI](https://semantic-ui.com/). The server is powered by [koa-2](https://koajs.com/).

## Deploy

You can get it from github.

```
git clone https://github.com/ta1111/BookLibrary
cd BookLibrary
```

Make sure that [npm](https://www.npmjs.com/) and [Node.js](https://nodejs.org/en/) are available and install dependencies.

```
npm install
```

### Database

We use [Sequelize](http://docs.sequelizejs.com/), which supports MySql, Sqlite, PostgreSQL, Microsoft SQL.

You need to set your config in `config.js`.

For the storage of files, we also use file system. And it is not well tested in Linux and mac OS. So Windows is suggested.

## Run

### Start
```
node app.js
```
or
```
npm start
```

### Debug
```
npm debug
```

### Clean

Clean the tables in the database and files of ebooks in file system.
```
npm clean
```