const bcrypt = require("bcrypt");
const { AppError } = require("../middleware/errorHandler.js");
const { findUserByEmail, createUser } = require("../repositories/userRepository.js");

async function register(email, password) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let user;
  try {
    user = await createUser(email, passwordHash);
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError("Email already in use", 409);
    }
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { AppError } = require("../middleware/errorHandler.js");
const { findUserByEmail } = require("../repositories/userRepository.js");
const { createRefreshToken } = require("../repositories/tokenRepository.js");
const { JWT_SECRET } = require("../config/env.js");

async function login(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken(user.id, refreshTokenHash, expiresAt);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, email: user.email }
  };
}

module.exports = { register, login };