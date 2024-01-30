import React, { createContext, useContext } from 'react'
import useFirestore from '../hooks/useFirestore'

const UsuariosContext = createContext()

export const UsuariosProvider = ({ children }) => {
  const datosUsuarios = useFirestore('usuarios')

  return (
    <UsuariosContext.Provider value={datosUsuarios}>
      {children}
    </UsuariosContext.Provider>
  )
}

export const useUsuarios = () => {
  const context = useContext(UsuariosContext)
  if (!context) {
    throw new Error('useUsuarios debe ser utilizado dentro de UsuariosProvider')
  }

  const {
    datos,
    cargando,
    obtenerDocumentos,
    agregarDocumento,
    editarDocumento,
    eliminarDocumento,
  } = context

  // Nueva función para obtener solo usuarios activos
  const obtenerUsuariosActivos = () => {
    return datos.filter((usuario) => usuario.activo === true)
  }

  return {
    datos,
    cargando,
    obtenerDocumentos,
    agregarDocumento,
    editarDocumento,
    eliminarDocumento,
    obtenerUsuariosActivos,
  }
}
