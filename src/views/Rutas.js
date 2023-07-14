import React, { useEffect, useState } from 'react'

import { ROLES } from '../routes'
import { useAuth } from '../contexts/AuthContext'

/* Componentes */
import Cargando from '../components/Cargando'
import ModalMapa from '../components/rutas/ModalMapa'
import ModalFichaje from '../components/rutas/ModalFichaje'

/* Hooks */
import useRutas from '../hooks/useRutas'
import useUsuarios from '../hooks/useUsuarios'

function Rutas() {
  const { currentUser, userRoles } = useAuth()
  const { rutas, cargandoRutas } = useRutas()
  const { usuarios, cargandoUsuarios } = useUsuarios()
  const [rutasFiltradas, setRutasFiltradas] = useState([])
  const [buscar, setBuscar] = useState('')

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
    const rutasFiltradas = filtrarRutas(
      uppercaseValue,
      userRoles.includes(ROLES.Admin),
      currentUser.uid
    )
    setRutasFiltradas(rutasFiltradas)
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
      <div className='mx-5'>
        <h1 className='text-center'>Rutas Programadas</h1>
        <br />

        {userRoles.includes(ROLES.Admin) && (
          <div className='input-group mb-3'>
            <label htmlFor='listaUsuarios' className='input-group-text'>
              <i className='fas fa-id-card-clip me-1'></i> Promotora:
            </label>
            <input
              className='form-control rounded-end'
              list='datalistOptions'
              id='listaUsuarios'
              placeholder='Buscar...'
              onChange={(e) => handleBusqueda(e)}
              value={buscar}
            />
            <datalist id='datalistOptions'>
              {usuarios.map((usuario) => (
                <option key={usuario.uid} value={usuario.nombre} />
              ))}
            </datalist>
          </div>
        )}

        {cargandoRutas || cargandoUsuarios ? (
          <Cargando />
        ) : (
          <div className='accordion' id='accordionRutasProgramadas'>
            {rutasFiltradas.length !== 0 ? (
              rutasFiltradas.map((ruta) => (
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
                      {ruta.nombreUsuario}
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

export default Rutas
