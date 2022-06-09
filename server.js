const http = require("http");
let app = require("./app");

(err, req, res) => {
  console.error("ERROR", req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render("error");
  }
};

let server = http.createServer(app);

let io = require("socket.io")(server);
app.io = io;
io.attach(server, {
  allowEIO4: true,
  cors: {
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

/* app.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
}); */

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
});
