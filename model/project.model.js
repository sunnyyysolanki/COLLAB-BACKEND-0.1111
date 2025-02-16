const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
      default: [],
    },
  ],
  fileTree: {
    type: Object,
    default: {},
  },
  messages: [
    {
      message: {
        type: String,
        required: true,
      },
      sender: {
        email: {
          type: String,
          required: true,
        },
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const PROJECT = mongoose.model("projects", projectSchema);

module.exports = PROJECT;
