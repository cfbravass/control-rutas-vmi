import { useEffect, useState } from 'react'

import ModalNuevoAlmacen from '../../components/almacenes/ModalNuevo'
import Cargando from '../../components/Cargando'
import ModalEditarAlmacen from '../../components/almacenes/ModalEditar'
import { useAlmacenes } from '../../contexts/AlmacenesContext'
import { useUsuarios } from '../../contexts/UsuariosContext'
import { useAuth } from '../../contexts/AuthContext'

export default function MaestroAlmacenes() {
  const {
    datos: almacenes,
    cargando,
    crearAlmacen,
    modificarAlmacen,
  } = useAlmacenes()
  const { datos: usuarios } = useUsuarios()
  const [ciudades, setCiudades] = useState([])
  const [buscarNombre, setBuscarNombre] = useState('')
  const [buscarCiudad, setBuscarCiudad] = useState('')
  const [almacenesFiltrados, setAlmacenesFiltrados] = useState([])
  const [usuariosAdmin, setUsuariosAdmin] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    // Creamos una lista de ciudades con todos los almacenes
    const listaCiudades = almacenes
      .filter((a) => a.uidCoordinadora === currentUser.uid)
      .map((almacen) => almacen?.ciudad)
    // Eliminamos duplicados utilizando Set y luego lo convertimos a un array nuevamente
    setCiudades([...new Set(listaCiudades)])
    // Al inicio, mostramos todos los almacenes sin filtrar (ordenados por activo y luego inactivo)
    setAlmacenesFiltrados(
      almacenes
        .filter((a) => a.uidCoordinadora === currentUser.uid)
        .sort((a, b) => b.activo - a.activo)
    )
  }, [almacenes, currentUser])

  useEffect(() => {
    setUsuariosAdmin(
      usuarios.filter((usuario) => usuario.roles.includes('admin'))
    )
    // eslint-disable-next-line
  }, [usuarios])

  const handleBuscarNombre = (e) => {
    const { value } = e.target
    const valorBusqueda = value.toUpperCase()
    setBuscarNombre(valorBusqueda)
    // Filtramos los almacenes por nombre y ciudad
    setAlmacenesFiltrados(
      almacenes
        .filter(
          (almacen) =>
            almacen.nombre.toUpperCase().includes(valorBusqueda) &&
            (!buscarCiudad || almacen?.ciudad === buscarCiudad) &&
            almacen.uidCoordinadora === currentUser.uid
        )
        // Ordenar primero Activos y luego Inactivos
        .sort((a, b) => b.activo - a.activo)
    )
  }

  const handleBuscarCiudad = (e) => {
    const { value } = e.target
    // Si el valor seleccionado es "TODAS", mostramos todos los almacenes sin filtrar por ciudad
    const buscarCiudad = value === 'TODAS' ? null : value
    setBuscarCiudad(buscarCiudad)
    // Filtramos los almacenes por nombre y ciudad
    setAlmacenesFiltrados(
      almacenes
        .filter(
          (almacen) =>
            almacen.nombre.toUpperCase().includes(buscarNombre) &&
            (!buscarCiudad || almacen?.ciudad === buscarCiudad) &&
            almacen.uidCoordinadora === currentUser.uid
        )
        // Ordenar primero Activos y luego Inactivos
        .sort((a, b) => b.activo - a.activo)
    )
  }

  return (
    <>
      <section className='mx-5'>
        <h1 className='text-center mb-4'>Maestro de Almacenes</h1>

        <ModalNuevoAlmacen
          almacenes={almacenes}
          crearAlmacen={crearAlmacen}
          usuariosAdmin={usuariosAdmin}
        />
        <div className='table-responsive'>
          <table className='table table-hover table-bordered table-striped caption-top'>
            <caption>
              Listado de almacenes [{almacenesFiltrados.length}/
              {almacenes.length}]
            </caption>
            <thead className='table-dark'>
              <tr>
                <th
                  scope='col'
                  className='text-center align-middle'
                  title='¿ACTIVO?'
                >
                  <i className='fas fa-signal' />
                </th>
                <th scope='col'>
                  <div className='form-floating text-dark'>
                    <select
                      className='form-select'
                      aria-label='Buscar...'
                      onChange={handleBuscarCiudad}
                      value={buscarCiudad || 'TODAS'}
                      id='filtrar_ciudad'
                    >
                      <option value='TODAS'>TODAS</option>
                      {ciudades.map((ciudad) => (
                        <option key={ciudad} value={ciudad}>
                          {ciudad}
                        </option>
                      ))}
                    </select>
                    <label htmlFor='filtrar_ciudad'>CIUDAD</label>
                  </div>
                </th>
                <th scope='col'>
                  <div className='form-floating text-dark'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar...'
                      value={buscarNombre}
                      onChange={handleBuscarNombre}
                      id='filtrar_nombre'
                    />
                    <label htmlFor='filtrar_nombre'>NOMBRE</label>
                  </div>
                </th>
                <th scope='col' className='align-middle'>
                  DIRECCIÓN
                </th>
                <th scope='col' className='align-middle'>
                  NOTA
                </th>
                <th scope='col' className='align-middle'>
                  LATITUD
                </th>
                <th scope='col' className='align-middle'>
                  LONGITUD
                </th>
                <th scope='col' className='align-middle text-center'>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {cargando ? (
                <tr>
                  <td colSpan={8}>
                    <Cargando />
                  </td>
                </tr>
              ) : almacenesFiltrados.length !== 0 ? (
                almacenesFiltrados.map((almacen) => (
                  <tr key={almacen.id}>
                    <th scope='row' className='text-center align-middle'>
                      <i
                        className={`fas fa-circle-${
                          almacen.activo
                            ? 'check text-success'
                            : 'xmark text-danger'
                        }`}
                      ></i>
                    </th>
                    <td className='align-middle'>{almacen?.ciudad}</td>
                    <td className='align-middle'>{almacen.nombre}</td>
                    <td className='align-middle'>{almacen.direccion}</td>
                    <td
                      className='align-middle'
                      dangerouslySetInnerHTML={{
                        __html: almacen.nota?.replace(/\\n/g, '<br>'),
                      }}
                    ></td>
                    <td className='align-middle'>
                      {almacen.ubicacion.latitude}
                    </td>
                    <td className='align-middle'>
                      {almacen.ubicacion.longitude}
                    </td>
                    <td className='text-center align-middle'>
                      <ModalEditarAlmacen
                        idModal={`modalEditarAlmacen${almacen.id}`}
                        almacen={almacen}
                        almacenes={almacenes}
                        modificarAlmacen={modificarAlmacen}
                        usuariosAdmin={usuariosAdmin}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className='text-center text-danger px-5'>
                    <p className='fa-bounce'>No se han encontrado resultados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
