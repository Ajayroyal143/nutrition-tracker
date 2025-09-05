const DietPlan = require("../models/dietPlan.model");

// ================== CREATE PLAN ==================
exports.createPlan = async (req, res) => {
  try {
    const { 
      planName, 
      startDate, 
      endDate, 
      meals, 
      targetCalories, 
      targetProtein, 
      targetCarbohydrates, 
      targetFat 
    } = req.body;

    if (!planName || !targetCalories) {
      return res.status(400).json({
        success: false,
        message: "Plan name and target calories are required",
      });
    }

    const newPlan = new DietPlan({
      username: req.user.username,
      planName,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      meals: meals || {
        Breakfast: [],
        Lunch: [],
        Dinner: [],
        Snacks: []
      },
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein) || 0,
      targetCarbohydrates: Number(targetCarbohydrates) || 0,
      targetFat: Number(targetFat) || 0,
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: "Diet plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Create Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating plan",
      error: error.message,
    });
  }
};

// ================== GET PLANS ==================
exports.getPlans = async (req, res) => {
  try {
    // Get user's custom plans
    const userPlans = await DietPlan.find({ 
      username: req.user.username,
      isDefault: { $ne: true }
    })
      .populate({
        path: 'meals.Breakfast.food meals.Lunch.food meals.Dinner.food meals.Snacks.food',
        model: 'Food'
      })
      .sort({ createdAt: -1 });

    // Get default plans
    const defaultPlans = await DietPlan.find({ isDefault: true })
      .populate({
        path: 'meals.Breakfast.food meals.Lunch.food meals.Dinner.food meals.Snacks.food',
        model: 'Food'
      })
      .sort({ planName: 1 });

    // Combine plans (defaults first, then user plans)
    const allPlans = [...defaultPlans, ...userPlans];

    // Calculate totals for each plan
    const plansWithTotals = allPlans.map(plan => {
      const totals = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0
      };

      // Calculate totals for each meal type
      ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].forEach(mealType => {
        if (plan.meals[mealType]) {
          plan.meals[mealType].forEach(item => {
            const food = item.food || item; // Handle both populated and unpopulated
            const servings = item.servings || 1;
            totals.calories += (food.calories || 0) * servings;
            totals.protein += (food.protein || 0) * servings;
            totals.carbohydrates += ((food.carbohydrates || food.carbs || 0)) * servings;
            totals.fat += (food.fat || 0) * servings;
          });
        }
      });

      return {
        ...plan.toObject(),
        calculatedTotals: totals
      };
    });

    res.status(200).json({
      success: true,
      count: plansWithTotals.length,
      plans: plansWithTotals,
    });
  } catch (error) {
    console.error("Get Plans Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching plans",
      error: error.message,
    });
  }
};

// ================== DELETE PLAN ==================
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await DietPlan.findOne({ _id: id, username: req.user.username });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or unauthorized",
      });
    }

    if (plan.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete default diet plans.",
      });
    }

    await DietPlan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Diet plan deleted successfully",
      plan,
    });
  } catch (error) {
    console.error("Delete Plan Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting plan",
      error: error.message,
    });
  }
};

// ================== ADD FOOD TO MEAL ==================
exports.addFoodToMeal = async (req, res) => {
  try {
    const { planId, mealType } = req.params;
    const { foodName, servings } = req.body;

    if (!foodName || !servings) {
      return res.status(400).json({
        success: false,
        message: "Food name and servings are required",
      });
    }

    // Find the plan
    const plan = await DietPlan.findOne({ _id: planId, username: req.user.username });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or unauthorized",
      });
    }

    // Look up food details from foods.json
    const foods = require('../data/foods.json');
    const food = foods.find(f => f.foodName.toLowerCase() === foodName.toLowerCase());
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found",
      });
    }

    // Create meal item with nutrient details
    const mealItem = {
      food: food._id || food.id,
      foodName: food.foodName,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates || food.carbs,
      fat: food.fat,
      servings: Number(servings)
    };

    // Add to the specific meal type
    if (!plan.meals[mealType]) {
      plan.meals[mealType] = [];
    }
    
    plan.meals[mealType].push(mealItem);
    await plan.save();

    res.status(200).json({
      success: true,
      message: "Food added to meal successfully",
      mealItem,
    });
  } catch (error) {
    console.error("Add Food to Meal Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding food to meal",
      error: error.message,
    });
  }
};

// ================== REMOVE FOOD FROM MEAL ==================
exports.removeFoodFromMeal = async (req, res) => {
  try {
    const { planId, mealType, foodIndex } = req.params;

    const plan = await DietPlan.findOne({ _id: planId, username: req.user.username });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or unauthorized",
      });
    }

    if (plan.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify default diet plans.",
      });
    }

    if (!plan.meals[mealType] || !plan.meals[mealType][foodIndex]) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    plan.meals[mealType].splice(foodIndex, 1);
    await plan.save();

    res.status(200).json({
      success: true,
      message: "Food removed from meal successfully",
    });
  } catch (error) {
    console.error("Remove Food from Meal Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing food from meal",
      error: error.message,
    });
  }
};
