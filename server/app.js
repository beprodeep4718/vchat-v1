const express = require("express");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("node:http");

const PORT = process.env.PORT || 3000;
const server = createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://172.16.104.10:5173"],
    methods: ["GET", "POST"],
  })
);

app.get("/", (req, res) => {
  res.send("Hello world");
});

const userToSocket = new Map();
const socketToUser = new Map();

const io = new Server(server, {
  cors: true,
});
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  
  socket.on("room:join", (data) => {
    const { username, room } = data;

    userToSocket.set(data.username, socket.id);
    socketToUser.set(socket.id, data.username);

    io.to(room).emit("user:joined", {username, id: socket.id});
    socket.join(room);

    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ offer, to }) => {
    io.to(to).emit("incomming:call", { offer, from: socket.id });
  })

  socket.on("call:accepted", ({ answer, to }) => {
    io.to(to).emit("call:accepted", { answer, from: socket.id });
  })

  socket.on("peer:nego:needed", ({ offer, to }) => {
    io.to(to).emit("peer:nego:needed", { offer, from: socket.id });
  });

  socket.on("peer:nego:done", ({ answer, to }) => {
    io.to(to).emit("peer:nego:final", { answer, from: socket.id });
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
