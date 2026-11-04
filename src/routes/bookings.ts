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
  const user = c.get("user") as User

  try{
    const bookings = await getMyBookings(sb, user.id)
    return c.json(bookings)
  } catch(error) {
      console.warn("Error in fetching bookings from SB database", error)
      return c.json({ error: "Could not get bookings" }, 500)
  }
})

//GET MY PROPERTIES BOOKINGS
bookings.get("/properties/mine", requireAuth, async (c) => {
  const sb = c.get("supabase")
  const user = c.get("user") as User

  try{
    const bookings = await getOwnedPropertiesBookings(sb, user.id)
    return c.json(bookings)
  } catch(error) {
      console.warn("Error in fetching bookings from SB database", error)
      return c.json({ error: "Could not get bookings" }, 500)
  }
})

//GET BOOKING BY ID
bookings.get("/:id", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const property = await getBookingById(sb, bookingId)
    return c.json(property)
  } catch (error) {
      console.warn("Error fetching booking from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Booking not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not fetch booking" }, 500)
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
  } catch (error) {
    console.warn("Error in inserting booking into SB DB", error);
    return c.json({ error: "Could not create booking"}, 500);
  } 
})

//PATCH BOOKING IF OWNER, can only patch email, name, number of guests, check_in and check_out
bookings.patch("/:id", bookingParamValidator, requireAuth, bookingOptionalValidator, async (c) => {
  const bookingId = c.req.param("id")
  let bookingBody: Partial<Booking> = c.req.valid("json")
  delete bookingBody.booking_id, bookingBody.property_id, bookingBody.total_price, bookingBody.status
  const sb = c.get("supabase")

  try{
    const updatedBooking = await updateBookingById(sb, bookingBody, bookingId)

    return c.json(updatedBooking)
  } catch (error) {
      console.warn("Error fetching booking from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Booking not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not update booking" }, 500)
    }
})

//PATCH BOOKING STATUS IF LOGGED IN TO ACCEPT
bookings.patch("properties/:id/confirm", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const acceptBooking = await updateBookingStatus(sb, "confirmed", bookingId)

    return c.json(acceptBooking)
  } catch (error) {
      console.warn("Error fetching booking from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Booking not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not update booking" }, 500)
    }
})

//PATCH BOOKING STATUS IF OWNER OF PROPERTY AND ACCEPT
bookings.patch("properties/:id/cancell", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const acceptBooking = await updateBookingStatus(sb, "cancelled", bookingId)

    return c.json(acceptBooking)
  } catch (error) {
      console.warn("Error fetching booking from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Booking not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not update booking" }, 500)
    }
})

//OWNER CAN DELETE BOOKING
bookings.delete("/:id", bookingParamValidator, requireAuth, async (c) => {
  const bookingId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    await deleteBookingById(sb, bookingId)

    return c.json(null, 200)
  } catch (error) {
      console.warn("Error fetching booking from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Booking not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not delete booking" }, 500)
    }
})

export default bookings;