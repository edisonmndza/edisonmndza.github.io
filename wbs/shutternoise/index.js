var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let userList = [];
let chatLog = [[]];
let userCount = 0;

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    //when user connects
    socket.emit ('user-connect')

    socket.on('new-user', function(){
      let userDefault = 'user' + userCount
      userCount++;
      //add new user to userList
      userList.push(userDefault);

      //add an identifier for this socket for later use
      socket.name = userDefault;
      socket.color = '000000';

      //let user now who he is
      socket.emit('assigned-name', userDefault)

      //notify everyone about new user
      var res = '<span style="color:#' + socket.color + '"> ' + socket.name + '</span> has entered the room.'
      io.emit('add-message', '', '', getTime(), res, 0)
      
      //update everyone's user list
      io.emit('update-user-list', userList)
    })

    socket.on('add-message', function(msg){
      // check for nickname change
      if(msg.startsWith("/nick ")){
        if (userList.indexOf(msg.substring(6)) == -1){
          //Notify everyone
          var res = 'Server: <span style="color:#' + socket.color + '"> ' + socket.name + '</span>' + 
                    ' renamed to' + 
                    '<span style="color:#' + socket.color + '"> ' + msg.substring(6) + '</span>';
          io.emit('add-message', socket.color, socket.name, getTime(), res, 3);

          //Remove and replace from list & socket name
          userList.splice(userList.indexOf(socket.name), 1);
          socket.name = msg.substring(6)
          userList.push(socket.name);

          //Change saved name on clientside
          socket.emit('assigned-name', socket.name)

          //Update all client list
          io.emit('update-user-list', userList)

        } else {
          var res = 'Server: Sorry, ' + msg.substring(6) + ' is already taken. Please try again.';
          socket.emit('add-message', '', '', getTime(), res, 0);
        }
      } // check for color change
      else if (msg.startsWith("/nickcolor ")){
        //change color
        var holder = socket.color
        socket.color = msg.substring(11);
        
        //Notify everyone
        var res = 'Server: <span style="color:#' + holder + '"> ' + socket.name + '</span>' + 
                          ' color changed to' + 
                          '<span style="color:#' + socket.color + '"> ' + socket.name + '</span>';
        io.emit('add-message', '', '', getTime(), res, 3);

      } else {        
        //send to everyone else
        socket.broadcast.emit('add-message', socket.color, socket.name, getTime(), msg, 2);
        //send to you but bolded
        socket.emit('add-message', socket.color, socket.name, getTime(), msg, 1)
      }
    });

    socket.on('disconnect', function(){
      // find user in the list and remove from list
      userList.splice(userList.indexOf(socket.name), 1);

      // update everyone's list
      io.emit('update-user-list', userList)
      //notify everyone that user left
      var res = '<span style="color:#' + socket.color + '"> ' + socket.name + '</span> has left the room.'
      io.emit('add-message', '', '', getTime(), res, 0)
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getTime(){
  var h = new Date().getHours()
  var m = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
  var currTime = h + ':' + m

  return currTime
}