import { GeoPoint } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { ERRORES } from '../errores'
import useFirestore from './useFirestore'
import { toast } from 'react-toastify'

function useAlmacenes() {
  const { datos, cargando, agregarDocumento, editarDocumento } =
    useFirestore('almacenes')
  const [nombresAlmacenes, setNombresAlmacenes] = useState([])

  useEffect(() => {
    // Creamos una lista de nombres de todos los almacenes
    setNombresAlmacenes(datos.map((almacen) => almacen.nombre))
  }, [datos])

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
        ubicacion,
      }

      await editarDocumento(id, datosDocumento)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    datos,
    cargando,
    crearAlmacen,
    modificarAlmacen,
  }
}

export default useAlmacenes
