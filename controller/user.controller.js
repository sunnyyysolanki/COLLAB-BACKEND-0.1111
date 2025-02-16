const USER = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.handlelogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await USER.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const decrypt = await bcrypt.compare(password, user.password);
  if (!decrypt) {
    return res.status(404).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.MONGO_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  return res
    .status(200)
    .json({ message: "Login successful", token: token, success: true });
};

exports.handlesignup = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await USER.findOne({ email: email });

  if (user) {
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  }

  const hash = await bcrypt.hash(password, 10);

  const new_user = await USER.create({
    name: name,
    email: email,
    password: hash,
  });

  return res
    .status(200)
    .json({ message: "User created successfully", success: true });
};

exports.getusers = async (req, res) => {
  try {
    const users = await USER.find({}).select("-password -__v");
    return res.status(200).json({ success: true, users: users });
  } catch (err) {
    return res.status(401).json(err);
  }
};
