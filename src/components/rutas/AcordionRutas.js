import React, { useEffect, useState } from 'react'

import { ROLES } from '../../routes'
import { useAuth } from '../../contexts/AuthContext'

/* Componentes */
import Cargando from '../Cargando'
import ModalMapa from './ModalMapa'
import ModalFichaje from './ModalFichaje'

/* Hooks */
import useFirestore from '../../hooks/useFirestore'

const AcordionRutas = ({ rutas }) => {
  const { currentUser, userRoles } = useAuth()
  const { cargando: cargandoRutas } = useFirestore('rutas')
  const { datos: usuarios } = useFirestore('usuarios')
  const [rutasFiltradas, setRutasFiltradas] = useState([])
  const [buscar, setBuscar] = useState('')
  const [maxRutas, setMaxRutas] = useState(10)

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

  useEffect(() => {
    const rutasFiltradas = filtrarRutas(
      '',
      userRoles.includes(ROLES.Admin),
      currentUser.uid
    )
    setRutasFiltradas(rutasFiltradas)
    // eslint-disable-next-line
  }, [rutas, userRoles, currentUser.uid])

  return (
    <>
      <div className='mx-1'>
        <div className='input-group mb-3'>
          <label htmlFor='listaPromotoras' className='input-group-text'>
            <i className='fas fa-id-card-clip me-1'></i> Promotora:
          </label>
          <input
            className='form-control'
            list='datalistOptions'
            id='listaPromotoras'
            placeholder='Buscar...'
            onChange={(e) => handleBusqueda(e)}
            value={buscar}
          />
          <datalist id='datalistOptions'>
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
                              className='col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 text-center mb-3 border rounded bg-light py-2'
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
                                          <small>{nombreAlmacen}</small>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                  {userRoles.includes(ROLES.Admin) ? (
                                    <ModalMapa
                                      modalId={`${ruta.id}${fecha}`}
                                      ruta={ruta}
                                      fecha={fecha}
                                      almacenes={ruta.locaciones[fecha]}
                                    />
                                  ) : (
                                    <ModalFichaje
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
