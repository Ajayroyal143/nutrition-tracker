// models/food.model.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const foodSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: [0, "Calories cannot be negative"],
    },
    protein: {
      type: Number,
      required: true,
      min: [0, "Protein cannot be negative"],
    },
    carbohydrates: {
      type: Number,
      required: true,
      min: [0, "Carbohydrates cannot be negative"],
    },
    fat: {
      type: Number,
      required: true,
      min: [0, "Fat cannot be negative"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now, // default to today if not provided
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Index for faster queries (by username + date)
foodSchema.index({ username: 1, date: -1 });

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
