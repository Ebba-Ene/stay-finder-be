import type { Context, Next } from "hono";
import type { BasicSupabaseClient } from "../types/supabase.js";
import { HTTPException } from "hono/http-exception";
import { createSupabaseForRequest } from "../lib/supabase.js";


async function setSupabaseContext(c: Context): Promise<void> {
  const existingClient = c.get("supabase") as BasicSupabaseClient | undefined

  if(existingClient){
    return
  }

  const supabase = createSupabaseForRequest(c)

  c.set("supabase", supabase as BasicSupabaseClient)

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  c.set("user", error ? null : user)
}

export async function optionalAuth(c: Context, next: Next) {
  await setSupabaseContext(c)
  await next()
}

export async function requireAuth(c: Context, next: Next) {
  await setSupabaseContext(c)

  const user = c.get("user")

  if (!user) {
    throw new HTTPException(401, {
      message: "unauthorized"
    })
  }

  await next()
}