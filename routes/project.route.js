const {
  getProjects,
  createProjects,
  Add_Collaborators,
  getSingleProject,
  editFileTree,
  AddChatMessage,
} = require("../controller/project.controller");
const { checkAuth } = require("../middleware/Authcheck");

const route = require("express").Router();

route.get("/", getProjects);
route.post("/", createProjects);
route.post("/collaborator", Add_Collaborators);
route.get("/:id", getSingleProject);
route.put("/file-tree", editFileTree);
route.put("/chat-message", AddChatMessage);

module.exports = route;
