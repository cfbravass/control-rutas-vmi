import { doc, updateDoc, serverTimestamp, GeoPoint } from 'firebase/firestore'
import { db } from '../firebaseApp'
import { toast } from 'react-toastify'
import useFirestore from './useFirestore'

function useRutas(activo = null) {
  const {
    datos: rutas,
    cargando: cargandoRutas,
    editarDocumento,
    agregarDocumento,
  } = useFirestore('rutas', activo)

  const marcarLlegada = async (ruta, fecha, nombreAlmacen, novedad) => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords

      const almacenRef = [`locaciones.${fecha}.${nombreAlmacen}`]

      await editarDocumento(ruta.id, {
        [`${almacenRef}.fechaIngreso`]: serverTimestamp(),
        [`${almacenRef}.ubicacionIngreso`]: new GeoPoint(latitude, longitude),
        [`${almacenRef}.novedadIngreso`]: novedad,
      })
    } catch (error) {
      toast.error(error)
      console.error(error)
      throw error
    }
  }

  const marcarSalida = async (ruta, fecha, nombreAlmacen) => {
    const rutaDocRef = doc(db, 'rutas', ruta.id)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords

      const almacenRef = [`locaciones.${fecha}.${nombreAlmacen}`]

      await updateDoc(rutaDocRef, {
        [`${almacenRef}.fechaSalida`]: serverTimestamp(),
        [`${almacenRef}.ubicacionSalida`]: new GeoPoint(latitude, longitude),
      })
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  return {
    datos: rutas,
    marcarLlegada,
    marcarSalida,
    crearRuta: agregarDocumento,
    cargandoRutas,
  }
}

export default useRutas
