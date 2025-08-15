import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

import useRutas from '../../hooks/useRutas'
import Cargando from '../Cargando'
import ModalMapa from '../ModalMapa'

function AdminRutas() {
  const { currentUser } = useAuth()
  const { rutasPorFecha, filtrarRutasPorFecha, cargando } = useRutas(
    currentUser.uid
  )
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date(new Date().setHours(0, 0, 0, 0))
  )

  const verificarFichajes = (visita) => {
    if (visita.horaIngreso && visita.horaSalida) {
      return 'border-success'
    } else if (visita.horaIngreso) {
      return 'border-warning'
    } else {
      return 'border-danger'
    }
  }

  const handleChangeFecha = (e) => {
    setFechaSeleccionada(
      e.target.value
        ? new Date(e.target.value + 'T00:00:00')
        : new Date(new Date().setHours(0, 0, 0, 0))
    )
  }

  useEffect(() => {
    const filtrarRutas = async () => {
      await filtrarRutasPorFecha(fechaSeleccionada, null, null, currentUser.uid)
    }

    filtrarRutas()
    // eslint-disable-next-line
  }, [fechaSeleccionada])

  return (
    <>
      <div
        className='text-center form-floating mb-2 mx-auto'
        style={{ width: '150px' }}
      >
        <input
          type='date'
          className='form-control border border-dark rounded-pill'
          id='fecha'
          required
          value={format(fechaSeleccionada, 'yyyy-MM-dd')}
          onChange={handleChangeFecha}
        />
        <label htmlFor='fecha'>Fecha</label>
      </div>

      <div className='table-responsive'>
        <table className='table table-bordered caption-top'>
          <thead className='table-dark'>
            <tr className='align-middle'>
              <th scope='col'>
                <i className='fas fa-user'></i> PROMOTORA
              </th>
              <th scope='col'>
                <i className='fas fa-store'></i> ALMACENES
              </th>
              <th scope='col' className='text-center'>
                <i className='fas fa-burger'></i> ALMUERZO HH:MM:SS
              </th>
            </tr>
          </thead>
          <tbody className='table-group-divider'>
            {cargando ? (
              <tr>
                <td colSpan='2' className='text-center'>
                  <Cargando />
                </td>
              </tr>
            ) : rutasPorFecha.length === 0 ? (
              <tr>
                <td colSpan='2' className='text-center'>
                  No hay rutas para la fecha seleccionada
                </td>
              </tr>
            ) : (
              rutasPorFecha.map((ruta) => (
                <tr key={ruta.id} className='align-middle'>
                  <td>
                    <b>{ruta.nombreUsuario}</b>
                  </td>
                  <td className='p-0'>
                    <ul className='list-group list-group-flush p-0 m-0'>
                      {Object.entries(ruta.almacenes).map(
                        ([almacen, visita]) => (
                          <li
                            key={`${ruta.id}-${almacen}`}
                            className={`list-group-item m-1 p-1 rounded border ${verificarFichajes(
                              visita
                            )}`}
                            data-bs-toggle='modal'
                            data-bs-target={`#modalMapa-${ruta.id}-${visita.idAlmacen}`}
                          >
                            <div className='row m-0 p-0 d-flex justify-content-center'>
                              <span className='col-6'>{almacen}</span>
                              <span className='col-2 text-center p-0 pe-1'>
                                {visita.horaIngreso
                                  ?.toDate()
                                  .toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) || '--:--'}
                              </span>
                              <span className='col-2 text-center p-0 ps-1'>
                                {visita.horaSalida
                                  ?.toDate()
                                  .toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }) || '--:--'}
                              </span>
                              <span className='col-2 text-center p-0 ps-1 border rounded bg-dark text-light'>
                                <i className='fas fa-clock'></i>{' '}
                                {visita.horaIngreso && visita.horaSalida ? (
                                  <>
                                    {Math.floor(
                                      (visita.horaSalida.toDate() -
                                        visita.horaIngreso.toDate()) /
                                        36e5
                                    )
                                      .toString()
                                      .padStart(2, '0')}
                                    :
                                    {Math.floor(
                                      ((visita.horaSalida.toDate() -
                                        visita.horaIngreso.toDate()) %
                                        36e5) /
                                        6e4
                                    )
                                      .toString()
                                      .padStart(2, '0')}
                                  </>
                                ) : (
                                  '--:--'
                                )}
                              </span>
                            </div>

                            <ModalMapa
                              idModal={`modalMapa-${ruta.id}-${visita.idAlmacen}`}
                              visita={visita}
                              ruta={ruta}
                            />
                          </li>
                        )
                      )}
                    </ul>
                  </td>
                  <td className='text-center'>
                    <i className='fas fa-utensils'></i>{' '}
                    {ruta.horaInicioAlmuerzo && ruta.horaFinAlmuerzo ? (
                      <>
                        00:
                        {Math.floor(
                          (ruta.horaFinAlmuerzo.toDate() -
                            ruta.horaInicioAlmuerzo.toDate()) /
                            6e4
                        )
                          .toString()
                          .padStart(2, '0')}
                        :
                        {Math.floor(
                          ((ruta.horaFinAlmuerzo.toDate() -
                            ruta.horaInicioAlmuerzo.toDate()) %
                            6e4) /
                            1e3
                        )
                          .toString()
                          .padStart(2, '0')}
                      </>
                    ) : (
                      '--:--:--'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminRutas
