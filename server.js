var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;

var usernames = {};
var numUsers = 0;

app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('set nickname', function(msg){
    socket.username = msg;
    usernames[username] = username;
    ++numUsers;
    socket.emit('login', {
      numUsers: numUsers,
      usernames: usernames
    });
    socket.broadcast.emit('user joined', {
      username: username,
      numUsers: numUsers
    })
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});