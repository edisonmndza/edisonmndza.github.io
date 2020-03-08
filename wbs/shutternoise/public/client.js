$(function () {
  var socket = io();
  $('form').submit(function(e){
  e.preventDefault(); // prevents page reloading
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
  });
  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    scrollToBottom();
  });

});

function scrollToBottom(){
  var element = document.getElementById("messages");
  element.scrollTop = element.scrollHeight - element.clientHeight;
}
