const server = require('./app');

server.listen(process.env.PORT || 6969, function() {
  console.log('Server listening on port 6969...');
});
