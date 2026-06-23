const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const authenticate = require('../middleware/authenticate');


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

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // generate refresh token
    const refreshToken = require('crypto').randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // store refresh token in database
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    // set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // send access token in response body
    res.status(200).json({
      message: "Login successful",
      accessToken
    });

  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req,res,next) => {
  try{
  const refreshToken = req.cookies.refreshToken;

  if(refreshToken){
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1",[refreshToken]);
  }
  res.clearCookie('refreshToken', {
  httpOnly: true,
  secure: false,
  sameSite: 'strict'
  });
  res.status(200).json({message : "Logout successful!"});
  }catch(err){
    next(err);
  }
})

router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    res.status(200).json({
      userId: req.user.userId,
      email: req.user.email
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

