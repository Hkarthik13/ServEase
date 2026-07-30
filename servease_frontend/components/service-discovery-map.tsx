'use client'

import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import Link from 'next/link'

type MapService = {
  id: number
  name: string
  category_name: string
  provider_business: string
  provider_name: string
  provider_rating: string
  base_price: string
  provider_latitude?: string | null
  provider_longitude?: string | null
}

type ServiceDiscoveryMapProps = {
  services: MapService[]
  center: { latitude: number; longitude: number; label: string }
}

function fallbackPoint(index: number, center: { latitude: number; longitude: number }) {
  const ring = 0.012 + (index % 3) * 0.006
  const angle = (index * 61 * Math.PI) / 180
  return {
    latitude: center.latitude + Math.sin(angle) * ring,
    longitude: center.longitude + Math.cos(angle) * ring,
  }
}

export default function ServiceDiscoveryMap({ services, center }: ServiceDiscoveryMapProps) {
  const visibleServices = services.slice(0, 12)

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full min-h-96 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle center={[center.latitude, center.longitude]} radius={3200} pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.08 }} />
      <CircleMarker center={[center.latitude, center.longitude]} radius={9} pathOptions={{ color: '#0f172a', fillColor: '#2563eb', fillOpacity: 0.9 }}>
        <Popup>{center.label}</Popup>
      </CircleMarker>

      {visibleServices.map((service, index) => {
        const fallback = fallbackPoint(index, center)
        const latitude = Number(service.provider_latitude || fallback.latitude)
        const longitude = Number(service.provider_longitude || fallback.longitude)

        return (
          <CircleMarker
            key={service.id}
            center={[latitude, longitude]}
            radius={8}
            pathOptions={{ color: '#2563eb', fillColor: '#ffffff', fillOpacity: 0.95, weight: 3 }}
          >
            <Popup>
              <div className="min-w-44 space-y-1">
                <p className="font-semibold text-slate-900">{service.name}</p>
                <p className="text-xs text-slate-500">{service.category_name}</p>
                <p className="text-xs text-slate-500">{service.provider_business || service.provider_name}</p>
                <p className="text-xs font-semibold text-slate-700">Rs {service.base_price} - {service.provider_rating} rating</p>
                <Link href={`/bookings/new?serviceId=${service.id}`} className="mt-2 inline-flex rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
                  Book
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
