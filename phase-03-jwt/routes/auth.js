const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const password_hash = await bcrypt.hash(password.trim(), 10);

    await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
      [email, password_hash]
    );

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already registered" });
    }
    next(err);
  }
});

module.exports = router;