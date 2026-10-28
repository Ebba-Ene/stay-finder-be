import type { Database } from "./database.types.js"

export type PropertyKind = "apartment" | "villa"

export type Property = Database["public"]["Tables"]["properties"]["Row"]

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"]

export type NewProperty = Omit<Property, "property_id" | "created_at" | "owner_id">

export type PropertyValidKey = keyof Property