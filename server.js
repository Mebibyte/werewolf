var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;

app.get('/', function(req, res){
    res.sendFile('index.html', {root: __dirname});
});

io.on('connection', function(socket){
    socket.nickname = "Guest" + Object.keys(io.sockets.connected).length;
    socket.on('chat message', function(msg){
        io.emit('chat message', socket.nickname + ": " + msg);
    });
    socket.on('set nickname', function (name) {
        socket.nickname = name;
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});