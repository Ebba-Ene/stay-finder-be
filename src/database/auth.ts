
import type { BasicSupabaseClient } from "../types/supabase.js";


export async function registerUser(sb: BasicSupabaseClient, email: string, password: string, name: string) {
  const {data, error} = await sb.auth.signUp({
    email,
    password,
       options: {
        data: {
          name
        }
      }
  })

  if (!error && data.user) {
    return {
      id: data.user.id,
      email: data.user.email as string
    }
  }

  throw error;
}

export async function loginUser(sb: BasicSupabaseClient, email: string, password: string) {
  const {data, error} = await sb.auth.signInWithPassword({
    email,
    password
  })

  if (!error && data.user) {
    return {
      id: data.user.id,
      email: data.user.email as string
    }
  }

  throw error;
}

export async function logoutUser(sb: BasicSupabaseClient) {
  const { error} = await sb.auth.signOut()

  if (error ) {
    throw new Error(error.message)
  }
}