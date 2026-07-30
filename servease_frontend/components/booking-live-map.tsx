'use client'

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet'

type BookingLiveMapProps = {
  latitude: number
  longitude: number
  status: string
  providerName: string
}

const statusProgress: Record<string, number> = {
  PENDING: 0.12,
  ACCEPTED: 0.25,
  ON_THE_WAY: 0.62,
  ARRIVED: 0.92,
  IN_PROGRESS: 1,
  COMPLETED: 1,
}

export default function BookingLiveMap({ latitude, longitude, status, providerName }: BookingLiveMapProps) {
  const progress = statusProgress[status] ?? 0.15
  const start = { latitude: latitude + 0.026, longitude: longitude - 0.022 }
  const provider = {
    latitude: start.latitude + (latitude - start.latitude) * progress,
    longitude: start.longitude + (longitude - start.longitude) * progress,
  }
  const eta = status === 'ARRIVED' || status === 'IN_PROGRESS' || status === 'COMPLETED'
    ? 'Arrived'
    : `${Math.max(3, Math.round((1 - progress) * 28))} min ETA`

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full min-h-64 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={[[start.latitude, start.longitude], [latitude, longitude]]} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.65 }} />
      <CircleMarker center={[latitude, longitude]} radius={9} pathOptions={{ color: '#0f172a', fillColor: '#14b8a6', fillOpacity: 0.9 }}>
        <Popup>Service address</Popup>
      </CircleMarker>
      <CircleMarker center={[provider.latitude, provider.longitude]} radius={9} pathOptions={{ color: '#2563eb', fillColor: '#ffffff', fillOpacity: 1, weight: 4 }}>
        <Popup>{providerName || 'Technician'} · {eta}</Popup>
      </CircleMarker>
    </MapContainer>
  )
}
