import { isToday } from 'date-fns'
import { toast } from 'react-toastify'
import React, { useEffect, useState } from 'react'

import { ROLES } from '../../routes'
import { useAuth } from '../../contexts/AuthContext'

/* Componentes */
import Cargando from '../Cargando'
import ModalMapa from './ModalMapa'

/* Hooks */
import useFirestore from '../../hooks/useFirestore'
import useRutas from '../../hooks/useRutas'
import useAlmacenes from '../../hooks/useAlmacenes'

const AcordionRutas = ({ rutas }) => {
  const { currentUser, userRoles } = useAuth()
  const { marcarLlegada, marcarSalida, cargandoRutas } = useRutas()
  const { datos: usuarios } = useFirestore('usuarios')
  const { datos: almacenes } = useAlmacenes()
  const [almacActivos, setAlmacActivos] = useState([])
  const [rutasFiltradas, setRutasFiltradas] = useState([])
  const [buscar, setBuscar] = useState('')
  const [maxRutas, setMaxRutas] = useState(10)
  const [visitaAdicional, setVisitaAdicional] = useState({})
  const [estadoVisitaAdicional, setEstadoVisitaAdicional] = useState({})

  const handleChangeMaxRutas = (e) => {
    const { value } = e.target
    if (value === '' || parseInt(value) <= 0) {
      setMaxRutas(1)
    } else {
      setMaxRutas(value)
    }
  }

  const ordenarFechas = (fechas) => {
    return fechas.sort((a, b) => {
      const dateA = new Date(a.split('-').reverse().join('-'))
      const dateB = new Date(b.split('-').reverse().join('-'))
      return dateA - dateB
    })
  }

  const handleBusqueda = (e) => {
    const { value } = e.target
    const uppercaseValue = value.toUpperCase()
    setBuscar(uppercaseValue)
    setRutasFiltradas(
      filtrarRutas(
        uppercaseValue,
        userRoles.includes(ROLES.Admin),
        currentUser.uid
      )
    )
  }

  const filtrarRutas = (busqueda, esAdmin, uidUsuario) => {
    if (esAdmin) {
      return rutas.filter((ruta) => ruta.nombreUsuario.includes(busqueda))
    } else {
      return rutas.filter(
        (ruta) =>
          ruta.uidUsuario === uidUsuario &&
          ruta.nombreUsuario.includes(busqueda)
      )
    }
  }

  const handleMarcarLlegada = async (ruta, fecha, nombreAlmacen) => {
    const [dia, mes, anio] = fecha.split('-')
    const fechaRuta = new Date(anio, mes - 1, dia)
    if (!isToday(fechaRuta)) {
      // Si la fecha no coincide, no se marca la llegada
      toast.warning(
        'La fecha actual no corresponde a la que se asignó a esta ruta'
      )
      return
    }
    const novedad = prompt('Ingrese novedades si tuvo alguna o pulse aceptar:')

    if (novedad === null) {
      return
    }

    toast.promise(
      marcarLlegada(ruta, fecha, nombreAlmacen, novedad),
      {
        pending: 'Reportando Llegada...',
        error: 'Error al marcar la llegada.',
        success: 'Reporte marcado con éxito.',
      },
      { position: 'bottom-center' }
    )

    setVisitaAdicional({ ...visitaAdicional, [fecha]: '' })
    setEstadoVisitaAdicional({ ...estadoVisitaAdicional, [fecha]: undefined })
  }

  const handleMarcarSalida = async (ruta, fecha, nombreAlmacen) => {
    const [dia, mes, anio] = fecha.split('-')
    const fechaRuta = new Date(anio, mes - 1, dia)
    if (!isToday(fechaRuta)) {
      // Si la fecha no coincide, no se marca la salida
      toast.warning(
        'La fecha actual no corresponde a la que se asignó a esta ruta'
      )
      return
    }
    toast.promise(
      marcarSalida(ruta, fecha, nombreAlmacen),
      {
        pending: 'Reportando Salida...',
        error: 'Error al marcar la salida.',
        success: 'Reporte marcado con éxito.',
      },
      { position: 'bottom-center' }
    )
  }

  const handleVisitaAdicional = (e, fecha) => {
    const { value } = e.target
    const uppercaseValue = value.toUpperCase()
    setVisitaAdicional({ ...visitaAdicional, [fecha]: uppercaseValue })

    if (uppercaseValue === '') {
      setEstadoVisitaAdicional({ ...estadoVisitaAdicional, [fecha]: undefined })
    } else {
      setEstadoVisitaAdicional({
        ...estadoVisitaAdicional,
        [fecha]: almacActivos.some(
          (almacen) => almacen.nombre === uppercaseValue
        ),
      })
    }
  }

  useEffect(() => {
    const rutasFiltradas = filtrarRutas(
      '',
      userRoles.includes(ROLES.Admin),
      currentUser.uid
    )
    setRutasFiltradas(rutasFiltradas)
    // eslint-disable-next-line
  }, [rutas, userRoles, currentUser.uid])

  useEffect(() => {
    setAlmacActivos(almacenes.filter((almacen) => almacen.activo))
  }, [almacenes])

  return (
    <>
      <div className='mx-1'>
        {userRoles.includes(ROLES.Admin) && (
          <div className='input-group mb-3'>
            <label htmlFor='listaPromotoras' className='input-group-text'>
              <i className='fas fa-id-card-clip me-1'></i> Promotora:
            </label>
            <input
              className='form-control'
              list='listaUsuarios'
              id='listaPromotoras'
              placeholder='Buscar...'
              onChange={(e) => handleBusqueda(e)}
              value={buscar}
            />
            <datalist id='listaUsuarios'>
              {usuarios.map((usuario) => (
                <option key={usuario.uid} value={usuario.nombre} />
              ))}
            </datalist>
            <label className='input-group-text' htmlFor='maxRutas'>
              Resultados:
            </label>
            <span className='input-group-text'>
              <input
                style={{ width: '69px' }}
                className='form-control'
                type='number'
                id='maxRutas'
                min={1}
                value={maxRutas}
                step={1}
                onChange={(e) => handleChangeMaxRutas(e)}
              ></input>
            </span>
          </div>
        )}

        {cargandoRutas ? (
          <Cargando />
        ) : (
          <div className='accordion' id='accordionRutasProgramadas'>
            {rutasFiltradas.length !== 0 ? (
              rutasFiltradas.slice(0, maxRutas).map((ruta) => (
                <div className='accordion-item' key={ruta.id}>
                  <h2 className='accordion-header'>
                    <button
                      className={`accordion-button ${
                        ruta.id !== rutasFiltradas[0].id ? 'collapsed' : ''
                      }`}
                      type='button'
                      data-bs-toggle='collapse'
                      data-bs-target={`#${ruta.id}`}
                      aria-controls={ruta.id}
                    >
                      <span>
                        {ruta.nombreUsuario}
                        <br />
                        <sup>{`${
                          ordenarFechas(Object.keys(ruta.locaciones))[0]
                        } al ${
                          ordenarFechas(Object.keys(ruta.locaciones))[
                            Object.keys(ruta.locaciones).length - 1
                          ]
                        }`}</sup>
                      </span>
                    </button>
                  </h2>
                  <div
                    id={ruta.id}
                    className={`accordion-collapse collapse ${
                      ruta.id !== rutasFiltradas[0].id ? '' : 'show'
                    }`}
                    data-bs-parent='#accordionRutasProgramadas'
                  >
                    <div className='row accordion-body d-flex justify-content-center'>
                      {ordenarFechas(Object.keys(ruta.locaciones)).map(
                        (fecha) => {
                          const [dia, mes, anio] = fecha.split('-')
                          const date = new Date(anio, mes - 1, dia)
                          let formattedFecha = date.toLocaleDateString(
                            'es-ES',
                            {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'numeric',
                              year: 'numeric',
                            }
                          )

                          formattedFecha =
                            formattedFecha.charAt(0).toUpperCase() +
                            formattedFecha.slice(1)

                          return (
                            <div
                              className='col-12 col-sm-6 col-lg-4 text-center mb-3 border rounded bg-light py-2'
                              key={fecha}
                            >
                              <div className='mb-4'>
                                <div>
                                  <div>
                                    <i className='far fa-calendar fa-2x text-primary'></i>
                                    <br />
                                    {formattedFecha}
                                  </div>
                                  <ul className='list-group fs-6 mb-1'>
                                    <li
                                      className='list-group-item active'
                                      aria-current='true'
                                    >
                                      PROGRAMACIÓN
                                    </li>
                                    {Object.entries(ruta.locaciones[fecha]).map(
                                      ([nombreAlmacen, datosVisita]) => (
                                        <li
                                          className='list-group-item'
                                          key={`${
                                            ruta.id
                                          }${nombreAlmacen.replace(
                                            ' ',
                                            ''
                                          )}${fecha}`}
                                        >
                                          <div
                                            className='btn-group'
                                            role='group'
                                            aria-label='Marcar llegada o Salida'
                                          >
                                            {!userRoles.includes(
                                              ROLES.Admin
                                            ) ? (
                                              <>
                                                <button
                                                  className={`btn btn-sm btn-outline-dark ${
                                                    !userRoles.includes(
                                                      ROLES.Admin
                                                    ) && 'dropdown-toggle'
                                                  }`}
                                                  data-bs-toggle={`${
                                                    !userRoles.includes(
                                                      ROLES.Admin
                                                    ) && 'dropdown'
                                                  }`}
                                                  aria-expanded='false'
                                                >
                                                  {nombreAlmacen}
                                                </button>
                                                <ul
                                                  className='dropdown-menu'
                                                  aria-labelledby='btnGroupDrop1'
                                                >
                                                  {!datosVisita.ubicacionIngreso && (
                                                    <li>
                                                      <button
                                                        className='dropdown-item'
                                                        onClick={() =>
                                                          handleMarcarLlegada(
                                                            ruta,
                                                            fecha,
                                                            nombreAlmacen
                                                          )
                                                        }
                                                      >
                                                        Marcar Ingreso
                                                      </button>
                                                    </li>
                                                  )}
                                                  {!datosVisita.ubicacionSalida && (
                                                    <li>
                                                      <button
                                                        className='dropdown-item'
                                                        onClick={() =>
                                                          handleMarcarSalida(
                                                            ruta,
                                                            fecha,
                                                            nombreAlmacen
                                                          )
                                                        }
                                                      >
                                                        Marcar Salida
                                                      </button>
                                                    </li>
                                                  )}
                                                </ul>
                                              </>
                                            ) : (
                                              <p className='m-0'>
                                                {nombreAlmacen}
                                              </p>
                                            )}
                                          </div>
                                        </li>
                                      )
                                    )}
                                    {!userRoles.includes(ROLES.Admin) && (
                                      <li className='list-group-item'>
                                        <div className='input-group'>
                                          <input
                                            className={`form-control ${
                                              estadoVisitaAdicional[fecha] ===
                                              true
                                                ? 'is-valid'
                                                : estadoVisitaAdicional[
                                                    fecha
                                                  ] === false
                                                ? 'is-invalid'
                                                : ''
                                            }`}
                                            list={`listaAlmacenesAdicionales${fecha}`}
                                            placeholder='Otro...'
                                            value={visitaAdicional[fecha] || ''}
                                            onChange={(e) =>
                                              handleVisitaAdicional(e, fecha)
                                            }
                                          />
                                          <datalist
                                            id={`listaAlmacenesAdicionales${fecha}`}
                                          >
                                            {almacActivos
                                              .filter(
                                                (x) =>
                                                  !Object.keys(
                                                    ruta.locaciones[fecha]
                                                  ).includes(x.nombre)
                                              )
                                              .map((almacen) => (
                                                <option
                                                  key={almacen.id}
                                                  value={almacen.nombre}
                                                />
                                              ))}
                                          </datalist>
                                          <button
                                            className='btn btn-outline-secondary dropdown-toggle dropdown-toggle-split'
                                            data-bs-toggle='dropdown'
                                            aria-expanded='false'
                                            disabled={
                                              estadoVisitaAdicional[fecha] !==
                                              true
                                            }
                                          >
                                            <span className='visually-hidden'>
                                              Opciones Almacen Adicional
                                            </span>
                                          </button>
                                          <ul className='dropdown-menu dropdown-menu-end'>
                                            <li>
                                              <button
                                                className='dropdown-item'
                                                onClick={() =>
                                                  handleMarcarLlegada(
                                                    ruta,
                                                    fecha,
                                                    visitaAdicional[fecha]
                                                  )
                                                }
                                              >
                                                Marcar Ingreso
                                              </button>
                                            </li>
                                          </ul>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                  {userRoles.includes(ROLES.Admin) && (
                                    <ModalMapa
                                      modalId={`${ruta.id}${fecha}`}
                                      ruta={ruta}
                                      fecha={fecha}
                                      almacenes={ruta.locaciones[fecha]}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-center text-danger fa-bounce'>
                No se han encontrado resultados
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default AcordionRutas
