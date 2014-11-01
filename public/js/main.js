var socket = io();

var numUsers;
var isHost = false;
var myName = '';
var selected = 0;
var seletedRoles={};

$('form', '#join').submit(function(){
  myName = $('#m').val();
  if (myName != '') {
    socket.emit('join game', myName);
    $('#join').hide();
    $('#vote').show();
  }
  return false;
});

$('form', '#vote').submit(function() {
  if (selected == (numUsers + 3)) {
    document.getElementById("mp3").play();
    $('.roleSelect').each(function(i, obj) {
      $(this).attr('disabled', 'disabled');
    });
    socket.emit('ready', true, seletedRoles);
  } else {
    socket.emit('ready', false, seletedRoles);
  }
  return false;
});

$('input[class="roleSelect"]').change(function() {
  $(this).context.checked ? selected++ : selected--;
  updateRoles();
});

socket.on('update players', function(msg) {
  numUsers = msg.numUsers;
  $('span', '#vote').text("Vote for " + (numUsers + 3) + " roles:");
  $('#users').text('');
  console.log(msg.usernames);
  for (var key in msg.usernames) {
    $('#users').append($('<li>').text(msg.usernames[key].username + (msg.usernames[key].ready ? " \u2713" : "")));
  }
  updateRoles();
});

function updateRoles() {
  if (selected == (numUsers + 3)) {
    $('#readyBtn').removeAttr('disabled');
  } else {
    $('#readyBtn').attr('disabled', 'disabled');
  }
  $('.roleSelect').each(function(i, obj) {
    if (selected >= (numUsers + 3)) {
      if (!obj.checked) {
        $(this).attr('disabled', 'disabled');
      }
    } else {
      $(this).removeAttr('disabled');
    }
  });
}