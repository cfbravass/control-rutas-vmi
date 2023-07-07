import { toast } from 'react-toastify'
import React, { useEffect, useState } from 'react'

import { useAuth } from '../contexts/AuthContext'
import Cargando from '../components/Cargando'
import Mapa from '../components/Mapa'
import useRutas from '../hooks/useRutas'

function Rutas() {
  const { currentUser, userRoles } = useAuth()
  const { rutas, marcarLlegada, cargandoRutas } = useRutas()
  const [rutasUsuario, setRutasUsuario] = useState([])
  const [infoMapa, setInfoMapa] = useState({
    latitude: 0,
    longitude: 0,
    nombre: '',
    fecha: '',
  })
  const [showModal, setShowModal] = useState(false)

  const abrirMapa = (latitude, longitude, nombre, fecha) => {
    console.log(latitude, longitude, nombre, fecha)
    setInfoMapa({
      latitude,
      longitude,
      nombre,
      fecha,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const ordenarFechas = (fechas) => {
    return fechas.sort((a, b) => {
      const dateA = new Date(a.split('-').reverse().join('-'))
      const dateB = new Date(b.split('-').reverse().join('-'))
      return dateA - dateB
    })
  }

  const handleMarcarLlegada = async (rutaId, fecha, almacen) => {
    const ruta = rutas.find((ruta) => ruta.id === rutaId)

    toast.promise(
      marcarLlegada(ruta, fecha, almacen),
      {
        pending: 'Reportando llegada...',
        error: 'Error al marcar la llegada.',
        success: 'Reporte marcado con éxito.',
      },
      { position: 'bottom-center' }
    )
  }

  useEffect(() => {
    if (userRoles.includes('admin')) {
      setRutasUsuario(rutas)
    } else {
      const filteredRutas = rutas.filter(
        (ruta) => ruta.uidUsuario === currentUser.uid
      )
      setRutasUsuario(filteredRutas)
    }
  }, [rutas, userRoles, currentUser.uid])

  if (cargandoRutas) {
    return <Cargando />
  }

  return (
    <div className='container'>
      <h1 className='text-center'>Mis Rutas Programadas</h1>
      {rutasUsuario.map((ruta) => (
        <div className='row mx-2' key={ruta.id}>
          <div className='text-center p-2'>ID Ruta: {ruta.id}</div>
          {ordenarFechas(Object.keys(ruta.locaciones)).map((fecha) => {
            const [dia, mes, anio] = fecha.split('-')
            const date = new Date(anio, mes - 1, dia)
            let formattedFecha = date.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })

            formattedFecha =
              formattedFecha.charAt(0).toUpperCase() + formattedFecha.slice(1)

            return (
              <div
                className='col-12 col-lg-2 text-center mb-3 border rounded bg-light py-2'
                key={fecha}
              >
                <div className='row mb-4'>
                  <div className='col'>
                    <div>{formattedFecha}</div>
                    {ruta.locaciones[fecha].almacenesProgramados && (
                      <>
                        <p className='m-0 text-primary'>
                          Almacenes Programados
                        </p>
                        <div>
                          {ruta.locaciones[fecha].almacenesProgramados.map(
                            (nombreAlmacen) => (
                              <div key={`${nombreAlmacen}+${fecha}`}>
                                {nombreAlmacen}
                                <button
                                  onClick={() =>
                                    handleMarcarLlegada(
                                      ruta.id,
                                      fecha,
                                      nombreAlmacen
                                    )
                                  }
                                >
                                  Marcar llegada
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </>
                    )}
                    {ruta.locaciones[fecha].almacenesVisitados !== {} && (
                      <>
                        <p className='m-0 text-info'>Almacenes Visitados</p>
                        <div>
                          {Object.entries(
                            ruta.locaciones[fecha].almacenesVisitados
                          ).map(([nombreAlmacen, almacenData]) => (
                            <div key={nombreAlmacen}>
                              {nombreAlmacen}
                              <br />
                              Hora de visita:{' '}
                              {almacenData.horaVisita && (
                                <>
                                  {typeof almacenData.horaVisita.toDate ===
                                  'function'
                                    ? almacenData.horaVisita
                                        .toDate()
                                        .toLocaleString('es-ES')
                                    : almacenData.horaVisita.toLocaleString(
                                        'es-ES'
                                      )}
                                </>
                              )}
                              <br />
                              Ubicación:{' '}
                              {almacenData.ubicacion && (
                                <>
                                  {almacenData.ubicacion.latitude},{' '}
                                  {almacenData.ubicacion.longitude}
                                  <button
                                    onClick={() =>
                                      abrirMapa(
                                        almacenData.ubicacion.latitude,
                                        almacenData.ubicacion.longitude,
                                        nombreAlmacen,
                                        typeof almacenData.horaVisita.toDate ===
                                          'function'
                                          ? almacenData.horaVisita
                                              .toDate()
                                              .toLocaleString('es-ES')
                                          : almacenData.horaVisita.toLocaleString(
                                              'es-ES'
                                            )
                                      )
                                    }
                                  >
                                    Ver
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {showModal && (
        <div
          className='modal fade show'
          tabIndex='-1'
          style={{ display: 'block' }}
        >
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h1 className='modal-title fs-5'>Mapa</h1>
                <button
                  type='button'
                  className='btn-close'
                  data-bs-dismiss='modal'
                  aria-label='Close'
                  onClick={closeModal}
                ></button>
              </div>
              <div className='modal-body'>
                <Mapa infoMapa={infoMapa} />
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  data-bs-dismiss='modal'
                  onClick={closeModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rutas
