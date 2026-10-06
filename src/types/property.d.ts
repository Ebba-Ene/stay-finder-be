type PropertyKind = "apartment" | "villa"

interface Property {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  kind: PropertyKind;
  property_id: string;
  created_at: string;
}