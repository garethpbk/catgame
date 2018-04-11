const express = require('express');
/* const phaser = require('phaser-ce'); */

const app = express();

app.use(express.static('./dist'));

app.get('/', function(err, req, res) {
  err ? console.log(err) : res.writeHead(200, { 'Content-Type': 'text/html' });
});

module.exports = app;
