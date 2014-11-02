var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;
var path = require('path');

var host = '';
var usernames = {};
var numUsers = 0;

// Index
app.get('/', function(req, res){
  res.sendFile('index.html', {root: __dirname});
});
// Music
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  var addedUser = false;
  updatePlayers();
  socket.on('join game', function(username){
    // Ensures Unique Usernames
    var newUserName = username;
    var count = 1;
    while (newUserName in usernames) {
      newUserName = username + count++;
    }
    username = newUserName;
    if (count > 1) {
      socket.emit("name change", username);
    }

    // First player is initially host
    if (host == '') {
      host = username;
      socket.emit("become host");
    }
    socket.username = username;
    usernames[socket.username] = {
      username: socket.username,
      ready: false
    };
    for (var key in usernames) {
      usernames[key].ready = false;
    }
    ++numUsers;
    addedUser = true;
    updatePlayers();
  });

  socket.on('ready', function(isReady, selectedRoles) {
    usernames[socket.username] = {
      username: socket.username,
      ready: isReady
    };
    updatePlayers();
  });

  socket.on('disconnect', function() {
    if (addedUser) {
      delete usernames[socket.username];
      numUsers--;
      for (var key in usernames) {
        usernames[key].ready = false;
      }
      updatePlayers();
    }
  });
});

function updatePlayers() {
  io.emit('update players', {
    numUsers: numUsers,
    usernames: usernames,
    host: host
  });
};

http.listen(port, function(){});