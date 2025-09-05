// controllers/foods.js
const Food = require("../models/food.model");
const GLOBAL_FOOD_DATABASE = require("../data/foods.json");

// ================== ADD FOOD ==================
exports.addFood = async (req, res) => {
  try {
    let { foodName, calories, protein, carbohydrates, fat, meal, servings, date } = req.body;

    // If only foodName is sent (like from global JSON), fetch values from GLOBAL DB
    if ((!calories || !protein) && foodName) {
      const globalFood = GLOBAL_FOOD_DATABASE.find(
        (f) => f.foodName.toLowerCase() === foodName.toLowerCase()
      );
      if (globalFood) {
        calories = globalFood.calories;
        protein = globalFood.protein;
        carbohydrates = globalFood.carbohydrates;
        fat = globalFood.fat;
      }
    }

    if (!foodName || !calories) {
      return res.status(400).json({
        success: false,
        message: "foodName and calories are required",
      });
    }

    const newFood = new Food({
      username: req.user.username,
      foodName,
      calories,
      protein,
      carbohydrates,
      fat,
      meal,
      servings,
      date: date || new Date(),
    });

    await newFood.save();

    res.status(201).json({
      success: true,
      message: "Food added successfully",
      food: newFood,
    });
  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding food",
      error: error.message,
    });
  }
};

// ================== GET FOODS ==================
exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.find({ username: req.user.username }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get Foods Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching foods",
      error: error.message,
    });
  }
};

// ================== DELETE FOOD ==================
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findOneAndDelete({ _id: id, username: req.user.username });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
      food,
    });
  } catch (error) {
    console.error("Delete Food Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting food",
      error: error.message,
    });
  }
};

// ================== SEARCH FOODS ==================
exports.searchFoods = async (req, res) => {
  try {
    const { query } = req.params;
    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    console.log('Search query:', query);
    console.log('User:', req.user ? req.user.username : 'No user');

    let userFoods = [];
    
    // 1️⃣ Search inside user's logged foods (only if user is authenticated)
    if (req.user && req.user.username) {
      try {
        userFoods = await Food.find({
          username: req.user.username,
          foodName: { $regex: query, $options: "i" },
        }).limit(10);
        console.log('User foods found:', userFoods.length);
      } catch (userError) {
        console.error('Error searching user foods:', userError);
      }
    }

    // 2️⃣ Search static JSON
    const globalMatches = GLOBAL_FOOD_DATABASE.filter((food) =>
      food.foodName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
    
    console.log('Global matches found:', globalMatches.length);

    // 3️⃣ Merge results (avoid duplicates)
    const merged = [...userFoods];
    globalMatches.forEach((gf) => {
      if (!merged.some((f) => f.foodName.toLowerCase() === gf.foodName.toLowerCase())) {
        merged.push(gf);
      }
    });

    console.log('Total merged results:', merged.length);

    res.status(200).json({
      success: true,
      count: merged.length,
      foods: merged,
    });
  } catch (error) {
    console.error("Search Foods Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching foods",
      error: error.message,
    });
  }
};
