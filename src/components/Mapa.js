import L from 'leaflet'
import React, { useEffect, useRef } from 'react'

import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

function Mapa({ infoMapa }) {
  const mapContainerRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    const { latitude, longitude, nombre, fecha } = infoMapa
    let DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })
    L.Marker.prototype.options.icon = DefaultIcon

    if (!mapContainerRef.current) return

    let map = null

    if (!markerRef.current) {
      map = L.map(mapContainerRef.current).setView([latitude, longitude], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      markerRef.current = L.marker([latitude, longitude])
        .bindPopup(`${nombre}<br />${fecha}`)
        .addTo(map)
        .openPopup()
    } else {
      map = markerRef.current._map
      markerRef.current
        .setLatLng([latitude, longitude])
        .bindPopup(`${nombre}<br />${fecha}`)
        .openPopup()
    }

    map.setView([latitude, longitude], map.getZoom())
  }, [infoMapa])

  return (
    <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} />
  )
}

export default Mapa
