import type { Database } from "./database.types.js"

export type BookingStatus = "pending" | "confirmed" | "cancelled"

export type Booking = Database["public"]["Tables"]["bookings"]["Row"]

type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"]

export type NewBooking = Omit<BookingInsert, "booking_id" | "property_id" | "created_at" | "owner_id" | "booking_status"
> & {
  owner_id: string;
  booking_status: BookingStatus;
}

export type BookingValidKey = keyof Booking