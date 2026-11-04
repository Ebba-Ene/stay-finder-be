import { Hono } from "hono";
import type { User } from "@supabase/supabase-js";

import { createProperty, deletePropertyById, getOwnedProperties, getProperties, getPropertiesByKind, getPropertyById, updatePropertyById } from "../database/properties.js";
import { propertyIdParamValidator, propertyOptionalValidator, propertyParamValidator, propertyValidator } from "../validators/propertyValidator.js";
import { requireAuth } from "../middleware/auth.js";
import type { Property } from "../types/property.js";

const properties = new Hono({ strict: false })

//GET PROPERTIES FOR LIST VIEW
properties.get("/", async (c) => {
  const sb = c.get("supabase")
  
  try{
    const sortParam = c.req.query("sort_price")
    const sortPrice =
    sortParam === "asc" || sortParam === "desc"
      ? sortParam
      : undefined
    const properties = await getProperties(sb, {
      maxPrice: Number(c.req.query("max_price")) || undefined,
      maxGuests: Number(c.req.query("max_guests")) || undefined,
      country: c.req.query("country"),
      city: c.req.query("city"),
      sortPrice
    })
    return c.json(properties, 200)
  } catch(e) {
    console.warn("Error in fetching properties from SB database", e)

    return c.json(
      { error: "Could not fetch properties" },
      500
    )
  }
})

//GET PROPERTY BY ID FOR DETAIL VIEW
properties.get("id/:id", propertyIdParamValidator, async (c) => {
  const propertyId = c.req.param("id")
  const sb = c.get("supabase")

  try{
    const property = await getPropertyById(sb, propertyId)
    return c.json(property)
  } catch (error) {
      console.warn("Error fetching property from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Property not found" }, 404)
      }

      return c.json({ error: "Could not fetch property" }, 500)
    }
})

//GET PROPERTY BY KIND
properties.get("/kind/:kind", propertyParamValidator, async (c) => {
 const kindOfProperty = c.req.valid("param").kind
  const sb = c.get("supabase")
  
  try{
    const sortParam = c.req.query("sort_price")
    const sortPrice =
    sortParam === "asc" || sortParam === "desc"
      ? sortParam
      : undefined
    const properties = await getPropertiesByKind(sb, kindOfProperty, {
      maxPrice: Number(c.req.query("max_price")) || undefined,
      maxGuests: Number(c.req.query("max_guests")) || undefined,
      country: c.req.query("country"),
      city: c.req.query("city"),
      sortPrice
    })
    return c.json(properties, 200)
  } catch (e) {
    console.warn("Error in fetching propoerties from SB database", e)
    return c.json({ error: "Could not fetch properties" }, 500) 
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
properties.patch("/:id", propertyIdParamValidator, requireAuth, propertyOptionalValidator, async (c) => {
  const propertyId = c.req.param("id");
  let propertyBody: Partial<Property> = c.req.valid("json");
  delete propertyBody.owner_id, propertyBody.property_id
  const sb = c.get("supabase")

  try{
    const updatedProperty = await updatePropertyById(sb, propertyBody, propertyId)

    return c.json(updatedProperty)
  } catch (error) {
      console.warn("Error updating property from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Property not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not update property" }, 500)
    }
})

//DELETE PROPERTY IF OWNER AND LOGGED IN
properties.delete("id/:id", propertyIdParamValidator, requireAuth, async (c) => {
  const propertyId = c.req.param("id")
  const sb = c.get("supabase")
  const user = c.get("user") as User

  try{
    await deletePropertyById(sb, propertyId, user.id)

    return c.json(null, 200)
  } catch (error) {
      console.warn("Error deleting property from database", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "PGRST116"
      ) {
        return c.json({ error: "Property not found or you do not have permission" }, 404)
      }

      return c.json({ error: "Could not delete property" }, 500)
    }
})

//GET MY PROPERTIES IF OWNER AND LOGGED IN
properties.get("/mine", requireAuth, async (c) => {
  const sb = c.get("supabase")
  const user = c.get("user")

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try{
    const properties = await getOwnedProperties(sb, user.id)
    return c.json(properties)
  } catch(error) {
    console.warn("Error in fetching properties from SB database", error)
    return c.json({ error: "Could not get properties" }, 500)
  }
})

export default properties;