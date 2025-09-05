import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ loggedFoods, setCurrentPage, dietPlans }) => {
  // Filter to today's foods
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayFoods = loggedFoods.filter((f) => {
    if (!f.date) return false;
    const d = new Date(f.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  // Total daily calories (today)
  const todayCalories = todayFoods.reduce(
    (total, food) => total + food.calories * (food.servings || 1),
    0
  );

  // Active plan target
  const activePlan = Array.isArray(dietPlans) && dietPlans.length > 0 ? dietPlans[0] : null;
  const targetCalories = activePlan?.targetCalories || activePlan?.caloriesTarget;
  const calorieProgress = targetCalories ? Math.min((todayCalories / targetCalories) * 100, 100) : 0;

  // Macro data
  const macroData = [
    { name: 'Protein', value: loggedFoods.reduce((t, f) => t + f.protein * (f.servings || 1), 0) },
    { name: 'Carbs', value: loggedFoods.reduce((t, f) => t + ((f.carbs ?? f.carbohydrates) || 0) * (f.servings || 1), 0) },
    { name: 'Fat', value: loggedFoods.reduce((t, f) => t + f.fat * (f.servings || 1), 0) },
  ];

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container py-4">
      <h1 className="mb-1 fw-bold text-dark">Welcome Back!</h1>
      <p className="mb-4 text-muted">{todayStr}</p>

      {/* Calories + Quick Actions */}
      <div className="row g-4 mb-4">
        {/* Calories Progress */}
        <div className="col-md-8">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">Today's Calories</h2>

            {activePlan ? (
              <>
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <span className="badge bg-success">
                    {Math.round(calorieProgress)}%
                  </span>
                  <small className="fw-semibold text-success">
                    {todayCalories} / {targetCalories} kcal
                  </small>
                </div>

                <div className="progress" style={{ height: '20px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${calorieProgress}%` }}
                    aria-valuenow={todayCalories}
                    aria-valuemin="0"
                    aria-valuemax={targetCalories}
                  >
                    {Math.round(calorieProgress)}%
                  </div>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <small className="fw-semibold text-success">{todayCalories} kcal consumed</small>
                <small className="text-muted">No active diet plan</small>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-md-4">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">Quick Actions</h2>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary w-100"
                onClick={() => setCurrentPage('Food Log')}
              >
                Log Food
              </button>
              <button
                className="btn btn-primary w-100"
                onClick={() => setCurrentPage('Diet Plans')}
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrients + Recent Meals */}
      <div className="row g-4">
        {/* Macronutrients */}
        <div className="col-md-6">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">
              Macronutrient Breakdown
            </h2>
            {macroData.every((m) => m.value === 0) ? (
              <p className="text-muted">No data available. Log some meals!</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={macroData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#198754" /> {/* Bootstrap green */}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Meals */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">Recent Meals</h2>
            <ul className="list-group">
              {loggedFoods.length > 0 ? (
                loggedFoods.slice(0, 5).map((food) => (
                  <li
                    key={food._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {food.foodName} {food.servings ? `(${food.servings}x)` : ''}
                    </span>
                    <span className="fw-semibold">
                      {food.calories * (food.servings || 1)} kcal
                    </span>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">
                  No meals logged yet
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
