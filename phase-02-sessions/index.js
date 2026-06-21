const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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