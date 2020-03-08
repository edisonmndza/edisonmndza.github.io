src="/socket.io/socket.io.js"
src="https://code.jquery.com/jquery-1.11.1.js"

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
          });
        });