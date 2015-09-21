module.exports = function(io, chatRooms) {
  var rooms = io.of("/rooms").on("connection", function(socket) {
    console.log("io connection is established");
    socket.emit("roomUpdate", JSON.stringify(chatRooms));

    socket.on("newRoom", function(data) {
      chatRooms.push(data);
      // socket.broadcast.emit("roomUpdate", JSON.stringify(chatRooms));
      socket.broadcast.emit("roomUpdate", JSON.stringify(chatRooms));
    });
  });

  var messages = io.of("/messages").on("connection", function(socket) {
    console.log("connected to the chat room");

    socket.on("joinRoom", function(data) {
      socket.username = data.user;
      socket.userPic = data.userPic;
      socket.join(data.room);
      updateUserList(data.room);
    });

    socket.on("newMessage", function(data) {
      // update message feed for all users except the sender himself
      socket.broadcast.to(data.room).emit("messageFeed", JSON.stringify(data));
    });

    socket.on("updateList", function(data) {
      updateUserList(data.room);
    });

    function updateUserList(room) {
      var getUsers = io.of("/messages").clients(room);
      var userList = [];

      for(var i in getUsers) {
        userList.push({user: getUsers[i].username, userPic: getUsers[i].userPic});
      }

      socket.broadcast.to(room).emit("updateUserList", JSON.stringify(userList));
      socket.to(room).emit("updateUserList", JSON.stringify(userList));
    }
  });
};