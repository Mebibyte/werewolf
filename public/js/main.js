var socket = io();

var numUsers;
var myName = '';
var selected = 0;
var seletedRoles = {};

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
    socket.emit('ready', true, seletedRoles);
    $('#readyBtn').hide();
    $('#unreadyBtn').show();
  } else {
    socket.emit('ready', false, seletedRoles);
  }
  return false;
});

$('#unreadyBtn').click(function() {
  $('#readyBtn').show();
  $('#unreadyBtn').hide();
  $('.roleSelect').each(function(i, obj) {
    if (obj.checked) {
      $(this).removeAttr('disabled');
    }
  });
  socket.emit('ready', false, seletedRoles);
  return false;
});

$('#startGame').click(function() {
  document.getElementById("mp3").play();
});

$('input[class="roleSelect"]').change(function() {
  $(this).context.checked ? selected++ : selected--;
  updateRoles();
});

socket.on('name change', function(username) {
  myName = username;
});

socket.on('update players', function(msg) {
  numUsers = msg.numUsers;
  $('span', '#vote').text("Vote for " + (numUsers + 3) + " roles:");
  $('#users').text('');
  var allReady = true;
  var isHost = msg.host == myName;
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
  }
  updateRoles();
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