// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const seedDefaultPlans = require("./seedDefaultPlans");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // Restrict in production
app.use(express.json()); // This parses JSON bodies
app.use(express.urlencoded({ extended: true })); // This parses URL-encoded bodies

// MongoDB Connection
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ MongoDB connection established");
    // Seed default plans after successful connection
    await seedDefaultPlans();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
const usersRouter = require("./routes/users");
const foodsRouter = require("./routes/foods");
const dietPlansRouter = require("./routes/dietPlans");

app.use("/users", usersRouter);
app.use("/foods", foodsRouter);
app.use("/diet-plans", dietPlansRouter);

// Root route (for sanity check)
app.get("/", (req, res) => {
  res.send("Nutrition Assistant API is running 🚀");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
});

