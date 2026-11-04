import { Hono } from "hono";
import { getUser, loginUser, logoutUser, registerUser } from "../database/auth.js";
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
      {user: user}, 201
    ) 

  } catch (error: unknown) {
      console.warn("Error registering user", error)

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "user_already_exists"
      ) {
        return c.json({ message: "An account with this email already exists." }, 409)
      }

      return c.json({ message: "Could not register user." }, 500)
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

  } catch (error: unknown) {
    console.warn("Error logging in", error)

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "invalid_credentials"
    ) {
      return c.json(
        { message: "Invalid email or password." },
        401
      )
    }

    return c.json(
      { message: "Could not log in. Please try again later." },
      500
    )
  }
})

//POST LOGOUT
auth.post("/logout", requireAuth, async (c) => {
  try{
        const sb = c.get("supabase")
        await logoutUser(sb)

        c.set("user", null)

        return c.json(
          {
            message: "Logged Out"
          }, 200
        )
  } catch(e: any) {
    console.warn("Error in logging out", e)
    return c.json(
      {
        message: e?.message
      },
      500
    )
  }
})

auth.get("/me", requireAuth, async (c) => {
  try{
    const sb = c.get("supabase")
    const user = await getUser(sb)

    return c.json(
      {
        user
      }, 200
    )

  } catch(e: any) {
    console.warn("Error in getting user", e)
    return c.json(
      {
        message: e?.message
      },
      500
    )
  }
})


export default auth;