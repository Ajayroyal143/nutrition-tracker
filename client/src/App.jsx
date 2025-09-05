// App.jsx
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import FoodLog from "./pages/FoodLog";
import DietPlan from "./pages/DietPlan";
import Analysis from "./pages/Analysis";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [loggedFoods, setLoggedFoods] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [user, setUser] = useState(null); // populated after login/signup
  const [isSignUp, setIsSignUp] = useState(false);

  // ================== LOCAL STORAGE ==================
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // ================== AUTH ==================
  const handleLogin = async (form) => {
    try {
      const res = await axios.post("http://localhost:5000/users/login", form);
      if (res.data.success) {
        setIsAuthenticated(true);
        setToken(res.data.token);
        setUser(res.data.user);

        // ✅ Save to localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleSignUp = async (form) => {
    try {
      const res = await axios.post("http://localhost:5000/users/register", form);
      if (res.data.success) {
        // auto login after signup
        await handleLogin({ username: form.username, password: form.password });
        setIsSignUp(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setCurrentPage("Dashboard");

    // ✅ Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ================== API CALLS ==================
  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:5000/foods", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLoggedFoods(
          (res.data.foods || []).map((food) => ({
            ...food,
            name: food.foodName,
            carbs: food.carbohydrates,
          }))
        );
      }
    } catch (err) {
      console.error("Fetch foods error:", err);
      toast.error("Failed to load foods");
    }
  };

  const fetchDietPlans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/diet-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure it's always an array
      if (Array.isArray(res.data.plans)) {
        setDietPlans(res.data.plans);
      } else {
        setDietPlans([]);
      }
    } catch (err) {
      console.error("Fetch plans error:", err);
      setDietPlans([]);
      toast.error("Failed to load diet plans");
    }
  };

  // ================== FOOD ==================
  const handleAddFood = async (food) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/foods/add",
        {
          foodName: food.foodName,
          servings: food.servings,
          meal: food.meal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        await fetchFoods(); // Always refresh from backend after add
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding food");
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLoggedFoods(loggedFoods.filter((f) => f._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting food");
    }
  };

  // ================== DIET PLAN ==================
  const handleAddPlan = async (plan) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/diet-plans/create",
        plan,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Diet plan created successfully!");
        fetchDietPlans(); // <-- refresh the list after adding
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating plan");
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/diet-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Diet plan deleted successfully!");
      setDietPlans(dietPlans.filter((plan) => plan._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting plan");
    }
  };

  // ================== PROFILE ==================
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser)); // ✅ update localStorage
  };

  // ================== FETCH DATA ==================
  useEffect(() => {
    if (isAuthenticated && token && user) {
      fetchFoods();
      fetchDietPlans();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, user, token]);

  // ================== AUTH PAGES ==================
  if (!isAuthenticated) {
    return isSignUp ? (
      <Register
        onSignup={handleSignUp}
        onSwitchToLogin={() => setIsSignUp(false)}
      />
    ) : (
      <Login onLogin={handleLogin} onSwitchToSignup={() => setIsSignUp(true)} />
    );
  }

  // ================== MAIN APP ==================
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        onLogout={handleLogout}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
      />

      <div className="flex-grow-1 container my-4">
        {currentPage === "Dashboard" && (
          <Dashboard
            loggedFoods={loggedFoods}
            setCurrentPage={setCurrentPage}
            dietPlans={dietPlans}
          />
        )}
        {currentPage === "Food Log" && (
          <FoodLog
            loggedFoods={loggedFoods}
            onAddFood={handleAddFood}
            onDeleteFood={handleDeleteFood}
            token={token}
          />
        )}
        {currentPage === "Diet Plans" && (
          <DietPlan
            dietPlans={dietPlans}
            onAddPlan={handleAddPlan}
            onDeletePlan={handleDeletePlan}
            token={token}
          />
        )}
        {currentPage === "Analysis" && (
          <Analysis loggedFoods={loggedFoods} dietPlans={dietPlans} />
        )}
        {currentPage === "Profile" && (
          <Profile user={user} onUpdateUser={handleUpdateUser} />
        )}
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </div>
  );
}

export default App;
