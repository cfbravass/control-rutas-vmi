import { ERRORES } from '../errores'
import { GeoPoint } from 'firebase/firestore'
import { toast } from 'react-toastify'
import React, { createContext, useContext } from 'react'
import useFirestore from '../hooks/useFirestore'

const AlmacenesContext = createContext()

export const AlmacenesProvider = ({ children }) => {
  const { datos, cargando, agregarDocumento, editarDocumento } =
    useFirestore('almacenes')
  const nombresAlmacenes = datos.map((almacen) => almacen.nombre)

  return (
    <AlmacenesContext.Provider
      value={{
        datos,
        cargando,
        agregarDocumento,
        editarDocumento,
        nombresAlmacenes,
      }}
    >
      {children}
    </AlmacenesContext.Provider>
  )
}

export const useAlmacenes = () => {
  const context = useContext(AlmacenesContext)
  if (!context) {
    throw new Error(
      'useAlmacenes debe ser utilizado dentro de AlmacenesProvider'
    )
  }

  const {
    datos,
    cargando,
    agregarDocumento,
    editarDocumento,
    nombresAlmacenes,
  } = context

  // Nueva función para obtener solo almacenes activos
  const obtenerAlmacenesActivos = () => {
    return datos.filter((almacen) => almacen.activo === true)
  }

  const crearAlmacen = async (datos) => {
    const { latitud, longitud } = datos

    if (nombresAlmacenes.includes(datos.nombre?.trim())) {
      toast.error(ERRORES.AlmacenDuplicado)
      throw new Error(ERRORES.AlmacenDuplicado)
    }

    try {
      const ubicacion = new GeoPoint(parseFloat(latitud), parseFloat(longitud))
      const datosDocumento = {
        activo: true,
        nombre: datos.nombre?.trim() || '',
        ciudad: datos.ciudad?.trim() || '',
        direccion: datos.direccion?.trim() || '',
        uidCoordinadora: datos.uidCoordinadora,
        nota: datos.nota?.trim().replace(/\n/g, '\\n') || '',
        ubicacion,
      }
      await agregarDocumento(datosDocumento)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const modificarAlmacen = async (id, nuevosDatos) => {
    const { latitud, longitud, nombre: nuevoNombre } = nuevosDatos

    try {
      const almacenActual = datos.find((almacen) => almacen.id === id)

      if (!almacenActual) {
        throw new Error('Almacén no encontrado')
      }

      const { nombre: nombreActual } = almacenActual

      if (
        nuevoNombre.trim() !== nombreActual.trim() &&
        nombresAlmacenes.some((nombre) => nombre === nuevoNombre.trim())
      ) {
        toast.error(ERRORES.AlmacenDuplicado)
        throw new Error(ERRORES.AlmacenDuplicado)
      }

      const ubicacion = new GeoPoint(parseFloat(latitud), parseFloat(longitud))
      const datosDocumento = {
        nombre: nuevoNombre?.trim() || '',
        ciudad: nuevosDatos.ciudad?.trim() || '',
        direccion: nuevosDatos.direccion?.trim() || '',
        nota: nuevosDatos.nota?.trim().replace(/\n/g, '\\n') || '',
        uidCoordinadora: nuevosDatos.uidCoordinadora,
        ubicacion,
      }

      await editarDocumento(id, datosDocumento)
    } catch (error) {
      toast.error(error.message)
      console.error(error)
      throw error
    }
  }

  return {
    datos,
    cargando,
    crearAlmacen,
    modificarAlmacen,
    nombresAlmacenes,
    obtenerAlmacenesActivos,
  }
}
