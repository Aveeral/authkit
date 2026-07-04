const bcrypt = require("bcrypt");
const { AppError } = require("../middleware/errorHandler.js");
const { findUserByEmail, createUser,findUserById } = require("../repositories/userRepository.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { JWT_SECRET } = require("../config/env.js");
const {findRefreshTokenByHash,deleteRefreshTokenByHash,createRefreshToken} = require("../repositories/tokenRepository.js")



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

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    await deleteRefreshTokenByHash(tokenHash);
    throw new AppError("Refresh token expired", 401);
  }

  await deleteRefreshTokenByHash(tokenHash);

  const user = await findUserById(storedToken.user_id);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  const newRawRefreshToken = crypto.randomBytes(40).toString("hex");
  const newRefreshTokenHash = crypto.createHash("sha256").update(newRawRefreshToken).digest("hex");
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken(user.id, newRefreshTokenHash, newExpiresAt);

  return { accessToken, refreshToken: newRawRefreshToken };
}

async function logout(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const tokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");

  await deleteRefreshTokenByHash(tokenHash);
}

module.exports = { register, login,refresh,logout };