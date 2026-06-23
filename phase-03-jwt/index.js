const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();


const app = express();
const PORT = process.env.PORT || 4040;


app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use('cookieParser');


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AuthKit is running"
  });
});

app.use()
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`AuthKit server running on port ${PORT}`);
});