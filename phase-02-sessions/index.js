const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
dotenv.config();


const app = express();
const PORT = process.env.PORT || 4040;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,    // set to true in production (HTTPS)
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24   // 24 hours in milliseconds
  }
}));

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AuthKit is running"
  });
});

app.listen(PORT, () => {
  console.log(`AuthKit server running on port ${PORT}`);
});