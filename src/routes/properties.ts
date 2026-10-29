import { Hono } from "hono";
import { getProperties, getPropertiesByKind, getPropertyById } from "../database/properties.js";
import { propertyParamValidator } from "../validators/propertyValidator.js";

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

  console.log("Kind: ", kindOfProperty)

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

//PATCH PROPERTY IF OWNER AND LOGGED IN

//DELETE PROPERTY IF OWNER AND LOGGED IN

//GET MY PROPERTIES IF OWNER AND LOGGED IN

export default properties;