import { KITCHEN_COORDS, DELIVERY_RADIUS_KM } from './products'

/**
 * Haversine formula — returns distance in kilometres between two lat/lng points.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R    = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }

/**
 * Returns true when the given coordinates are within the delivery radius.
 */
export function isWithinDeliveryZone(lat: number, lng: number): {
  valid: boolean
  distanceKm: number
} {
  const distanceKm = haversineKm(
    KITCHEN_COORDS.lat, KITCHEN_COORDS.lng,
    lat, lng
  )
  return { valid: distanceKm <= DELIVERY_RADIUS_KM, distanceKm }
}

/**
 * Geocode a free-text address using the OpenStreetMap Nominatim API.
 * No API key required — respects the 1 req/s rate limit via server-side use only.
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number
  lng: number
  displayName: string
} | null> {
  const encoded = encodeURIComponent(`${address}, Toronto, Ontario, Canada`)
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'ParathaGirl/1.0 (contact@paragirl.ca)' },
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  if (!res.ok) return null
  const data = await res.json()
  if (!data.length) return null

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}
