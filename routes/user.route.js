const route = require("express").Router();
const { get } = require("mongoose");
const {
  handlelogin,
  handlesignup,
  getusers,
} = require("../controller/user.controller");
const { checkAuth } = require("../middleware/Authcheck");

route.post("/login", handlelogin);

route.post("/signup", handlesignup);
route.get("/", checkAuth, getusers);

module.exports = route;
