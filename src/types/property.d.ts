import type { Database } from "./database.types.js"

export type PropertyKind = "Apartment" | "Villa"

export type Property = Database["public"]["Tables"]["properties"]["Row"]

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"]

export type NewProperty = Omit<PropertyInsert, "property_id" | "created_at" | "owner_id" | "kind_of_property"
> & {
  owner_id: string;
  kind_of_property: PropertyKind
}

export type PropertyValidKey = keyof Property