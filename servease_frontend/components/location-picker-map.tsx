'use client'

import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'

type LocationPickerMapProps = {
  latitude: number
  longitude: number
  onChange: (latitude: number, longitude: number) => void
}

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  map.setView([latitude, longitude], map.getZoom())
  return null
}

function PickHandler({ onChange }: { onChange: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full min-h-72 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter latitude={latitude} longitude={longitude} />
      <PickHandler onChange={onChange} />
      <CircleMarker center={[latitude, longitude]} radius={10} pathOptions={{ color: '#2563eb', fillColor: '#14b8a6', fillOpacity: 0.85 }}>
        <Popup>Selected service location</Popup>
      </CircleMarker>
    </MapContainer>
  )
}
