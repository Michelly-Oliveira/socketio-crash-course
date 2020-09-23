const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/formatMessage");
const {
  userJoinRoom,
  getCurrentUser,
  userLeaveRoom,
  getRoomUsers,
} = require("./utils/users");

const PORT = process.env.PORT || 3000;

const app = express();
// Create a http server manually
const httpServer = http.createServer(app);
// Create the socket server using the http server
const socketServer = socketio(httpServer);

// Server static files to client - public folder containing HTML files
app.use(express.static(path.join(__dirname, "..", "public")));

const botName = "ChatCord Bot";

// Run when client connects to the server
socketServer.on("connection", (socket) => {
  // What to do when a user 'asks' to join a room: add it to the room, send a welcome msg to the user and a msg to all other users in that room saying that the user joined
  socket.on("joinRoom", ({ username, room }) => {
    // Create user object
    const user = userJoinRoom(socket.id, username, room);

    // Add user to the room
    socket.join(user.room);

    // Send only to the user that triggred the event
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord"));

    // Broadcast when a user connects to all other users in that room
    // broadcast = send  event to all other users, except the one that triggered the event
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    socketServer.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    // Get user
    const user = getCurrentUser(socket.id);

    // Send message to all clients
    socketServer
      .to(user.room)
      .emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    // Get user
    const user = userLeaveRoom(socket.id);

    if (user) {
      // send event to every user in the room
      socketServer
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );

      // Send users and room info
      socketServer.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Instead of using app.listen, user httpServer.listen - app isn't the server anymore, it's just an instance of express
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
