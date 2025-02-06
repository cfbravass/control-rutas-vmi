import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const MarcadorMapa = ({ lat = 0, lng = 0, icon, label }) => {
  // Definir el icono personalizado
  let iconUrl = ''
  let popupAnchor = [0, -16] // Valor por defecto (arriba)
  let iconSize = [32, 32]

  switch (icon) {
    case 'almacen':
      iconUrl = require('../../static/assets/img/marcador-almacen.png')
      iconSize = [21, 21]
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

  const icono = L.icon({
    iconUrl,
    iconSize: iconSize,
    iconAnchor: [16, 32],
    popupAnchor,
  })

  return (
    <Marker position={[lat, lng]} icon={icono}>
      <Popup>{label}</Popup>
    </Marker>
  )
}

export default MarcadorMapa
