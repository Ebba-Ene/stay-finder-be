import { Hono } from "hono";

import { requireAuth } from "../middleware/auth.js";
import { getMyBookings, getOwnedPropertiesBookings } from "../database/bookings.js";


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

//POST NEW BOOKING IF LOGGED IN AND NOT OWNER

//PATCH BOOKING IF OWNER, can only patch email, name, number of guests, status
//PROPERTY OWNER CAN UPDATE TO CONFIRMED OR CANCELLED
//OWNER OF BOOKING CAN CANCELL
//Cannot UPDATE PRICE, property_id, owner_id

//OWNER CAN DELETE BOOKING IF CANCELLED

export default bookings;