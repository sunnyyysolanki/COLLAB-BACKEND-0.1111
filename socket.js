const io = require("socket.io");

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

module.exports = io;
