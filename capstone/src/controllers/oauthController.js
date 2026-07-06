const asyncHandler = require("../utils/asyncHandler.js");
const { generateAuthUrl, handleCallback } = require("../services/oauthService.js");
const { AppError } = require("../middleware/errorHandler.js");

const googleAuthController = (req, res) => {
  const { url, state, codeVerifier } = generateAuthUrl();
  req.session.oauthState = state;
  req.session.codeVerifier = codeVerifier;
  res.redirect(url);
};

const googleCallbackController = asyncHandler(async (req, res, next) => {
  const { state, code } = req.query;

  if (!state || state !== req.session.oauthState) {
    return next(new AppError("Invalid state parameter", 401));
  }

  const { accessToken, refreshToken } = await handleCallback(code, req.session.codeVerifier);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken });
});

module.exports = { googleAuthController, googleCallbackController };