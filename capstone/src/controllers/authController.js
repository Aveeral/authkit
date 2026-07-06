const asyncHandler = require("../utils/asyncHandler.js");
const { register, login, refresh, logout } = require("../services/authService.js");

const registerController = asyncHandler(async (req, res) => {
  const user = await register(req.body.email, req.body.password);
  res.status(201).json(user);
});

const loginController = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await login(req.body.email, req.body.password);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken, user });
});

const refreshController = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await refresh(req.cookies.refreshToken);
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken });
});

const logoutController = asyncHandler(async (req, res) => {
  await logout(req.cookies.refreshToken);
  res.clearCookie("refreshToken");
  res.status(204).send();
});

module.exports = { registerController, loginController, refreshController, logoutController };