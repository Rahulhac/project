// server.js
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const auth = require("./middleware/auth"); // JWT authentication middleware

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/user-data-api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware to authenticate JWT token
app.use(auth);

// User data API
app.get("/user", async (req, res) => {
  try {
    // Fetch user data from database based on user id in JWT payload
    const user = await User.findById(req.user.id).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare user data to send in response
    const userData = {
      purchasePower: user.purchasePower || 0, // Assuming purchasePower is a field in User model
      phoneNumber: user.phoneNumber,
      email: user.email,
      dateOfRegistration: user.dateOfRegistration,
      dateOfBirth: user.dateOfBirth,
      monthlySalary: user.monthlySalary,
    };

    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
