import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { getTimeRemaining } from '../lib/utils';

// Fix Leaflet default icon paths in bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function MapClusterView({ listings = [], center = [28.6315, 77.2167], zoom = 13, height = '450px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Attribution small text
      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap contributors' }).addTo(map);

      // Create a layer group for markers
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Add Center marker (Current location / NGO)
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `<div style="background:#2F80ED;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(47,128,237,0.6);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    L.marker(center, { icon: userIcon })
      .bindPopup('<b>Your Location</b><br/>Search origin')
      .addTo(markersLayer);

    // Add listing markers
    listings.forEach((item) => {
      if (!item.coordinates?.lat || !item.coordinates?.lng) return;

      const urgencyInfo = getTimeRemaining(item.bestBefore);
      let pinColor = '#2E9E5B'; // fresh green
      if (urgencyInfo.urgency === 'danger') pinColor = '#D64545'; // red
      else if (urgencyInfo.urgency === 'warning') pinColor = '#F5B301'; // amber

      const customIcon = L.divIcon({
        className: 'custom-listing-pin',
        html: `
          <div style="
            background:${pinColor};
            width:34px;
            height:34px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
            font-size:16px;
            box-shadow:0 4px 10px rgba(0,0,0,0.25);
            border:2px solid white;
          ">
            <span style="transform:rotate(45deg);font-size:14px;">🍲</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30]
      });

      const popupHtml = `
        <div style="min-width:210px;font-family:inherit;">
          ${item.photos?.[0] ? `<img src="${item.photos[0]}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" alt="${item.title}"/>` : ''}
          <div style="font-weight:700;font-size:0.95rem;color:#111827;line-height:1.2;margin-bottom:4px;">${item.title}</div>
          <div style="font-size:0.8rem;color:#4B5563;margin-bottom:4px;">
            <b>${item.quantity} ${item.unit}</b> • <span style="color:${pinColor};font-weight:600;">${urgencyInfo.text}</span>
          </div>
          <div style="font-size:0.75rem;color:#6B7280;margin-bottom:8px;">${item.donorName}</div>
          <button id="map-claim-btn-${item.id}" style="
            width:100%;
            background:#2E9E5B;
            color:white;
            border:none;
            padding:6px 12px;
            border-radius:6px;
            font-weight:600;
            font-size:0.825rem;
            cursor:pointer;
          ">
            View & Claim Food
          </button>
        </div>
      `;

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(markersLayer);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`map-claim-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/ngo/listings/${item.id}`);
          };
        }
      });
    });
  }, [listings, center, zoom, navigate]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {/* Overlay legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          fontSize: '0.75rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2E9E5B' }} /> &gt; 2h
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F5B301' }} /> &lt; 2h left
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D64545' }} /> &lt; 30m urgent
        </span>
      </div>
    </div>
  );
}
