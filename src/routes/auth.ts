import { Hono } from "hono";
import { loginUser, logoutUser, registerUser } from "../database/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { loginValidator, registerValidator } from "../validators/authValidator.js";

const auth = new Hono({
  strict: false
})

auth.post("/register", registerValidator, async (c) => {
  const {email, password, name} = c.req.valid("json")

  try{
    const sb = c.get("supabase")
    const user = await registerUser(sb, email, password, name)

    return c.json(
      {user: user}, 200
    ) 

  } catch(e: any) {
    console.warn("Error in registrering", e)
    return c.json(
      {
        message: e?.message
      },
      400
    )
  }
})

//POST LOGIN
auth.post("/login", loginValidator, async (c) => {
  const {email, password} = c.req.valid("json")

  try{
    const sb = c.get("supabase")
    const user = await loginUser(sb, email, password)

    return c.json(
      { user }, 
      200
    )

  } catch(e: any) {
    console.warn("Error in registrering", e)
    return c.json(
      {
        message: e?.message
      },
      400
    )
  }
})

//POST LOGOUT
auth.post("/logut", requireAuth, async (c) => {
  try{
        const sb = c.get("supabase")
        await logoutUser(sb)

        c.set("user", null)

        return c.json({
          message: "Logged Out"
        }, 200
        )
  } catch(e: any) {
    console.warn("Error in logging out", e)
    return c.json(
      {
        message: e?.message
      },
      400
    )
  }
})

export default auth;