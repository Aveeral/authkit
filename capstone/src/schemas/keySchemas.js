// add to a new file, src/schemas/keySchemas.js
const { z } = require("zod");

const createKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string())
});

module.exports = { createKeySchema };