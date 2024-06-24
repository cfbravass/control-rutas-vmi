import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

import { useUsuarios } from '../../contexts/UsuariosContext'

import Cargando from '../../components/Cargando'

export default function MaestroUsuarios() {
  const { sendPasswordResetEmail } = useAuth()
  const {
    datos: usuarios,
    cargando,
    editarDocumento: editarUsuario,
  } = useUsuarios()
  const [buscarNombre, setBuscarNombre] = useState('')
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([])

  const handleResetPassword = async (email) => {
    var result = window.confirm(
      `Enviarás una solicitud de cambio de contraseña para ${email}`
    )
    if (result === true) {
      await sendPasswordResetEmail(email)
    }
  }

  const handleDesactivarUsuario = async (uid) => {
    var result = window.confirm(
      'Estás a punto de inhabilitar una cuenta de usuario'
    )
    if (result === true) {
      await editarUsuario(uid, { activo: false })
    }
  }

  const handleBuscarNombre = (e) => {
    const { value } = e.target
    const valorBusqueda = value.toUpperCase()
    setBuscarNombre(valorBusqueda)
    // Filtramos los usuarios por el criterio de busqueda
    setUsuariosFiltrados(
      usuarios
        .filter((usuario) =>
          usuario.nombre.toUpperCase().includes(valorBusqueda)
        )
        // Ordenar primero Activos y luego Inactivos
        .sort((a, b) => b.activo - a.activo)
    )
  }

  useEffect(() => {
    // Al inicio, mostramos todos los almacenes sin filtrar (ordenados por activo y luego inactivo)
    setUsuariosFiltrados(usuarios.sort((a, b) => b.activo - a.activo))
  }, [usuarios])

  return (
    <>
      <section className='mx-5'>
        <h1 className='text-center mb-4'>Maestro de Usuarios</h1>

        <div className='table-responsive'>
          <table className='table table-hover table-bordered caption-top'>
            <caption>
              Listado de usuarios [{usuariosFiltrados.length}/{usuarios.length}]
            </caption>
            <thead>
              <tr>
                <th
                  scope='col'
                  className='text-center align-middle'
                  title='¿ACTIVO?'
                >
                  <i className='fas fa-signal' />
                </th>
                <th scope='col'>
                  <div className='form-floating'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar...'
                      value={buscarNombre}
                      onChange={handleBuscarNombre}
                      id='filtrar_nombre_usuario'
                    />
                    <label htmlFor='filtrar_nombre_usuario'>NOMBRE</label>
                  </div>
                </th>
                <th scope='col' className='align-middle'>
                  CORREO
                </th>
                <th scope='col' className='align-middle'>
                  UID
                </th>
              </tr>
            </thead>
            <tbody className='table-group-divider'>
              {cargando ? (
                <tr>
                  <td colSpan={6}>
                    <Cargando />
                  </td>
                </tr>
              ) : usuariosFiltrados.length !== 0 ? (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.uid}>
                    <th scope='row' className='text-center'>
                      {usuario.activo ? (
                        <i
                          onClick={() => {
                            handleDesactivarUsuario(usuario.uid)
                          }}
                          role='button'
                          title='Desactivar Usuario'
                          className='fas fa-circle-check text-success'
                        ></i>
                      ) : (
                        <i className='fas fa-circle-xmark text-danger'></i>
                      )}
                    </th>
                    <td>{usuario.nombre}</td>
                    <td>
                      <i
                        onClick={() => {
                          handleResetPassword(usuario.email)
                        }}
                        className='fas fa-unlock-keyhole mx-2 text-warning'
                        role='button'
                        title='Cambiar Contraseña'
                      ></i>
                      {usuario.email}
                    </td>
                    <td>
                      <i
                        onClick={() => {
                          navigator.clipboard.writeText(usuario.uid)
                        }}
                        className='far fa-copy mx-2'
                        role='button'
                        title='Copiar'
                      ></i>
                      {usuario.uid}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='text-center text-danger px-5'>
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
