var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let userList = [];
let chatLog = []; //at least the last 200 messages?? no cap
let userCount = 0;

app.use(express.static('public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    //when user connects
    socket.emit ('user-connect')

    //on new user
    socket.on('new-user', function(){
      let userDefault = 'user' + userCount
      userCount++;
      //add new user to userList
      userList.push(userDefault);

      //add an identifier for this socket for later use
      socket.name = userDefault;
      socket.color = '000000';

      //let user now who he is (update cookie)
      socket.emit('update-client-info', socket.name, socket.color)

      //notify everyone else bout new user
      let res = '<span style="color:#' + socket.color + '"> ' + socket.name + '</span> has entered the room.'
      socket.broadcast.emit('add-message', '', '', getTime(), res, 0)
      chatLog.push(['', '', getTime(), res, 0])

      //fill new user's messagebox
      socket.emit('populate-chat-box', chatLog)      
      
      //update everyone's user list
      io.emit('update-user-list', userList)
    })

    //on reconnecting user
    socket.on('return-user',function(name, color){
      // let server know who user is
      socket.color = color  

      // check if name was taken while user was away
      if (userList.indexOf(name) == -1){
        socket.name = name
      } else {
        //if it is then give a new user default
        let userDefault = 'user' + userCount
        userCount++;
        socket.name = userDefault

        //Change saved name on client cookie
        socket.emit('update-client-info', socket.name, socket.color)
      }

      //add user back to userlist
      userList.push(socket.name)
      io.emit('update-user-list', userList)

      //notify everyone else bout new user
      let res = '<span style="color:#' + socket.color + '"> ' + socket.name + '</span> has entered the room.'
      socket.broadcast.emit('add-message', '', '', getTime(), res, 0)
      chatLog.push(['', '', getTime(), res, 0])

      //fill new user's messagebox
      socket.emit('populate-chat-box', chatLog)      
    })

    socket.on('add-message', function(msg){
      // Check for nickname change
      if(msg.startsWith("/nick ")){
        if (userList.indexOf(msg.substring(6)) == -1){
          //Notify everyone
          let res = 'Server: <span style="color:#' + socket.color + '"> ' + socket.name + '</span>' + 
                    ' renamed to' + 
                    '<span style="color:#' + socket.color + '"> ' + msg.substring(6) + '</span>';                    
          io.emit('add-message', '', '', getTime(), res, 3);
          chatLog.push(['', '', getTime(), res, 3])

          //Remove and replace from list & socket name
          userList.splice(userList.indexOf(socket.name), 1);
          socket.name = msg.substring(6)
          userList.push(socket.name);

          //Change saved name on client cookie
          socket.emit('update-client-info', socket.name, socket.color)

          //Update all client list
          io.emit('update-user-list', userList)

        } else {
          let res = '<span style="color:#ED4337"> Error: ' + msg.substring(6) + ' is already taken. Please try again. </span>';
          socket.emit('add-message', '', '', getTime(), res, 3);
        }

      } //Check for color change
      else if (msg.startsWith("/nickcolor ")){
        const regex = /^[0-9, A-F, a-f]{6}$/gm;
        if (!msg.substring(11).match(regex)){
          let res = '<span style="color:#ED4337"> Error: Please type color in hexcode (000000 - ffffff). </span>';
          socket.emit('add-message', '', '', getTime(), res, 3);
        } else {
          //Change color
          let holder = socket.color
          socket.color = msg.substring(11);

          //Change saved color on client cookie
          socket.emit('update-client-info', socket.name, socket.color)

          //Notify everyone
          let res = 'Server: <span style="color:#' + holder + '"> ' + socket.name + '</span>' + 
                          ' color changed to' + 
                          '<span style="color:#' + socket.color + '"> ' + socket.name + '</span>';
          io.emit('add-message', '', '', getTime(), res, 3);
          chatLog.push(['', '', getTime(), res, 3])
        }
      } //check for other slash
      else if (msg.startsWith("/")){
        let res = '<span style="color:#ED4337"> Error: Command does not exist. Please try again. </span>';
        socket.emit('add-message', '', '', getTime(), res, 3);
      }
      else {        
        //Send to everyone else
        socket.broadcast.emit('add-message', socket.color, socket.name, getTime(), msg, 2);
        //Send to you but bolded
        socket.emit('add-message', socket.color, socket.name, getTime(), msg, 1)
        chatLog.push([socket.color, socket.name, getTime(), msg, 2])
      }
    });

    socket.on('disconnect', function(){
      // find user in the list and remove from list
      userList.splice(userList.indexOf(socket.name), 1);

      // update everyone's list
      io.emit('update-user-list', userList)
      //notify everyone that user left
      let res = '<span style="color:#' + socket.color + '"> ' + socket.name + '</span> has left the room.'
      io.emit('add-message', '', '', getTime(), res, 0)
      chatLog.push(['', '', getTime(), res, 0])
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function getTime(){
  let h = new Date().getHours()
  let m = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
  let currTime = h + ':' + m

  return currTime
}