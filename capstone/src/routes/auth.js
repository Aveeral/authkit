const express = require("express");
const router = express.Router();
const validate  = require("../middleware/validate.js");
const { registerSchema, loginSchema } = require("../schemas/authSchemas.js"); // you'll define these two Zod schemas
const { registerController, loginController, refreshController, logoutController } = require("../controllers/authController.js");

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

module.exports = router;