// SafeFlow Global — High-Fidelity Safety Map (Leaflet)
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons for different states
const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle auto-centering when data changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function SafetyMap({ incidents = [], activeCheckins = [], center = [20.5937, 78.9629], zoom = 5 }) {
  return (
    <div className="safety-map-container" style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={center} />

        {/* 🚨 Incident Markers */}
        {incidents.map((inc, idx) => (
          <Marker 
            key={`inc-${idx}`} 
            position={[inc.lat, inc.lng]} 
            icon={incidentIcon}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong style={{ color: 'var(--red)', textTransform: 'capitalize' }}>🚨 {inc.type?.replace('_', ' ')}</strong>
                <p style={{ margin: '4px 0', fontSize: 12 }}>{inc.region}, {inc.country}</p>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Severity: {inc.severity}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 👷 Active Worker Markers */}
        {activeCheckins.map((c, idx) => (
          <Marker 
            key={`active-${idx}`} 
            position={[c.latitude, c.longitude]} 
            icon={activeIcon}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong style={{ color: 'var(--green)' }}>👷 Active Session</strong>
                <p style={{ margin: '4px 0', fontSize: 12 }}>Location: {c.location_description}</p>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Depth: {c.sewer_depth}m | Risk: {c.risk_level}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
