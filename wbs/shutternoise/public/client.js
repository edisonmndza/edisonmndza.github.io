$(function () {
  var socket = io();
  
  $('form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('add-message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('user-connect', function(){
    let username = document.cookie.replace(/(?:(?:^|.*;\s*)__user_name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (username == "") { 
      alertBox()
      socket.emit('new-user');
    }
    else {
      let usercolor = document.cookie.replace(/(?:(?:^|.*;\s*)__user_color\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      socket.emit('return-user', username, usercolor)
    }
  })

  socket.on('update-client-info', function(myName, myColor){
    document.cookie = "__user_name = " + myName + ";" 
    document.cookie = "__user_color = " + myColor + ";";
    console.log(document.cookie)
  })

  socket.on('update-user-list', function(userList){
    //reset user list
    $('#user-list').text("");

    //add all users
    userList.forEach(function(currUser, ind, arr){
      let username = document.cookie.replace(/(?:(?:^|.*;\s*)__user_name\s*\=\s*([^;]*).*$)|^.*$/, "$1");
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
        $('#messages').append($('<li>').html(msg));
        break;
  }
  //scroll to bottom
  let element = document.getElementById("messages");
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

function alertBox(){
  alert("Welcome to ShutterNOISE! \n type /nick [new-name] to change the username \n type /nickcolor RRGGBB to change color")
}
