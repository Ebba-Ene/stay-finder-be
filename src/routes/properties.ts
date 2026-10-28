import { Hono } from "hono";
import { getProperties } from "../database/properties.js";

const properties = new Hono({ strict: false })

//GET PROPERTIES FOR LIST VIEW
properties.get("/", async (c) => {
  const sb = c.get("supabase")

  try{
    const properties = await getProperties(sb, {
      maxPrice: Number(c.req.query("max_price")) || undefined,
      maxGuests: Number(c.req.query("max_guests")) || undefined,
      country: c.req.query("country"),
      city: c.req.query("city"),
    })
    return c.json(properties)
  } catch(e) {
    console.warn("Error in fetching properties from SB database", e)
    return c.json([])
  }
})

//GET PROPERTY BY ID FOR DETAIL VIEW

//POST PROPERTY IF LOGGED IN

//PATCH PROPERTY IF OWNER AND LOGGED IN

//DELETE PROPERTY IF OWNER AND LOGGED IN

//GET MY PROPERTIES IF OWNER AND LOGGED IN

export default properties;