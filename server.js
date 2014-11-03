var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;
var path = require('path');

var host = '';
var usernames = {};
var numUsers = 0;
var roles = {'Werewolf1': 0, 'Werewolf2': 0, 'Minion': 0, 'Tanner': 0,
  'Villager1': 0, 'Villager2': 0, 'Villager3': 0, 'Seer': 0, 'Mason1': 0,
  'Mason2': 0, 'Robber': 0, 'Troublemaker': 0, 'Drunk': 0, 'Hunter': 0,
  'Insomniac': 0, 'Doppleganger': 0}
var rolesInGame = [];

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
    ++numUsers;
    addedUser = true;
    updatePlayers();
  });

  socket.on('ready', function(isReady, selectedRoles) {
    usernames[socket.username] = {
      username: socket.username,
      ready: isReady
    };
    for (var key in selectedRoles) {
      roles[key] = roles[key] + (isReady ? 1 : -1);
      if (roles[key] < 0) {
        roles[key] = 0;
      }
    }
    updatePlayers();
  });

  socket.on('start game', function() {
    io.emit('hide vote');
    for (var i = 0; i < numUsers + 3; i++) {
      var max = '';
      var same = {};
      for (var key in roles) {
        if (max == '') {
          max = key;
        } else if (roles[key] > roles[max]) {
          max = key;
          same = {};
        } else if (roles[key] == roles[max] && key != max) {
          same[key] = true;
          same[max] = true;
        }
      }
      var rolesArray = Object.keys(same);
      if (rolesArray.length > 1) {
        console.log(rolesArray);
        var newNum = Math.random() * rolesArray.length;
        console.log(newNum);
        max = rolesArray[Math.floor(newNum)];
      }
      rolesInGame[i] = max;
      roles[max] = 0;
    }
    for (var key in roles) {
      roles[key] = 0;
    }
    io.emit('roles in game', rolesInGame);
  });

  socket.on('disconnect', function() {
    if (addedUser) {
      if (usernames[socket.username].ready) {
        for (var key in roles) {
          roles[key] = 0;
        }
      }
      delete usernames[socket.username];
      if (host == socket.username) {
        var keyArray = Object.keys(usernames);
        var len = keyArray.length;
        if (len == 0) {
          host = '';
        } else {
          host = usernames[keyArray[Math.floor(Math.random() * len)]].username;
        }
      }
      numUsers--;
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