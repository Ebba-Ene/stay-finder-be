import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { getValidationError } from "../utils/validation.js";
import type { PropertyKind } from "../types/property.js";

const propertySchema = z.object({
    city: z.string().min(2, "City is necessary"),
    country: z.string().min(2, "Country is necessary"),
    description: z.string().min(2, "Description is necessary"),
    max_guests: z.number().min(1, "Max guests is necessary"),
    price_per_night: z.number().min(100, "Price per night needs to be a minimum of 100"),
    title: z.string().min(2, "Title is necessary"),
    kind_of_property: z.enum<PropertyKind[]>(
    ["apartment", "villa"],
    `Must be one of "apartment" or "villa"`,
  ),
  property_id: z.string().optional(),
  created_at: z.string().optional()
})

export const propertyValidator = zValidator(
  "json", propertySchema,
  (result, c) => {
    if(!result.success){
      return c.json(getValidationError(result.error), 400)
    }
  }
)



