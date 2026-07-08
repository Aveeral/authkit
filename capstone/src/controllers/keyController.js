const asyncHandler = require("../utils/asyncHandler.js");
const {generateKey,listKeys,removeKey,rotateKey} = require("../services/keyService.js")

const createKeyController = asyncHandler(async (req, res) => {
  const key = await generateKey(req.user.userId, req.body.name, req.body.scopes);
  res.status(201).json(key);
});

const listKeysController = asyncHandler(async (req, res) => {
  const keys = await listKeys(req.user.userId);
  res.json(keys);
});

const deleteKeyController = asyncHandler(async (req, res) => {
  await removeKey(req.params.id, req.user.userId);
  res.status(204).send();
});

const rotateKeyController = asyncHandler(async (req, res) => {
  const key = await rotateKey(req.params.id, req.user.userId);
  res.json(key);
});

module.exports = { createKeyController, listKeysController, deleteKeyController, rotateKeyController };