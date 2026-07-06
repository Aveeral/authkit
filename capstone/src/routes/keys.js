const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const { createKeyController, listKeysController, deleteKeyController, rotateKeyController } = require("../controllers/keyController.js");

router.post("/", authenticate, createKeyController);
router.get("/", authenticate, listKeysController);
router.delete("/:id", authenticate, deleteKeyController);
router.post("/:id/rotate", authenticate, rotateKeyController);

module.exports = router;