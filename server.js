const app = require("./app");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

const express = require("express");
const app2 = express();
const http = require("http");
const server = http.createServer(app2);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

/* server.listen(3000, () => {
  console.log(`Server listening on port http://localhost:${3000}`);
}); */
