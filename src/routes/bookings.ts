import { Hono } from "hono";

import { requireAuth } from "../middleware/auth.js";
import { createBooking, deleteBookingById, getBookingById, getMyBookings, getOwnedPropertiesBookings } from "../database/bookings.js";
import type { Booking } from "../types/booking.js";
import { getPropertyById, updatePropertyById } from "../database/properties.js";
import { bookingValidator } from "../validators/bookingValidator.js";
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
bookings.get("/:id", requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  if (!bookingId) {
    return c.json({ error: "Booking ID is required" }, 400)
  }

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

//PATCH BOOKING IF OWNER, can only patch email, name, number of guests, status
//PROPERTY OWNER CAN UPDATE TO CONFIRMED OR CANCELLED
//OWNER OF BOOKING CAN CANCELL
//Cannot UPDATE PRICE, property_id, owner_id

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