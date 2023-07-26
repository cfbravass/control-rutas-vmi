import { GeoPoint } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { ERRORES } from '../errores'
import useFirestore from './useFirestore'
import { toast } from 'react-toastify'

function useAlmacenes() {
  const { datos, cargando, agregarDocumento } = useFirestore('almacenes')
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

  return {
    datos,
    cargando,
    crearAlmacen,
  }
}

export default useAlmacenes
