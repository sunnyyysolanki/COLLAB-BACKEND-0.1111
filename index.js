const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const { checkAuth } = require("./middleware/Authcheck");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

require("./model/db");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", require("./routes/user.route"));
app.use("/project", checkAuth, require("./routes/project.route"));
app.get("/profile", checkAuth, (req, res) => {
  return res.status(200).json(req.user);
});

app.use("/ai", require("./routes/ai.route"));

const http = require("http");
const PROJECT = require("./model/project.model");
const { getResult } = require("./controller/ai.controller");
const { generateResult } = require("./ai.service");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  const token =
    socket.handshake?.auth.token ||
    socket.handshake?.headers?.authorization?.split(" ")[1];

  const project_id = socket.handshake?.query.project_id;

  if (!project_id || !mongoose.Types.ObjectId.isValid(project_id)) {
    return next(new Error("Authentication error"));
  }

  socket.project = await PROJECT.findById(project_id);

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decode = jwt.verify(token, process.env.MONGO_SECRET_KEY);
    socket.user = decode;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const isAImessage = data.message.trim().startsWith("@ai");
    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (isAImessage) {
      const prompt = data.message.trim().replace("@ai", "").trim();

      const result = await generateResult(prompt);

      const datas = {
        message: result,
        sender: {
          email: "gemini@ai.com",
        },
      };

      io.to(socket.roomId).emit("project-message", datas);
    }
  });

  socket.on("project-code", async (data) => {
    socket.broadcast.to(socket.roomId).emit("project-code", data);
  });
  socket.on("project-rename", async (data) => {
    socket.broadcast.to(socket.roomId).emit("project-rename", data);
  });
  socket.on("project-delete", async (data) => {
    socket.broadcast.to(socket.roomId).emit("project-delete", data);
  });
  socket.on("project-newfile", async (data) => {
    socket.broadcast.to(socket.roomId).emit("project-newfile", data);
  });
  socket.on("event", (data) => {
    /* … */
  });
  socket.on("disconnect", () => {
    /* … */
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
