import { format } from 'date-fns'
import { useState } from 'react'
import Mapa from '../Mapa'

const ModalMapa = ({ modalId, ruta, fecha, almacenes }) => {
  const [mostrarMapa, setMostrarMapa] = useState(false)

  const almacenesOrdenados = Object.entries(almacenes).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const formatoFecha = (timestamp, formato = 'dd/MM/yyyy HH:mm:ss a') => {
    const date = timestamp.toDate() // Convierte el objeto Timestamp a un objeto Date
    return format(date, formato) // Formatea la hora en 'DD/MM/AAAA HH:MM:SS AM/PM'
  }

  const [infoMapa, setInfoMapa] = useState({
    latitude: 0,
    longitude: 0,
    nombre: '',
    fecha: '',
  })

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
        <div class='modal-dialog'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h1 class='modal-title fs-5' id='modalMapaLabel'>
                [{fecha}] Detalles de Ruta
              </h1>
              <button
                type='button'
                class='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
                onClick={() => cerrarMapa()}
              ></button>
            </div>
            <div class='modal-body'>
              <h6>{ruta.nombreUsuario}</h6>

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
                  </tr>
                </thead>
                <tbody>
                  {almacenesOrdenados.map(([nombreAlmacen, datosVisita]) => (
                    <tr key={nombreAlmacen}>
                      <th scope='row'>{nombreAlmacen}</th>
                      {datosVisita.fechaIngreso ? (
                        <th
                          role='button'
                          onClick={() =>
                            abrirMapa({
                              latitude: datosVisita.ubicacionIngreso.latitude,
                              longitude: datosVisita.ubicacionIngreso.longitude,
                              nombre: nombreAlmacen,
                              fecha: formatoFecha(datosVisita.fechaIngreso),
                            })
                          }
                        >
                          <i className='fas fa-location-crosshairs me-2'></i>
                          {formatoFecha(datosVisita.fechaIngreso, 'h:mm a')}
                        </th>
                      ) : (
                        <th></th>
                      )}
                      {datosVisita.fechaSalida ? (
                        <th
                          role='button'
                          onClick={() =>
                            abrirMapa({
                              latitude: datosVisita.ubicacionSalida.latitude,
                              longitude: datosVisita.ubicacionSalida.longitude,
                              nombre: nombreAlmacen,
                              fecha: formatoFecha(datosVisita.fechaSalida),
                            })
                          }
                        >
                          <i className='fas fa-location-crosshairs me-2'></i>
                          {formatoFecha(datosVisita.fechaSalida, 'h:mm a')}
                        </th>
                      ) : (
                        <th></th>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {mostrarMapa && <Mapa infoMapa={infoMapa} />}
            </div>
            <div class='modal-footer'>
              <button
                type='button'
                class='btn btn-secondary'
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
