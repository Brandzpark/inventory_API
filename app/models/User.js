const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    role: {
      type: String,
    },
    image: {
      type: String,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    permissions: []
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
