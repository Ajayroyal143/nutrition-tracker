const DietPlan = require('./models/dietPlan.model');

const defaultPlans = [
  {
    username: 'system',
    planName: 'Weight Loss Plan',
    targetCalories: 1800,
    targetProtein: 120,
    targetCarbohydrates: 180,
    targetFat: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    isDefault: true,
    meals: {
      Breakfast: [
        {
          food: null,
          foodName: 'Oatmeal',
          calories: 150,
          protein: 5,
          carbohydrates: 27,
          fat: 3,
          servings: 1
        },
        {
          food: null,
          foodName: 'Banana',
          calories: 105,
          protein: 1,
          carbohydrates: 27,
          fat: 0,
          servings: 1
        }
      ],
      Lunch: [
        {
          food: null,
          foodName: 'Grilled Chicken Breast',
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          servings: 1
        },
        {
          food: null,
          foodName: 'Brown Rice',
          calories: 112,
          protein: 2.6,
          carbohydrates: 22,
          fat: 0.9,
          servings: 1
        }
      ],
      Dinner: [
        {
          food: null,
          foodName: 'Salmon',
          calories: 206,
          protein: 22,
          carbohydrates: 0,
          fat: 12,
          servings: 1
        },
        {
          food: null,
          foodName: 'Broccoli',
          calories: 55,
          protein: 4,
          carbohydrates: 11,
          fat: 0.6,
          servings: 1
        }
      ],
      Snacks: [
        {
          food: null,
          foodName: 'Greek Yogurt',
          calories: 100,
          protein: 17,
          carbohydrates: 6,
          fat: 0,
          servings: 1
        }
      ]
    }
  },
  {
    username: 'system',
    planName: 'Balanced Plan',
    targetCalories: 2000,
    targetProtein: 100,
    targetCarbohydrates: 220,
    targetFat: 60,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isDefault: true,
    meals: {
      Breakfast: [
        {
          food: null,
          foodName: 'Whole Wheat Toast',
          calories: 80,
          protein: 4,
          carbohydrates: 15,
          fat: 1,
          servings: 2
        },
        {
          food: null,
          foodName: 'Avocado',
          calories: 160,
          protein: 2,
          carbohydrates: 9,
          fat: 15,
          servings: 0.5
        }
      ],
      Lunch: [
        {
          food: null,
          foodName: 'Turkey Sandwich',
          calories: 350,
          protein: 25,
          carbohydrates: 35,
          fat: 12,
          servings: 1
        },
        {
          food: null,
          foodName: 'Mixed Greens',
          calories: 20,
          protein: 2,
          carbohydrates: 4,
          fat: 0,
          servings: 1
        }
      ],
      Dinner: [
        {
          food: null,
          foodName: 'Lean Beef',
          calories: 250,
          protein: 26,
          carbohydrates: 0,
          fat: 15,
          servings: 1
        },
        {
          food: null,
          foodName: 'Sweet Potato',
          calories: 112,
          protein: 2,
          carbohydrates: 26,
          fat: 0,
          servings: 1
        }
      ],
      Snacks: [
        {
          food: null,
          foodName: 'Almonds',
          calories: 164,
          protein: 6,
          carbohydrates: 6,
          fat: 14,
          servings: 1
        }
      ]
    }
  },
  {
    username: 'system',
    planName: 'Gain Weight Plan',
    targetCalories: 2500,
    targetProtein: 150,
    targetCarbohydrates: 300,
    targetFat: 80,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isDefault: true,
    meals: {
      Breakfast: [
        {
          food: null,
          foodName: 'Protein Pancakes',
          calories: 300,
          protein: 25,
          carbohydrates: 30,
          fat: 8,
          servings: 1
        },
        {
          food: null,
          foodName: 'Eggs',
          calories: 140,
          protein: 12,
          carbohydrates: 1,
          fat: 10,
          servings: 2
        }
      ],
      Lunch: [
        {
          food: null,
          foodName: 'Chicken Thigh',
          calories: 209,
          protein: 26,
          carbohydrates: 0,
          fat: 11,
          servings: 1
        },
        {
          food: null,
          foodName: 'Quinoa',
          calories: 222,
          protein: 8,
          carbohydrates: 40,
          fat: 4,
          servings: 1
        }
      ],
      Dinner: [
        {
          food: null,
          foodName: 'Ground Beef',
          calories: 250,
          protein: 26,
          carbohydrates: 0,
          fat: 15,
          servings: 1
        },
        {
          food: null,
          foodName: 'White Rice',
          calories: 205,
          protein: 4,
          carbohydrates: 45,
          fat: 0,
          servings: 1
        }
      ],
      Snacks: [
        {
          food: null,
          foodName: 'Protein Shake',
          calories: 200,
          protein: 25,
          carbohydrates: 15,
          fat: 3,
          servings: 1
        },
        {
          food: null,
          foodName: 'Peanut Butter',
          calories: 190,
          protein: 8,
          carbohydrates: 6,
          fat: 16,
          servings: 1
        }
      ]
    }
  }
];

const seedDefaultPlans = async () => {
  try {
    // Check if default plans already exist
    const existingDefaultPlans = await DietPlan.countDocuments({ isDefault: true });
    
    if (existingDefaultPlans === 0) {
      console.log('Seeding default diet plans...');
      await DietPlan.insertMany(defaultPlans);
      console.log('Default diet plans seeded successfully!');
    } else {
      console.log('Default diet plans already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding default plans:', error);
  }
};

module.exports = seedDefaultPlans;
