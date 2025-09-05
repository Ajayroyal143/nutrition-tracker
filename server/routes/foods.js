const router = require("express").Router();
const foodsController = require("../controllers/foods");
const auth = require("../middleware/auth");

// Protected routes
router.post("/add", auth, foodsController.addFood);
router.get("/", auth, foodsController.getFoods);
router.delete("/:id", auth, foodsController.deleteFood);

// 🔍 Search foods (with auth)
router.get("/search/:query", auth, foodsController.searchFoods);

// 🔍 Test search foods (without auth for debugging)
router.get("/test-search/:query", foodsController.searchFoods);

module.exports = router;
