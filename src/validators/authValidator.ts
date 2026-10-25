import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { getValidationError } from "../utils/validation.js";

const authSchema = z.object({
  email: z.email("A valid email is required"),
  password: z.string().min(6, "password has to be 6 chars long")
})

const registerSchema = authSchema.extend({
  name: z.string().min(1, "Name is required")
})

export const registerValidator = zValidator(
  "json", registerSchema,
  (result, c) => {
    if(!result.success) {
      return c.json(getValidationError(result.error), 400)
    }
  }
)
export const loginValidator = zValidator(
  "json", authSchema,
  (result, c) => {
    if(!result.success) {
      return c.json(getValidationError(result.error), 400)
    }
  }
)