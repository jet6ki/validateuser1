require("dotenv").config();
const express = require("express");
const { resolve } = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
const port = 3010;

// Middleware
app.use(express.json()); // Parse JSON data
app.use(express.static("static")); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Home Route
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// User Registration Endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for empty fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save User to Database
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});