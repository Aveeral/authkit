const express = require("express");
const router = express.Router();
const { googleAuthController, googleCallbackController } = require("../controllers/oauthController.js");

router.get("/google", googleAuthController);
router.get("/google/callback", googleCallbackController);

module.exports = router;