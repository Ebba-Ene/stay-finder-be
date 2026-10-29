import { Hono } from "hono";
import type { User } from "@supabase/supabase-js";

import { createProperty, getProperties, getPropertiesByKind, getPropertyById, updatePropertyById } from "../database/properties.js";
import { propertyOptionalValidator, propertyParamValidator, propertyValidator } from "../validators/propertyValidator.js";
import { requireAuth } from "../middleware/auth.js";
import type { Property } from "../types/property.js";

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
properties.get("/:id", async (c) => {
  const propertyId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const property = await getPropertyById(sb, propertyId)
    return c.json(property)
  } catch (e) {
    console.warn("Error in fetching property from SB database", e)
    return c.json(null, 404)  //404 visar att webbservern inte kunde hitta informationen
  }
})

//GET PROPERTY BY KIND
properties.get("/kind/:kind", propertyParamValidator, async (c) => {
 const kindOfProperty = c.req.valid("param").kind
  const sb = c.get("supabase")

  try{
    const properties = await getPropertiesByKind(sb, kindOfProperty, {
      maxPrice: Number(c.req.query("max_price")) || undefined,
      maxGuests: Number(c.req.query("max_guests")) || undefined,
      country: c.req.query("country"),
      city: c.req.query("city"),
    })
    return c.json(properties)
  } catch (e) {
    console.warn("Error in fetching property from SB database", e)
    return c.json(null, 404)  //404 visar att webbservern inte kunde hitta informationen
  }
})

//POST PROPERTY IF LOGGED IN
properties.post("/", requireAuth, propertyValidator, async (c) => {
  const propertyBody = c.req.valid("json")
  const sb = c.get("supabase")
  const user = c.get("user") as User

  try{
    const newProperty = await createProperty(sb, {
      ...propertyBody,
      owner_id: user.id
    })

    return c.json(newProperty, 201)
  } catch (e) {
    console.warn("Error in inserting property into SB DB", e);
    return c.json(e, 500);
  } 
})

//PATCH PROPERTY IF OWNER AND LOGGED IN
properties.patch("/:id", requireAuth, propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  let propertyBody: Partial<Property> = c.req.valid("json");
  delete propertyBody.owner_id
  delete propertyBody.property_id
  const sb = c.get("supabase")

    try{
    const updatedProperty = await updatePropertyById(sb, propertyBody, propertyId)

    return c.json(updatedProperty)
  } catch (e) {
    console.warn("Error in updating property into SB DB", e);
    return c.json(null, 404);
  } 
})

//DELETE PROPERTY IF OWNER AND LOGGED IN

//GET MY PROPERTIES IF OWNER AND LOGGED IN

export default properties;