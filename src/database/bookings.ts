import type { PostgrestSingleResponse } from "@supabase/supabase-js"
import type { Booking, BookingValidKey } from "../types/booking.js"
import type { BasicSupabaseClient } from "../types/supabase.js"

const TABLE_NAME = "bookings"

const SELECT_QUERY_LIST: BookingValidKey[] = [
  "booking_id",
  "check_in",
  "check_out",
  "created_at",
  "guest_email",
  "guest_name",
  "guests",
  "owner_id",
  "property_id",
  "status",
  "total_price"
]

const SELECT_QUERY = SELECT_QUERY_LIST.join(", ")

export async function getMyBookings(sb: BasicSupabaseClient, ownerId: string): Promise<Booking[]>{
  const {error, data}: PostgrestSingleResponse<Booking[]> = await sb
  .from(TABLE_NAME)
  .select()
  .eq("owner_id", ownerId)

  if(error){
    throw error
  }

  return data
}

export async function getOwnedPropertiesBookings(
  sb: BasicSupabaseClient, ownerId: string
) {
  const {error, data}: PostgrestSingleResponse<Booking[]> = await sb
    .from("bookings")
    .select("*, properties!inner(property_id)")
    .eq("properties.owner_id", ownerId)

  if (error) {
    throw error
  }

  return data
}