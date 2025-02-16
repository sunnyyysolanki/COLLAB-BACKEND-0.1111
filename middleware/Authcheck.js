const USER = require("../model/user.model");
const jwt = require("jsonwebtoken");

const checkAuth = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const bearer = auth.startsWith("Bearer");

  if (!bearer) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decode = jwt.verify(token, process.env.MONGO_SECRET_KEY);

    const user = await USER.findById(decode.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = decode;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
  }
};

module.exports = { checkAuth };
