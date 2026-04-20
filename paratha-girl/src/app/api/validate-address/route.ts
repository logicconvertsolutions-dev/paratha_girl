import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress }   from '@/lib/distance'
import { isWithinDeliveryZone } from '@/lib/distance'

export async function POST(req: NextRequest) {
  const { address } = await req.json()

  if (!address?.trim()) {
    return NextResponse.json(
      { valid: false, message: 'Address is required.' },
      { status: 400 }
    )
  }

  const geo = await geocodeAddress(address)

  if (!geo) {
    return NextResponse.json({
      valid:   false,
      message: 'Could not find that address. Try adding Toronto, ON.',
      distanceKm: 0,
      lat: 0, lng: 0,
      address: '',
    })
  }

  const { valid, distanceKm } = isWithinDeliveryZone(geo.lat, geo.lng)

  return NextResponse.json({
    valid,
    distanceKm: Math.round(distanceKm * 10) / 10,
    address:    geo.displayName,
    lat:        geo.lat,
    lng:        geo.lng,
    message:    valid
      ? `Within ${distanceKm.toFixed(1)}km — Delivery confirmed`
      : `${distanceKm.toFixed(1)}km away — Outside our 7km zone`,
  })
}
