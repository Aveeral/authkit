const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const { PORT, SESSION_SECRET, NODE_ENV } = require("./config/env.js");
const { errorHandler } = require("./middleware/errorHandler.js");

const authRoutes = require("./routes/auth.js");
const keyRoutes = require("./routes/keys.js");
const oauthRoutes = require("./routes/oauth.js");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000
    }
  })
);

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/keys", keyRoutes);
app.use("/auth", oauthRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`AuthKit running on port ${PORT}`));

module.exports = app;