// Analysis.jsx
import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const Analysis = ({ loggedFoods, dietPlans }) => {
  // Active plan target calories
  const activePlan = Array.isArray(dietPlans) && dietPlans.length > 0 ? dietPlans[0] : null;
  const targetCalories = activePlan?.targetCalories || activePlan?.caloriesTarget || 2000;
  // ================== Weekly calorie trend ==================
  const weeklyData = Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const day = d.toLocaleDateString("en-US", { weekday: "short" });

      const calories = loggedFoods
        .filter((f) => {
          if (!f.date) return false;
          const foodDate = new Date(f.date);
          return (
            foodDate.getFullYear() === d.getFullYear() &&
            foodDate.getMonth() === d.getMonth() &&
            foodDate.getDate() === d.getDate()
          );
        })
        .reduce((sum, f) => sum + f.calories * (f.servings || 1), 0);

      return { day, calories, target: targetCalories };
    })
    .reverse();

  // ================== Today's totals ==================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // (No direct need for a separate todayFoods array here)

  const todayStr = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

  // ================== Today's totals (match Dashboard) ==================
  const todayCalories = loggedFoods.reduce(
    (sum, f) => sum + f.calories * (f.servings || 1),
    0
  );
  const todayProtein = loggedFoods.reduce(
    (sum, f) => sum + f.protein * (f.servings || 1),
    0
  );
  const todayCarbs = loggedFoods.reduce(
    (sum, f) => sum + (f.carbs ?? f.carbohydrates ?? 0) * (f.servings || 1),
    0
  );
  const todayFat = loggedFoods.reduce(
    (sum, f) => sum + f.fat * (f.servings || 1),
    0
  );

  // ================== Macro breakdown ==================
  const totalMacros = todayProtein + todayCarbs + todayFat;
  const macroData = [
    { name: "Protein", value: todayProtein },
    { name: "Carbs", value: todayCarbs },
    { name: "Fat", value: todayFat },
  ];

  const COLORS = ["#198754", "#0d6efd", "#ffc107"]; // green, blue, yellow

  // Compare today vs target
  const caloriesCompare = [
    { name: "Today", calories: todayCalories },
    { name: "Target", calories: targetCalories },
  ];

  // ================== Last 7 days by date (YYYY-MM-DD) ==================
  const toISODate = (d) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.toISOString().slice(0, 10);
  };

  const sevenDayDates = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - idx));
    return toISODate(d);
  });

  const caloriesByDateMap = loggedFoods.reduce((acc, f) => {
    if (!f.date) return acc;
    const iso = toISODate(new Date(f.date));
    acc[iso] = (acc[iso] || 0) + (f.calories * (f.servings || 1));
    return acc;
  }, {});

  const last7ByDate = sevenDayDates.map((iso) => ({ date: iso, calories: caloriesByDateMap[iso] || 0 }));

  // ================== Render ==================
  return (
    <div className="container py-4">
      {/* Today's Summary */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow rounded-3 p-3 text-center">
            <h4 className="fw-bold text-dark mb-2">Today's Summary</h4>
            <p className="mb-1 text-muted">{todayStr}</p>
            <p className="mb-1">
              <strong>{todayCalories}</strong> kcal consumed /{" "}
              <span className="text-danger">{targetCalories} kcal target</span>
            </p>
            <p className="mb-0 text-muted">
              Protein: {todayProtein}g | Carbs: {todayCarbs}g | Fat: {todayFat}g
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4">
        {/* Weekly Calories */}
        <div className="col-md-6">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">
              Weekly Calorie Intake
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#198754"
                  strokeWidth={2}
                  name="Calories"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#dc3545"
                  strokeDasharray="5 5"
                  name={`Target (${targetCalories} kcal)`}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Pie Chart */}
        <div className="col-md-6">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">
              Today's Macro Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macroData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) =>
                    `${name}: ${totalMacros > 0 ? (
                      ((value / totalMacros) * 100).toFixed(0)
                    ) : 0}%`
                  }
                >
                  {macroData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Calories vs Target */}
      <div className="row g-4 mt-1">
        <div className="col-md-12">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">
              Today's Calories vs Target
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caloriesCompare}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" name="Calories" fill="#198754" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Last 7 Days - Daily Calories by Date */}
      <div className="row g-4 mt-1">
        <div className="col-md-12">
          <div className="card shadow rounded-3 p-4 h-100">
            <h2 className="h5 fw-semibold text-secondary mb-3">Last 7 Days (Daily Calories)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7ByDate}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#0d6efd"
                  strokeWidth={2}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
