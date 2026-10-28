import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { getValidationError } from "../utils/validation.js";

const propertySchema = z.object({
    city: z.string().min(2, "City is necessary"),
    country: z.string().min(2, "Country is necessary"),
    description: z.string().min(2, "Description is necessary"),
    max_guests: z.number().min(1, "Max guests is necessary"),
    price_per_night: z.number().min(100, "Price per night needs to be a minimum of 100"),
    title: z.string().min(2, "Title is necessary"),
})

export const propertyValidator = zValidator(
  "json", propertySchema,
  (result, c) => {
    if(!result.success){
      return c.json(getValidationError(result.error), 400)
    }
  }
)

