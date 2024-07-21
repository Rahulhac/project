const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./user"); // Ensure this file exists and is correctly set up

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if unable to connect to MongoDB
  });

// Signup API
app.post("/signup", async (req, res) => {
  const { phno, email, name, dob, salary } = req.body;

  try {
    // Validate age (above 20 years)
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 20) {
      return res
        .status(400)
        .json({ error: "User must be above 20 years of age" });
    }

    // Validate monthly salary (25k or more)
    if (salary < 25000) {
      return res
        .status(400)
        .json({ error: "Monthly salary should be 25k or more" });
    }

    // Approve or reject application based on criteria
    const applicationStatus =
      age >= 20 && salary >= 25000 ? "approved" : "rejected";

    // Create new user instance
    const newUser = new User({
      phno,
      email,
      name,
      dob: birthDate,
      salary,
      status: applicationStatus,
    });

    // Save user to the database
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
