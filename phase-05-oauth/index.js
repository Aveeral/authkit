const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
dotenv.config();


const app = express();
const PORT = process.env.PORT || 4040;


app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,    // set to true in production (HTTPS)
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24   // 24 hours in milliseconds
  }
}));

app.use(cookieParser());



const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);




app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AuthKit is running"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`AuthKit server running on port ${PORT}`);
});