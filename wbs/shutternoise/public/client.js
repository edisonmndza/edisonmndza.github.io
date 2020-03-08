let username;

$(function () {
  var socket = io();
  
  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('add-message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('user-connect', function(){
    socket.emit('new-user');
  })

  socket.on('assigned-name', function(myName){
    username = myName;
  })

  socket.on('update-user-list', function(userList){
    //reset user list
    $('#user-list').text("");

    //add all users
    userList.forEach(function(currUser, ind, arr){
      if (currUser === username) {
        $('#user-list').append($('<li>').html('<b>'+currUser+' (you)</b>'))
      } else {
        $('#user-list').append($('<li>').text(currUser))
      }
    })
  })

  socket.on('populate-chat-box', function(chatLog){
    chatLog.forEach(el => {
      addMessage(el[0], el[1], el[2], el[3], el[4])      
    });
  })

  socket.on('add-message', function(color, sender, timeStamp, msg, type){
    addMessage (color, sender, timeStamp, msg, type)
  });
});

// type 0 = user activity (join/left)
// type 1 = user's message
// type 2 = others' message
// type 3 = server's message (name/color change)
function addMessage(color, sender, timeStamp, msg, type){
  switch (type){
    case 0:
      $('#messages').append($('<li>').html('[' + timeStamp + ']<i> ' + msg + '</i>'));
      break;
    case 1:
      $('#messages').append($('<li>').html('[' + timeStamp + ']<b> ' + 
      '<span style="color:#' + color + '">' + sender + '</span>: ' + 
      msg + '</b>'));
      break;
    case 2: 
      $('#messages').append($('<li>').html( '[' + timeStamp + '] ' + 
      '<span style="color:#' + color + '">' + sender + '</span>: '  + msg));
      break; 
      case 3:
        $('#messages').append($('<li>').html('[' + timeStamp + '] ' + msg));
        break;
  }
  //scroll to bottom
  var element = document.getElementById("messages");
  element.scrollTop = element.scrollHeight - element.clientHeight;
}