import z from "zod";
import type { BookingStatus } from "../types/booking.js";
import { zValidator } from "@hono/zod-validator";
import { getValidationError } from "../utils/validation.js";

const bookingObject = z.object({
  guest_email: z.email("Guest email is necessary"),
  guest_name: z.string().min(2, "Guest name is necessary"),
  guests: z.number().min(1, "Guests needs to be at least 1"),
  check_in: z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Check in date is not valid YYYY-MM-DD"),
  check_out: z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Check in date is not valid YYYY-MM-DD"),
  status: z.enum<BookingStatus[]>(
    ["pending", "confirmed", "cancelled"]
  ),
})

const dateOrder = {
  message: "Check in can't be later than check out",
  path: ["check_in"],
}

const bookingSchema = bookingObject.refine(
  (data) => data.check_in <= data.check_out,
  dateOrder,
)

export const bookingValidator = zValidator(
  "json",
  bookingSchema,
  (result, c) => {
    if(!result.success) {
      return c.json(getValidationError(result.error), 400);
    }
  }
)