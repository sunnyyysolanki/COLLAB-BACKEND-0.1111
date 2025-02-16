const { getResult } = require("../controller/ai.controller");

const route=require("express").Router();

route.get("/result",getResult);

module.exports=route;