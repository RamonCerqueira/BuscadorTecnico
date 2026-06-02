'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix for default marker icons in Leaflet + Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type TicketMarker = {
  id: string;
  title: string;
  lat: number;
  lng: number;
};

export default function InteractiveMap({ tickets }: { tickets: TicketMarker[] }) {
  const router = useRouter();

  const center: [number, number] = tickets.length > 0 
    ? [tickets[0].lat, tickets[0].lng] 
    : [-23.55052, -46.633308]; // São Paulo default

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tickets.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={customIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-slate-900">{t.title}</h3>
                <button 
                  onClick={() => router.push(`/marketplace`)}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold w-full"
                >
                  Ver Detalhes
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
