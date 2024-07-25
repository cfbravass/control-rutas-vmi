import { Marker } from 'react-leaflet'
import L from 'leaflet'

const MarcadorMapa = ({ lat = 0, lng = 0, icon }) => {
  let iconUrl = ''
  switch (icon) {
    case 'almacen':
      iconUrl = require('../../static/assets/img/marcador-almacen.png')
      break
    case 'ingreso':
      iconUrl = require('../../static/assets/img/marcador-ingreso.png')
      break
    case 'salida':
      iconUrl = require('../../static/assets/img/marcador-salida.png')
      break
    default:
      iconUrl = require('../../static/assets/img/marcador.png')
      break
  }

  const MarcadorUbicacion = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: null,
  })

  return <Marker position={[lat, lng]} icon={MarcadorUbicacion} />
}

export default MarcadorMapa
