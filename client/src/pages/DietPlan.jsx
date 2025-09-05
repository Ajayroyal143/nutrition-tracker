import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Trash2, Lock } from "lucide-react";

const DietPlan = ({ dietPlans, onAddPlan, onDeletePlan, token }) => {
  const plans = Array.isArray(dietPlans) ? dietPlans : [];
  const [selectedPlan, setSelectedPlan] = useState(plans[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating new plan
  const [formData, setFormData] = useState({
    planName: "",
    startDate: "",
    endDate: "",
    targetCalories: "",
    targetProtein: "",
    targetCarbohydrates: "",
    targetFat: "",
  });

  // Meal building state
  const [currentMealType, setCurrentMealType] = useState("Breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [servings, setServings] = useState(1);

  // Search foods
  const searchFoods = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    console.log('Searching for:', query);
    console.log('Token:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 'N/A');
    
    // Check if token is valid format
    if (!token || typeof token !== 'string' || token.length < 10) {
      console.error('Invalid token format');
      setSearchResults([]);
      return;
    }
    
    try {
      // First try with authentication
      const res = await fetch(`http://localhost:5000/foods/search/${query}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Search response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Search results:', data);
        setSearchResults(data.success ? data.foods : []);
        return;
      } else {
        console.log('Auth search failed, trying test route...');
        // If auth fails, try test route
        const testRes = await fetch(`http://localhost:5000/foods/test-search/${query}`);
        if (testRes.ok) {
          const testData = await testRes.json();
          console.log('Test search results:', testData);
          setSearchResults(testData.success ? testData.foods : []);
          return;
        }
      }
      
      const errorText = await res.text();
      console.error('Search error response:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  }, [token]);

  useEffect(() => {
    searchFoods(searchQuery);
  }, [searchQuery, searchFoods]);

  // Add food to meal
  const addFoodToMeal = async (food) => {
    if (!selectedPlan) {
      alert("Please select a plan first");
      return;
    }

    if (selectedPlan.isDefault) {
      alert("Cannot add foods to default plans. Please create a custom plan first.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/diet-plans/${selectedPlan._id}/meals/${currentMealType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            foodName: food.foodName,
            servings: Math.max(1, parseInt(servings) || 1),
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(`Added ${food.foodName} to ${currentMealType}!`);
        // Refresh plans to get updated data
        window.location.reload(); // Simple refresh for now
      } else {
        alert(data.message || "Failed to add food to meal");
      }
    } catch (err) {
      console.error("Add food error:", err);
      alert("Failed to add food to meal. Please check your connection.");
    }

    setSearchQuery("");
    setSearchResults([]);
    setServings(1);
  };

  // Remove food from meal
  const removeFoodFromMeal = async (mealType, foodIndex) => {
    if (!selectedPlan) return;

    try {
      const res = await fetch(
        `http://localhost:5000/diet-plans/${selectedPlan._id}/meals/${mealType}/${foodIndex}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        // Refresh plans to get updated data
        window.location.reload(); // Simple refresh for now
      } else {
        alert(data.message || "Failed to remove food from meal");
      }
    } catch (err) {
      console.error("Remove food error:", err);
      alert("Failed to remove food from meal");
    }
  };

  // Create plan
  const handleCreatePlan = () => {
    if (!formData.planName || !formData.targetCalories) {
      return;
    }

    const planData = {
      ...formData,
      targetCalories: Number(formData.targetCalories),
      targetProtein: Number(formData.targetProtein),
      targetCarbohydrates: Number(formData.targetCarbohydrates),
      targetFat: Number(formData.targetFat),
    };

    onAddPlan(planData);

    // Reset form
    setFormData({
      planName: "",
      startDate: "",
      endDate: "",
      targetCalories: "",
      targetProtein: "",
      targetCarbohydrates: "",
      targetFat: "",
    });
    setIsCreating(false);
  };

  // Calculate meal totals
  const calculateMealTotals = (mealType) => {
    if (!selectedPlan?.meals?.[mealType]) return { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    
    return selectedPlan.meals[mealType].reduce((totals, item) => {
      const food = item.food || item;
      const servings = item.servings || 1;
      return {
        calories: totals.calories + (food.calories || 0) * servings,
        protein: totals.protein + (food.protein || 0) * servings,
        carbohydrates: totals.carbohydrates + ((food.carbohydrates || food.carbs || 0)) * servings,
        fat: totals.fat + (food.fat || 0) * servings
      };
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0 });
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar - Plans List */}
        <div className="col-md-4">
          <div className="card shadow rounded-3 mb-4">
            <div className="card-body">
              <h2 className="h5 fw-semibold text-secondary mb-3">Diet Plans</h2>
              <ul className="list-group">
                {plans.map((plan) => (
                  <li
                    key={plan._id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${
                      selectedPlan?._id === plan._id ? "active fw-semibold" : ""
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      {plan.isDefault && <Lock size={16} className="me-2 text-muted" />}
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {plan.planName || plan.title}
                      </span>
                    </div>
                    {!plan.isDefault && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDeletePlan(plan._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
                {plans.length === 0 && (
                  <li className="list-group-item text-muted">
                    No plans available.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Create New Plan Button */}
          <div className="card shadow rounded-3">
            <div className="card-body">
              <button
                className="btn btn-success w-100 fw-semibold"
                onClick={() => setIsCreating(true)}
              >
                <Plus size={18} className="me-2" />
                Create New Plan
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          {isCreating ? (
            <div className="card shadow rounded-3 h-100">
              <div className="card-body">
                <h2 className="h4 fw-bold text-dark mb-4">Create Diet Plan</h2>

                {/* Plan Details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Plan Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.planName}
                      onChange={(e) => setFormData({...formData, planName: e.target.value})}
                      placeholder="Enter plan name"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                {/* Target Nutrients */}
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Target Calories</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.targetCalories}
                      onChange={(e) => setFormData({...formData, targetCalories: e.target.value})}
                      placeholder="2000"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Target Protein (g)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.targetProtein}
                      onChange={(e) => setFormData({...formData, targetProtein: e.target.value})}
                      placeholder="150"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Target Carbs (g)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.targetCarbohydrates}
                      onChange={(e) => setFormData({...formData, targetCarbohydrates: e.target.value})}
                      placeholder="200"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Target Fat (g)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.targetFat}
                      onChange={(e) => setFormData({...formData, targetFat: e.target.value})}
                      placeholder="67"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={handleCreatePlan}
                    disabled={!formData.planName || !formData.targetCalories}
                  >
                    Create Plan
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : selectedPlan ? (
            <div className="card shadow rounded-3 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1">
                      {selectedPlan.planName || selectedPlan.title}
                      {selectedPlan.isDefault && <Lock size={20} className="ms-2 text-muted" />}
                    </h2>
                    <p className="text-muted mb-0">
                      Target: {selectedPlan.targetCalories} kcal/day | 
                      Protein: {selectedPlan.targetProtein}g | 
                      Carbs: {selectedPlan.targetCarbohydrates}g | 
                      Fat: {selectedPlan.targetFat}g
                    </p>
                  </div>
                  {selectedPlan.calculatedTotals && (
                    <div className="text-end">
                      <div className="h6 text-primary">{selectedPlan.calculatedTotals.calories} kcal</div>
                      <small className="text-muted">Total</small>
                    </div>
                  )}
                </div>

                {/* Meal Builder */}
                <div className="mb-4">
                  <h5 className="fw-semibold mb-3">Meal Builder</h5>
                  
                  {/* Meal Type Tabs */}
                  <ul className="nav nav-tabs mb-3">
                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map(mealType => (
                      <li key={mealType} className="nav-item">
                        <button
                          className={`nav-link ${currentMealType === mealType ? 'active' : ''}`}
                          onClick={() => setCurrentMealType(mealType)}
                        >
                          {mealType}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Food Search */}
                  <div className="mb-3">
                    <div className="row g-2">
                      <div className="col-md-8">
                        <div className="input-group">
                          <span className="input-group-text">
                            <Search size={18} />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search foods..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        {searchQuery.length >= 2 && searchResults.length === 0 && (
                          <div className="mt-2 text-muted small">
                            No foods found. Try a different search term.
                          </div>
                        )}
                        {searchResults.length > 0 && (
                          <div className="list-group mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {searchResults.map((food, index) => (
                              <div key={food._id || index} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <div className="fw-semibold">{food.foodName}</div>
                                    <small className="text-muted">
                                      {food.calories} cal | {food.protein}g P | {food.carbohydrates || food.carbs || 0}g C | {food.fat}g F
                                    </small>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => addFoodToMeal(food)}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Servings</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="1"
                          value={servings}
                          min="1"
                          step="1"
                          onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">&nbsp;</label>
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => {
                            if (searchResults.length > 0) {
                              addFoodToMeal(searchResults[0]);
                            }
                          }}
                          disabled={searchResults.length === 0}
                        >
                          Add Food
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meals Display */}
                {["Breakfast", "Lunch", "Dinner", "Snacks"].map(mealType => {
                  const mealFoods = selectedPlan.meals?.[mealType] || [];
                  const mealTotals = calculateMealTotals(mealType);

                  return (
                    <div key={mealType} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-semibold text-secondary mb-0">{mealType}</h5>
                        <div className="text-end">
                          <div className="h6 text-primary">{mealTotals.calories} kcal</div>
                          <small className="text-muted">
                            {mealTotals.protein}g P | {mealTotals.carbohydrates}g C | {mealTotals.fat}g F
                          </small>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body">
                          {mealFoods.length === 0 ? (
                            <p className="text-muted mb-0">No foods in this meal</p>
                          ) : (
                            <div className="list-group">
                              {mealFoods.map((item, index) => {
                                const food = item.food || item;
                                const servings = item.servings || 1;
                                return (
                                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                      <span className="fw-semibold">{food.foodName}</span>
                                      <div className="small text-muted">
                                        {servings} serving{servings > 1 ? 's' : ''} | 
                                        {(food.calories || 0) * servings} cal | 
                                        {(food.protein || 0) * servings}g P | 
                                        {((food.carbohydrates || food.carbs || 0)) * servings}g C | 
                                        {(food.fat || 0) * servings}g F
                                      </div>
                                    </div>
                                    {!selectedPlan.isDefault && (
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => removeFoodFromMeal(mealType, index)}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card shadow rounded-3 h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <h5>No Plan Selected</h5>
                  <p className="mb-0">Select a plan from the sidebar or create a new one.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DietPlan;