import { format, isToday } from 'date-fns'
import { toast } from 'react-toastify'
import { useState } from 'react'

import useRutas from '../../hooks/useRutas'

const ModalFichaje = ({ modalId, ruta, fecha, almacenes }) => {
  const { marcarLlegada, marcarSalida } = useRutas()
  const [llegando, setLlegando] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  const [dia, mes, anio] = fecha.split('-')
  const fechaActual = new Date(anio, mes - 1, dia)
  const almacenesOrdenados = Object.entries(almacenes).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const formatoHora = (timestamp) => {
    const date = timestamp.toDate() // Convierte el objeto Timestamp a un objeto Date
    return format(date, 'h:mm a') // Formatea la hora en 'HH:MM AM/PM'
  }

  const handleMarcarLlegada = async (nombreAlmacen) => {
    setLlegando(true)
    if (!isToday(fechaActual)) {
      // Si la fecha no coincide, no se marca la llegada
      setLlegando(false)
      toast.error(
        'La fecha actual no corresponde a la que se asignó a esta ruta'
      )
      return
    }
    toast
      .promise(
        marcarLlegada(ruta, fecha, nombreAlmacen),
        {
          pending: 'Reportando Llegada...',
          error: 'Error al marcar la llegada.',
          success: 'Reporte marcado con éxito.',
        },
        { position: 'bottom-center' }
      )
      .finally(() => setLlegando(false))
  }

  const handleMarcarSalida = async (nombreAlmacen) => {
    setSaliendo(true)
    if (!isToday(fechaActual)) {
      // Si la fecha no coincide, no se marca la salida
      setSaliendo(false)
      toast.error(
        'La fecha actual no corresponde a la que se asignó a esta ruta'
      )
      return
    }
    toast
      .promise(
        marcarSalida(ruta, fecha, nombreAlmacen),
        {
          pending: 'Reportando Salida...',
          error: 'Error al marcar la salida.',
          success: 'Reporte marcado con éxito.',
        },
        { position: 'bottom-center' }
      )
      .finally(() => setSaliendo(false))
  }

  return (
    <>
      <button
        className='btn btn-outline-dark rounded mt-1 p-1'
        data-bs-toggle='modal'
        data-bs-target={`#${modalId}`}
        title='Marcar Ingreso o Salida'
      >
        <i className='fas fa-person-walking-arrow-right'></i>
        <i className='fas fa-door-open me-2'></i>
        <i className='fas fa-door-closed ms-2'></i>
        <i className='fas fa-person-walking-arrow-right'></i>
      </button>

      <div
        className='modal fade'
        id={modalId}
        tabIndex='-1'
        aria-labelledby='ModalFichajeLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 className='modal-title fs-5' id='ModalFichajeLabel'>
                [{fecha}] Ingresos y Salidas
              </h1>
              <button
                type='button'
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <div className='modal-body'>
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
                      <th>
                        {datosVisita.fechaIngreso ? (
                          formatoHora(datosVisita.fechaIngreso)
                        ) : (
                          <button
                            className='btn btn-sm btn-dark'
                            onClick={() => handleMarcarLlegada(nombreAlmacen)}
                          >
                            <i
                              className={`fas fa-clock ${
                                llegando ? 'fa-spin' : ''
                              }`}
                            ></i>
                          </button>
                        )}
                      </th>
                      <th>
                        {datosVisita.fechaSalida ? (
                          formatoHora(datosVisita.fechaSalida)
                        ) : (
                          <button
                            className='btn btn-sm btn-dark'
                            onClick={() => handleMarcarSalida(nombreAlmacen)}
                          >
                            <i
                              className={`fas fa-clock ${
                                saliendo ? 'fa-spin' : ''
                              }`}
                            ></i>
                          </button>
                        )}
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='modal-footer'></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ModalFichaje
