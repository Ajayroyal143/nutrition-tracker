const router = require("express").Router();
const auth = require("../middleware/auth");
const dietPlansController = require("../controllers/dietPlans");

// Protected routes
router.post("/create", auth, dietPlansController.createPlan);
router.get("/", auth, dietPlansController.getPlans);   // ✅ removed :username
router.delete("/:id", auth, dietPlansController.deletePlan);
router.post("/:planId/meals/:mealType", auth, dietPlansController.addFoodToMeal);
router.delete("/:planId/meals/:mealType/:foodIndex", auth, dietPlansController.removeFoodFromMeal);

module.exports = router;
