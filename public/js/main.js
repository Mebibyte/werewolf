var socket = io();

var numUsers;
var myName = '';
var selected = 0;
var selectedRoles = {};
var ready = false;

$('form', '#join').submit(function(){
  myName = $('#m').val();
  if (myName != '') {
    socket.emit('join game', myName);
    $('#join').hide();
    $('#vote').show();
  }
  return false;
});

$('#readyBtn').click(function() {
  if (selected == (numUsers + 3)) {
    $('.roleSelect').each(function(i, obj) {
      $(this).attr('disabled', 'disabled');
    });
    ready = true;
    socket.emit('ready', ready, selectedRoles);
    $('#readyBtn').hide();
    $('#unreadyBtn').show();
  } else {
    ready = false;
    socket.emit('ready', ready, selectedRoles);
  }
  return false;
});

$('#unreadyBtn').click(function() {
  ready = false;
  $('#readyBtn').show();
  $('#unreadyBtn').hide();
  $('.roleSelect').each(function(i, obj) {
    if (obj.checked) {
      $(this).removeAttr('disabled');
    }
  });
  socket.emit('ready', ready, selectedRoles);
  return false;
});

$('#startGame').click(function() {
  document.getElementById("mp3").play();
  socket.emit('start game');
});

$('input[class="roleSelect"]').change(function() {
  if ($(this).context.checked) {
    selected++;
    selectedRoles[$(this).val()] = true;
  } else {
    selected--;
    delete selectedRoles[$(this).val()];
  }
  updateRoles();
});

socket.on('name change', function(username) {
  myName = username;
});

socket.on('update players', function(msg) {
  numUsers = msg.numUsers;
  $('span', '#vote').text("Vote for " + (numUsers + 3) + " roles:");
  var allReady = true;
  var isHost = msg.host == myName;
  $('#users').text('');
  if (selected != (numUsers + 3) && ready) {
    ready = false;
    socket.emit('ready', ready, selectedRoles);
  }
  for (var key in msg.usernames) {
    if (!msg.usernames[key].ready) {
      allReady = false;
    }
    $('#users').append($('<li>').text(msg.usernames[key].username + (msg.usernames[key].ready ? " \u2713" : "") + (key == msg.host ? " \u2654" : "")));
  }
  if (isHost) {
    $("#startGame").show();
    if (allReady) {
      $("#startGame").removeAttr('disabled');
    } else {
      $('#startGame').attr('disabled', 'disabled');
    }
  } else {
    $("#startGame").hide();
  }
  updateRoles();
});

socket.on('hide vote', function() {
  $('#vote').hide();
});

socket.on('roles in game', function(roles) {
  $('#rolesInGame').show();
  for (var idx in roles) {
    $('#roles').append($('<li>').text(roles[idx]));
  }
});

function updateRoles() {
  if (selected == (numUsers + 3)) {
    $('#readyBtn').removeAttr('disabled');
  } else {
    $('#readyBtn').attr('disabled', 'disabled');
    $('#readyBtn').show();
    $('#unreadyBtn').hide();
  }
  $('.roleSelect').each(function(i, obj) {
    if (selected > (numUsers + 3)) {
      if (!obj.checked) {
        $(this).attr('disabled', 'disabled');
      } else {
        $(this).removeAttr('disabled');
      }
    } else if (selected == (numUsers + 3)) {
      if (!obj.checked) {
        $(this).attr('disabled', 'disabled');
      }
    } else {
      $(this).removeAttr('disabled');
    }
  });
}

socket.on('game in progress', function() {
  $('#wrapper').hide();
});