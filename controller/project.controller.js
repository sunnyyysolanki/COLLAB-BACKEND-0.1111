const PROJECT = require("../model/project.model");
const USER = require("../model/user.model");

exports.getProjects = async (req, res) => {
  const { id } = req.user;

  try {
    const projects = await PROJECT.find({ user: id }).populate(
      "user",
      "name email _id"
    );

    return res.status(200).json({ success: true, projects });
  } catch (err) {
    return res.status(401).json(err);
  }
};

exports.createProjects = async (req, res) => {
  const { id } = req.user;
  const { project_name } = req.body;

  try {
    const find_project = await PROJECT.findOne({ name: project_name });

    if (find_project) {
      return res
        .status(400)
        .json({ message: "Project already exists", success: false });
    }

    const project = PROJECT.create({
      name: project_name,
      user: id,
    });
    return res.status(200).json({ success: true, project });
  } catch (err) {
    return res.status(500).json("internal error");
  }
};

exports.Add_Collaborators = async (req, res) => {
  const { users, project_id } = req.body;

  if (!users || !project_id) {
    return res.status(400).json({ message: "Invalid request", success: false });
  }

  try {
    const project = await PROJECT.findById(project_id);

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found", success: false });
    }

    // Check if all users exist
    // const existingUsers = await USER.find({ _id: { $in: users } });
    // if (existingUsers.length !== users.length) {
    //   return res
    //     .status(404)
    //     .json({ message: "One or more users not found", success: false });
    // }

    const existingUsers = project.user.filter((user) =>
      users.includes(user.toString())
    );

    if (existingUsers.length) {
      return res.status(400).json({
        message: "One or more users are already collaborators",
        success: false,
      });
    }

    project.user.push(...users);
    await project.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json("internal error");
  }
};

exports.getSingleProject = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const project = await PROJECT.findById(id).populate(
      "user",
      "name email _id"
    );

    const isUserAuthorized = project.user.some(
      (user) => user._id.toString() === user_id
    );

    if (!isUserAuthorized) {
      return res.status(403).json({ message: "Not Found", success: false });
    }

    if (!project) {
      return res.status(404).json({ message: "Not found", success: false });
    }
    return res.status(200).json({ success: true, project });
  } catch (err) {
    return res.status(401).json(err);
  }
};

exports.editFileTree = async (req, res) => {
  const { project_id, fileTree } = req.body;
  const { id } = req.user;

  try {
    const project = await PROJECT.findById(project_id);
    if (!project) {
      return res.status(404).json({ message: "Not found", success: false });
    }

    // Ensure `project.user` exists and is an array
    const isUserAuthorized =
      Array.isArray(project.user) &&
      project.user.some((user) => user._id.toString() === id);

    if (!isUserAuthorized) {
      return res.status(403).json({ message: "Not Allowed", success: false });
    }

    // Update fileTree and save project
    project.fileTree = fileTree;
    await project.save();

    return res.status(200).json({ success: true, message: "Save successful" });
  } catch (err) {
    console.error(err); // Log error for debugging
    return res.status(500).json({ message: "Internal Error", success: false });
  }
};

exports.AddChatMessage = async (req, res) => {
  const { project_id, message, sender } = req.body;

  const { id } = req.user;

  try {
    const project = await PROJECT.findById(project_id);

    if (!project) {
      return res.status(404).json({ message: "Not found", success: false });
    }
    // Ensure `project.user` exists and is an array
    const isUserAuthorized =
      Array.isArray(project.user) &&
      project.user.some((user) => user._id.toString() === id);

    if (!isUserAuthorized) {
      return res.status(403).json({ message: "Not Allowed", success: false });
    }

    project.messages = [
      ...project.messages,
      {
        message: message,
        sender: {
          email: sender.email,
        },
      },
    ];
    await project.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Not Allowed", success: false });
  }
};
