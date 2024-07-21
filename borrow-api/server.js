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
  .connect("mongodb://localhost:27017/user-borrow-api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware to authenticate JWT token
app.use(auth);

// Borrow money API
app.post("/borrow", async (req, res) => {
  const { amount } = req.body;

  try {
    // Fetch user data from database based on user id in JWT payload
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update Purchase Power amount
    user.purchasePower += amount;

    // Calculate monthly repayment amount with 8% interest rate over 12 months
    const interestRate = 0.08; // 8% annual interest rate
    const tenureMonths = 12; // 12 months
    const monthlyInterestRate = interestRate / 12;
    const monthlyRepayment =
      (amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -tenureMonths));

    // Save updated user data to the database
    await user.save();

    res.json({
      purchasePower: user.purchasePower,
      monthlyRepayment: monthlyRepayment.toFixed(2), // Round to 2 decimal places
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
