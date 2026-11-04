import { Hono } from "hono";

import { requireAuth } from "../middleware/auth.js";
import { createBooking, deleteBookingById, getBookingById, getMyBookings, getOwnedPropertiesBookings, updateBookingById, updateBookingStatus } from "../database/bookings.js";
import type { Booking } from "../types/booking.js";
import { bookingOptionalValidator, bookingParamValidator, bookingValidator } from "../validators/bookingValidator.js";
import type { User } from "@supabase/supabase-js";


const bookings = new Hono({strict: false})

//GET MY BOOKINGS
bookings.get("/mine", requireAuth, async (c) => {
  const sb = c.get("supabase")
  const user = c.get("user")

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try{
    const bookings = await getMyBookings(sb, user.id)
    return c.json(bookings)
  } catch (e) {
    console.warn("Error in fetching bookings from SB database", e)
    return c.json([])
  }
})

//GET MY PROPERTIES BOOKINGS
bookings.get("/properties/mine", requireAuth, async (c) => {
  const sb = c.get("supabase")
  const user = c.get("user")

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try{
    const bookings = await getOwnedPropertiesBookings(sb, user.id)
    return c.json(bookings)
  } catch (e) {
    console.warn("Error in fetching bookings from SB database", e)
    return c.json([])
  }
})

//GET BOOKING BY ID
bookings.get("/:id", requireAuth, bookingParamValidator, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const property = await getBookingById(sb, bookingId)
    return c.json(property)
  } catch (e) {
    console.warn("Error in fetching booking from SB database", e)
    return c.json(null, 404) 
  }
})

//POST NEW BOOKING IF LOGGED IN
bookings.post("/property/:id", requireAuth, bookingValidator, async (c) => {
  const bookingBody = c.req.valid("json")
  const user = c.get("user") as User
  const sb = c.get("supabase")
  const propertyId = c.req.param("id")
  
  try{
    const newBooking = await createBooking(sb, {
      ...bookingBody,
      owner_id: user.id,
      property_id: propertyId
    })

    return c.json(newBooking, 201)
  } catch (e) {
    console.warn("Error in inserting booking into SB DB", e);
    return c.json(e, 500);
  } 
})

//PATCH BOOKING IF OWNER, can only patch email, name, number of guests, check_in and check_out
bookings.patch("/:id", requireAuth, bookingOptionalValidator, async (c) => {
  const bookingId = c.req.param("id")
  let bookingBody: Partial<Booking> = c.req.valid("json")
  delete bookingBody.booking_id, bookingBody.property_id, bookingBody.total_price, bookingBody.status
  const sb = c.get("supabase")

  try{
    const updatedBooking = await updateBookingById(sb, bookingBody, bookingId)

    return c.json(updatedBooking)
  } catch (e) {
    console.warn("Error in updating property into SB DB", e);
    return c.json(null, 404);
  }
})

//PATCH BOOKING STATUS IF LOGGED IN TO ACCEPT
bookings.patch("properties/:id/confirm", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const acceptBooking = await updateBookingStatus(sb, "confirmed", bookingId)

    return c.json(acceptBooking)
  } catch (e) {
    console.warn("Error in updating property into SB DB", e);
    return c.json(null, 404);
  }
})

//PATCH BOOKING STATUS IF OWNER OF PROPERTY AND ACCEPT
bookings.patch("properties/:id/cancell", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const acceptBooking = await updateBookingStatus(sb, "cancelled", bookingId)

    return c.json(acceptBooking)
  } catch (e) {
    console.warn("Error in updating property into SB DB", e);
    return c.json(null, 404);
  }
})

//OWNER CAN DELETE BOOKING
bookings.delete("/:id", requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")
  
  if (!bookingId) {
    return c.json({ error: "Booking ID is required" }, 400)
  }

  try{
    await deleteBookingById(sb, bookingId)

    return c.json(null, 200)
  } catch (e) {
    console.warn("Error in deleting booking into SB DB", e);
    return c.json(null, 404);
  } 
})

export default bookings;