const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },
    age: {
      type: Number,
      min: 0,
      default: null,
    },
    height: {
      type: Number, // cm
      min: 0,
      default: null,
    },
    weight: {
      type: Number, // kg
      min: 0,
      default: null,
    },
    goal: {
      type: String,
      enum: ["Maintain", "Lose", "Gain"],
      default: "Maintain",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
