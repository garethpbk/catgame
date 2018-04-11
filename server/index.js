const server = require('./app');

server.listen(process.env.PORT || 3000, function () {
  console.log('Server listening on port 3000...');
});
