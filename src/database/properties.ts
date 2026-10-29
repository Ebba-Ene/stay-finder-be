import type { PostgrestSingleResponse } from "@supabase/supabase-js";

import type { BasicSupabaseClient } from "../types/supabase.js";
import type { Database } from "../types/database.types.js";
import type { NewProperty, Property, PropertyKind, PropertyValidKey } from "../types/property.js";

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
const QUERY_ID = "property_id"
const QUERY_KIND = "kind_of_property"
const QUERY_OWNERID = "owner_id"

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

export async function getPropertyById(sb: BasicSupabaseClient, propertyId: string): Promise<Property>{
  const {error, data}: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .select(SELECT_QUERY)
    .eq(QUERY_ID, propertyId)
    .single()

    if(error){
      throw error
    }

    return data
}

export async function getPropertiesByKind(
  sb: BasicSupabaseClient,
  kindOfProperty: PropertyKind,
  filters: PropertyListFilter
): Promise<Property[]>{
  const query = selectProperties(sb).eq(QUERY_KIND, kindOfProperty )


  buildPropertiesFilter(query, filters)

  const {error, data} = await query

  if(error){
    throw error
  }

  return data as any as Property[]
}

//createProperty
export async function createProperty(sb: BasicSupabaseClient, propertyBody: NewProperty) {

  const {error, data}: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .insert(propertyBody)
    .select(SELECT_QUERY)
    .single()

    if(error){
      throw error
    }

    return data
}

//PATCH PROPERTY IF OWNER AND LOGGED IN
export async function updatePropertyById(
  sb: BasicSupabaseClient, 
  property: Partial<Property>, 
  propertyId: string
) {
  const {error, data}: PostgrestSingleResponse<Property> = await sb
    .from(TABLE_NAME)
    .update(property)
    .eq(QUERY_ID, propertyId)
    .select()
    .single()

    if(error){
      throw error
    }

    return data
}

//DELETE PROPERTY IF OWNER AND LOGGED IN
export async function deletePropertyById(
  sb: BasicSupabaseClient,
  propertyId: string
) {
  const {error}: PostgrestSingleResponse<Property> = await sb
  .from(TABLE_NAME)
  .delete()
  .eq(QUERY_ID, propertyId)
  .select()
  .single()

  if(error){
      throw error
    }

    return
}

//GET MY PROPERTIES IF OWNER AND LOGGED IN
export async function getOwnedProperties(sb: BasicSupabaseClient, ownerId: string){
  const {error, data}: PostgrestSingleResponse<Property[]> = await sb
  .from(TABLE_NAME)
  .select()
  .eq("owner_id", ownerId)

  if(error){
    throw error
  }

  return data
}
