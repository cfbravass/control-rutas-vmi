import { format } from 'date-fns'
import { useState } from 'react'

import Mapa from '../Mapa'
import useAlmacenes from '../../hooks/useAlmacenes'

const ModalMapa = ({ modalId, ruta, fecha, almacenes }) => {
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const { datos: datosAlmacenes } = useAlmacenes()
  const [infoMapa, setInfoMapa] = useState({
    latitude: 0,
    longitude: 0,
    nombre: '',
    fecha: '',
  })

  const almacenesOrdenados = Object.entries(almacenes).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const formatoFecha = (timestamp, formato = 'dd-MM-yyyy h:mm a') => {
    const date = timestamp.toDate() // Convierte el objeto Timestamp a un objeto Date
    return format(date, formato) // Formatea la hora en 'DD-MM-AAAA HH:MM AM/PM'
  }

  const abrirMapa = ({ latitude, longitude, nombre, fecha }) => {
    setInfoMapa({
      latitude,
      longitude,
      nombre,
      fecha,
    })
    setMostrarMapa(true)
  }

  const cerrarMapa = () => {
    setMostrarMapa(false)
  }

  return (
    <>
      <button
        className='btn btn-outline-dark rounded mt-1 px-2'
        data-bs-toggle='modal'
        data-bs-target={`#${modalId}`}
        title='Ver Ingresos y Salidas'
      >
        <i className='fas fa-location-dot'></i>&nbsp;Detalles
      </button>

      <div
        className='modal fade'
        id={modalId}
        tabIndex='-1'
        aria-labelledby='modalMapaLabel'
        aria-hidden='true'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
      >
        <div className='modal-dialog modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 className='modal-title fs-5' id='modalMapaLabel'>
                [{fecha}] Detalles de Ruta
              </h1>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
                onClick={() => cerrarMapa()}
              ></button>
            </div>
            <div className='modal-body'>
              <h6>PROMOTORA - {ruta.nombreUsuario}</h6>

              <table className='table table-sm table-hover table-bordered'>
                <thead>
                  <tr>
                    <th scope='col' className='bg-dark text-light'>
                      ALMACÉN
                    </th>
                    <th scope='col' className='bg-dark text-light'>
                      INGRESO
                    </th>
                    <th scope='col' className='bg-dark text-light'>
                      SALIDA
                    </th>
                    <th scope='col' className='bg-dark text-light'>
                      NOVEDADES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {almacenesOrdenados.map(([nombreAlmacen, datosVisita]) => (
                    <tr key={nombreAlmacen}>
                      <th
                        role='button'
                        onClick={() => {
                          const ubicacion = datosAlmacenes.find(
                            (a) => a.nombre === nombreAlmacen
                          )?.ubicacion
                          abrirMapa({
                            latitude: ubicacion?.latitude || 0,
                            longitude: ubicacion?.longitude || 0,
                            nombre:
                              ubicacion?.latitude && ubicacion?.longitude
                                ? nombreAlmacen
                                : 'Ubicación no definida',
                            fecha: '',
                          })
                        }}
                        scope='row'
                      >
                        {nombreAlmacen}
                      </th>
                      {datosVisita.ubicacionIngreso ? (
                        <th
                          role='button'
                          onClick={() =>
                            abrirMapa({
                              latitude: datosVisita.ubicacionIngreso.latitude,
                              longitude: datosVisita.ubicacionIngreso.longitude,
                              nombre: 'INGRESO',
                              fecha: formatoFecha(datosVisita.fechaIngreso),
                            })
                          }
                        >
                          <i className='fas fa-location-crosshairs me-2'></i>
                          {formatoFecha(datosVisita.fechaIngreso, 'h:mm a')}
                        </th>
                      ) : (
                        <th>-o-</th>
                      )}
                      {datosVisita.ubicacionSalida ? (
                        <th
                          role='button'
                          onClick={() =>
                            abrirMapa({
                              latitude: datosVisita.ubicacionSalida.latitude,
                              longitude: datosVisita.ubicacionSalida.longitude,
                              nombre: 'SALIDA',
                              fecha: formatoFecha(datosVisita.fechaSalida),
                            })
                          }
                        >
                          <i className='fas fa-location-crosshairs me-2'></i>
                          {formatoFecha(datosVisita.fechaSalida, 'h:mm a')}
                        </th>
                      ) : (
                        <th>-o-</th>
                      )}
                      <th>{`:ingreso: ${
                        datosVisita.novedadIngreso || ''
                      } | :salida: ${datosVisita.novedadSalida || ''}`}</th>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mostrarMapa && <Mapa infoMapa={infoMapa} />}
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-secondary'
                data-bs-dismiss='modal'
                onClick={() => cerrarMapa()}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModalMapa
