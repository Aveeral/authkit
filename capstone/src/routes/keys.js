const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.js");
const { createKeyController, listKeysController, deleteKeyController, rotateKeyController } = require("../controllers/keyController.js");
const {createKeySchema} = require("../schemas/keySchemas.js");
const validate  = require("../middleware/validate.js");

router.post("/", authenticate,validate(createKeySchema), createKeyController);
router.get("/", authenticate, listKeysController);
router.delete("/:id", authenticate, deleteKeyController);
router.post("/:id/rotate", authenticate, rotateKeyController);

module.exports = router;