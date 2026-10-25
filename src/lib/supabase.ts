import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { BasicSupabaseClient } from "../types/supabase.js";

import { env } from "../env.js";
import type{ Database } from "../types/supabase.js";

export const sb = createClient<Database>(
  env.supabaseUrl,
  env.supabaseKey
)

//Skapar en Supabase-klient för varje request. Returtypen är BasicSupabaseClient
export function createSupabaseForRequest(c: Context): BasicSupabaseClient {
  // Skapa en Supabase-klient för den aktuella förfrågan så att den kan läsa och uppdatera användarens session via cookies.
  return createServerClient<Database>(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll(){
        // Gör om inkommande cookies till formatet som Supabase-klienten förväntar sig.
        const cookies = getCookie(c);
  
        return Object.entries(cookies).map(([name, value]) => ({
          name,
          value
        }))
      }, // getAll

      setAll(cookiesToSet) {
        // Spara cookies som Supabase skapar eller uppdaterar på svaret till klienten.
        cookiesToSet.forEach(({name, value, options}) => {
          setCookie(c, name, value, {
            domain: options.domain,
            expires: options.expires,
            maxAge: options.maxAge,
            httpOnly: true, 
            // HTTPS krävs för säkra cookies i produktion.
            secure: env.nodeEnv === "production",
            sameSite: "lax",
            path: "/"
          }) //forEach
        }) //setCookie
      }// setAll
    } //cookies
  }) // return
} //function