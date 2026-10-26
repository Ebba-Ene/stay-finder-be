import type { BasicSupabaseClient } from "../types/supabase.js";

import type { NewProperty, Property, PropertyValidKey } from "../types/property.js";

const TABLE_NAME = "properties"

const SELECT_QUERY_LIST: PropertyValidKey[] = [
  "property_id",
  "title",
  "image_url",
  "description",
  "country",
  "city",
  "price_per_night",
  "max_guests",
  "kind_of_property",
  "created_at",
  "owner_id"
]

const SELECT_QUERY= SELECT_QUERY_LIST.join(", ")

function selectProperties(sb: BasicSupabaseClient){
  return sb.from(TABLE_NAME).select(SELECT_QUERY)
}

type PropertyListQuery = ReturnType<typeof selectProperties>

type PropertyListFilter = Partial<{
  maxPrice: number;
  country: string
  city: string;
  maxGuests: number;
}>

function buildPropertiesFilter(
  query: PropertyListQuery,
  filters: PropertyListFilter
) {
  if(filters.maxPrice){
    query = query.lte("price_per_night", filters.maxPrice)
  }

  if(filters.maxGuests){
    query = query.lte("max_guests", filters.maxGuests)
  }

  if (filters.country && filters.country.trim().length > 2){
    query = query.ilike("country", `%${filters.country}%`)
  }

  if (filters.city && filters.city.trim().length > 2){
    query = query.ilike("city", `%${filters.city}%`)
  }
}

export async function getProperties(
  sb: BasicSupabaseClient,
  filters: PropertyListFilter
): Promise<Property[]>{
  const query = selectProperties(sb)

  buildPropertiesFilter(query, filters)

  const {error, data} = await query

  if(error){
    throw error
  }

  return data as any as Property[]
}