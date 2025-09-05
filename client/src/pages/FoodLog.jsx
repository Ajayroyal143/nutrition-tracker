import React, { useState } from "react";
import {
  Search,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./FoodLog.css"; // Import the CSS file

const FoodLog = ({ loggedFoods, onAddFood, onDeleteFood, token }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [meal, setMeal] = useState("Breakfast");
  const [toast, setToast] = useState(null);

  // Filters
  const formatDate = (d) => new Date(d).toISOString().slice(0, 10);
  const todayStr = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [mealFilter, setMealFilter] = useState("All");

  // Local copy to allow inline edits before parent refresh
  const [foods, setFoods] = useState(loggedFoods || []);
  const [editingId, setEditingId] = useState(null);
  const [editServings, setEditServings] = useState(1);
  const [editMeal, setEditMeal] = useState("Breakfast");

  // Custom manual add form state
  const [customForm, setCustomForm] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    meal: "Breakfast",
    servings: 1,
  });

  React.useEffect(() => {
    setFoods(loggedFoods || []);
  }, [loggedFoods]);

  // ================== SEARCH ==================
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 1) {
      try {
        const res = await fetch(
          `http://localhost:5000/foods/search/${term}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setSearchResults(data.success ? data.foods : []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // ================== ADD FOOD ==================
  const handleAddFood = async () => {
    if (!selectedFood) return;
    try {
      await onAddFood({
        foodName: selectedFood.foodName,
        servings: Number(servings),
        meal,
      });
      setToast({ type: "success", message: "Food added!" });
    } catch {
      setToast({ type: "error", message: "Failed to add food." });
    }
    // reset form
    setSearchTerm("");
    setSelectedFood(null);
    setSearchResults([]);
    setServings(1);
    setMeal("Breakfast");
    setTimeout(() => setToast(null), 2000);
  };

  // ================== DELETE FOOD ==================
  const handleDeleteFood = async (id) => {
    try {
      await onDeleteFood(id);
      setToast({ type: "success", message: "Food deleted!" });
      // Optimistically update local list
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch {
      setToast({ type: "error", message: "Failed to delete food." });
    }
    setTimeout(() => setToast(null), 2000);
  };

  // ================== EDIT FOOD ==================
  const startEdit = (food) => {
    setEditingId(food._id);
    setEditServings(food.servings);
    setEditMeal(food.meal);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/foods/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ servings: Number(editServings), meal: editMeal }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update food.");

      // Update local list so UI reflects changes immediately
      setFoods((prev) =>
        prev.map((f) =>
          f._id === id ? { ...f, servings: Number(editServings), meal: editMeal } : f
        )
      );

      setToast({ type: "success", message: "Food updated!" });
      setEditingId(null);
    } catch (e) {
      setToast({ type: "error", message: e.message || "Failed to update food." });
    }
    setTimeout(() => setToast(null), 2000);
  };

  // ================== CUSTOM ADD FOOD ==================
  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomForm((prev) => ({ ...prev, [name]: value }));
  };

  const refreshFoodsLocal = async () => {
    try {
      const res = await fetch("http://localhost:5000/foods", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFoods(
          (data.foods || []).map((food) => ({
            ...food,
            name: food.foodName,
            carbs: food.carbohydrates,
          }))
        );
      }
    } catch (e) {
      // silent fail, toast not necessary for background refresh
    }
  };

  const handleAddCustomFood = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        foodName: customForm.foodName,
        calories: Number(customForm.calories),
        protein: Number(customForm.protein),
        carbohydrates: Number(customForm.carbohydrates),
        fat: Number(customForm.fat),
        meal: customForm.meal,
        servings: Number(customForm.servings),
      };

      const res = await fetch("http://localhost:5000/foods/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to add food");

      setToast({ type: "success", message: "Custom food added!" });

      // Clear form
      setCustomForm({
        foodName: "",
        calories: "",
        protein: "",
        carbohydrates: "",
        fat: "",
        meal: "Breakfast",
        servings: 1,
      });

      // Refresh local list
      await refreshFoodsLocal();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to add food." });
    }
    setTimeout(() => setToast(null), 2000);
  };

  const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <div className="container py-4">
      {/* Filters */}
      <div className="card shadow-sm p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
            <label className="form-label mb-1 fw-semibold">Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label mb-1 fw-semibold">Meal</label>
            <select
              className="form-select"
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
            >
              <option>All</option>
              {meals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert d-flex align-items-center ${
            toast.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="me-2" size={18} />
          ) : (
            <XCircle className="me-2" size={18} />
          )}
          {toast.message}
        </div>
      )}

      {/* Add Food */}
      <div className="card shadow rounded-3 p-4 mb-4">
        <h2 className="h5 fw-semibold text-secondary mb-3">Add a New Entry</h2>

        <div className="row g-3 align-items-start">
          {/* Search */}
          <div className="col-md-6 position-relative">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search for a food..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {searchResults.length > 0 && (
              <ul className="list-group position-absolute w-100 mt-1 zindex-dropdown">
                {searchResults.map((food, idx) => (
                  <li
                    key={food._id || idx}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedFood({
                        ...food,
                        name: food.foodName,
                        carbs: food.carbohydrates,
                      });
                      setSearchTerm(food.foodName);
                      setSearchResults([]);
                    }}
                  >
                    {food.foodName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Servings */}
          <div className="col-md-3">
            <input
              type="number"
              value={servings}
              min="1"
              onChange={(e) => setServings(e.target.value)}
              className="form-control"
              placeholder="Servings"
            />
          </div>

          {/* Meal */}
          <div className="col-md-3">
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              className="form-select"
            >
              {meals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddFood}
          className="btn btn-success w-100 mt-3 fw-semibold"
          disabled={!selectedFood}
        >
          Add to Log
        </button>
      </div>

      {/* Custom Add Food */}
      <div className="card shadow rounded-3 p-4 mb-4">
        <h2 className="h6 fw-semibold text-secondary mb-3">Add a Custom Food</h2>
        <form className="row g-3" onSubmit={handleAddCustomFood}>
          <div className="col-md-4">
            <input
              type="text"
              name="foodName"
              value={customForm.foodName}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="Food name"
              required
            />
          </div>
          <div className="col-6 col-md-2">
            <input
              type="number"
              name="calories"
              value={customForm.calories}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="kcal"
              min="0"
              required
            />
          </div>
          <div className="col-6 col-md-2">
            <input
              type="number"
              name="protein"
              value={customForm.protein}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="Protein (g)"
              min="0"
              required
            />
          </div>
          <div className="col-6 col-md-2">
            <input
              type="number"
              name="carbohydrates"
              value={customForm.carbohydrates}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="Carbs (g)"
              min="0"
              required
            />
          </div>
          <div className="col-6 col-md-2">
            <input
              type="number"
              name="fat"
              value={customForm.fat}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="Fat (g)"
              min="0"
              required
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              name="meal"
              value={customForm.meal}
              onChange={handleCustomChange}
              className="form-select"
            >
              {meals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <input
              type="number"
              name="servings"
              value={customForm.servings}
              onChange={handleCustomChange}
              className="form-control"
              placeholder="Servings"
              min="1"
              required
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success w-100 fw-semibold">
              Save Custom Food
            </button>
          </div>
        </form>
      </div>

      {/* Logs */}
      {(
        mealFilter === "All" ? meals : [mealFilter]
      ).map((m) => (
        <div key={m} className="mb-4">
          <h3 className="h6 fw-bold text-dark mb-2">{m}</h3>
          <div className="card shadow rounded-3 p-3">
            {foods
              .filter((f) => {
                const d = f.date ? new Date(f.date) : null;
                const dateStr = d ? d.toISOString().slice(0, 10) : todayStr;
                return dateStr === selectedDate && f.meal === m;
              }).length > 0 ? (
              foods
                .filter((f) => {
                  const d = f.date ? new Date(f.date) : null;
                  const dateStr = d ? d.toISOString().slice(0, 10) : todayStr;
                  return dateStr === selectedDate && f.meal === m;
                })
                .map((food) => (
                  <div
                    key={food._id}
                    className="d-flex justify-content-between align-items-center border-bottom py-2"
                  >
                    <div className="w-100 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="fw-semibold mb-1">
                          {(food.name || food.foodName)}
                        </p>
                        {editingId === food._id ? (
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="number"
                              className="form-control form-control-sm me-2"
                              style={{ width: "110px" }}
                              value={editServings}
                              min="1"
                              onChange={(e) => setEditServings(e.target.value)}
                            />
                            <select
                              className="form-select form-select-sm me-2"
                              style={{ width: "140px" }}
                              value={editMeal}
                              onChange={(e) => setEditMeal(e.target.value)}
                            >
                              {meals.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="small text-muted d-flex gap-3">
                            <span>
                              {food.servings} {food.servings > 1 ? "servings" : "serving"} • {food.meal}
                            </span>
                            <span className="d-flex align-items-center">
                              <Flame size={14} className="text-danger me-1" /> {food.calories * food.servings} kcal
                            </span>
                            <span className="d-flex align-items-center">
                              <Beef size={14} className="text-warning me-1" /> {food.protein * food.servings}g P
                            </span>
                            <span className="d-flex align-items-center">
                              <Wheat size={14} className="text-orange me-1" /> {(food.carbs ?? food.carbohydrates) * food.servings}g C
                            </span>
                            <span className="d-flex align-items-center">
                              <Droplets size={14} className="text-primary me-1" /> {food.fat * food.servings}g F
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {editingId === food._id ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => saveEdit(food._id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startEdit(food)}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteFood(food._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-muted mb-0">No items logged for {m}.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FoodLog;
