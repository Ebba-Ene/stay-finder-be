
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

export async function signInUser(sb: BasicSupabaseClient, email: string, password: string) {
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

export async function signOutUser(sb: BasicSupabaseClient, email: string, password: string) {
  const { error} = await sb.auth.signOut()

  if (error ) {
    throw new Error(error.message)
  }
}