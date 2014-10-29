var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;

var host = '';
var usernames = {};
var numUsers = 0;

app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
  var addedUser = false;
  socket.emit('first join', {
    usernames: usernames
  });
  socket.on('set nickname', function(username){
    if (host == '') {
      host = username;
    }
    socket.username = username;
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers,
      usernames: usernames
    });
    io.emit('user joined', {
      username: username,
      numUsers: numUsers
    })
  });
  socket.on('disconnect', function() {
    if (addedUser) {
      delete usernames[socket.username];
      numUsers--;

      io.emit('user left', {
        usernames: usernames
      })
    }
  });
});

http.listen(port, function(){});