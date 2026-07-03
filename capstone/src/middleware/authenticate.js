const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler.js");
const { JWT_SECRET } = require("../config/env.js");

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError("Invalid authorization header format", 401);
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      return next(err);
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    next(err);
  }
}

module.exports = { authenticate };