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

module.exports = register;