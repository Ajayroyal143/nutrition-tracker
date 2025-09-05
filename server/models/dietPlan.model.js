// models/dietPlan.model.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mealSchema = new Schema(
  {
    food: {
      type: Schema.Types.ObjectId,
      ref: "Food", // ✅ reference to logged food items
      required: false, // Make optional for static foods
    },
    foodName: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    carbohydrates: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    servings: {
      type: Number,
      default: 1,
      min: [1, "Servings must be at least 1"],
    },
  },
  { _id: false }
);

const dietPlanSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    targetCalories: {
      type: Number,
      required: true,
      min: [0, "Target calories cannot be negative"],
    },
    targetProtein: {
      type: Number,
      required: true,
      min: [0, "Target protein cannot be negative"],
    },
    targetCarbohydrates: {
      type: Number,
      required: true,
      min: [0, "Target carbohydrates cannot be negative"],
    },
    targetFat: {
      type: Number,
      required: true,
      min: [0, "Target fat cannot be negative"],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    // 🔥 Meals with food references
    meals: {
      Breakfast: [mealSchema],
      Lunch: [mealSchema],
      Dinner: [mealSchema],
      Snacks: [mealSchema],
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query plans by user
dietPlanSchema.index({ username: 1, startDate: 1 });

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

module.exports = DietPlan;
