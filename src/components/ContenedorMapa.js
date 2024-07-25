import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import MarcadorMapa from './rutas/MarcadorMapa'

const ContenedorMapa = ({ almacen, visita }) => {
  return (
    <MapContainer
      center={[almacen.ubicacion.latitude, almacen.ubicacion.longitude]}
      zoom={16}
      style={{ height: '250px', width: '100%', borderRadius: '0.3rem' }}
      attributionControl={false}
    >
      <TileLayer
        url='https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
      />
      <MarcadorMapa
        lat={almacen.ubicacion.latitude}
        lng={almacen.ubicacion.longitude}
        icon='almacen'
      />
      {visita.ubicacionIngreso && (
        <MarcadorMapa
          lat={visita.ubicacionIngreso.latitude}
          lng={visita.ubicacionIngreso.longitude}
          icon='ingreso'
        />
      )}
      {visita.ubicacionSalida && (
        <MarcadorMapa
          lat={visita.ubicacionSalida.latitude}
          lng={visita.ubicacionSalida.longitude}
          icon='salida'
        />
      )}
    </MapContainer>
  )
}

export default ContenedorMapa
