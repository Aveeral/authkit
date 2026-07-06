const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { AppError } = require("../middleware/errorHandler.js");
const { findUserByEmail, createUser } = require("../repositories/userRepository.js");
const { findOAuthAccount, createOAuthAccount } = require("../repositories/oauthRepository.js");
const { createRefreshToken } = require("../repositories/tokenRepository.js");
const { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = require("../config/env.js");

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

function generateAuthUrl() {
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });

  return { url, state, codeVerifier };
}

async function handleCallback(code, codeVerifier) {
  const { tokens } = await client.getToken({ code, codeVerifierForPKCE: codeVerifier });
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { sub, email } = payload;

  const existingOAuthAccount = await findOAuthAccount("google", sub);

  let userId;

  if (existingOAuthAccount) {
    userId = existingOAuthAccount.user_id;
  } else {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new AppError("An account with this email already exists. Log in and link Google manually.", 401);
    }

    const newUser = await createUser(email, null);
    await createOAuthAccount(newUser.id, "google", sub);
    userId = newUser.id;
  }

  const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "15m" });

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const refreshTokenHash = crypto.createHash("sha256").update(rawRefreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshToken(userId, refreshTokenHash, expiresAt);

  return { accessToken, refreshToken: rawRefreshToken };
}

module.exports = { generateAuthUrl, handleCallback };