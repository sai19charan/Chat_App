const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const socket = require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("db connection working");
  })
  .catch((err) => {
    console.error("db connection error:", err);
  });

  const server = app.listen(process.env.PORT, () => {
    console.log(`server started on port ${process.env.PORT}`);
  })
  
  
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
app.use("/api/auth", authRoutes(io));
app.use("/api/messages", messageRoutes);


//module.exports = { io };

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  //global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    sendOnlineUsers();
    // onlineUsers.forEach((socketId, userId) => {
    //   console.log(`User ID: ${userId}, Socket ID: ${socketId}`);
    // });          
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    const snobj = { msg: data.msg, from: data.from };
    // console.log("from ",data.from);
    //   if (sendUserSocket) {
    //     socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    //   }
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", snobj);
    }
  });
  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      //console.log(`User disconnected: ${disconnectedUserId}`);
    }
    sendOnlineUsers()
  });
});

const sendOnlineUsers = () => {
  const onlineUserIds = Array.from(onlineUsers.keys());
  console.log("Broadcasting online users:", onlineUserIds);
  io.emit("online-users", onlineUserIds); // Broadcast online users to all clients
};