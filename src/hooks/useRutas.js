import { useEffect } from 'react'

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

  useEffect(() => {
    desactivarRutasVencidas()
    // eslint-disable-next-line
  }, [rutas])

  const desactivarRutasVencidas = async () => {
    try {
      // Verificar si la fecha actual es mayor a todas las fechas programadas para desactivar la ruta
      const fechaActual = new Date()
      fechaActual.setHours(0, 0, 0, 0)

      for (const ruta of rutas) {
        if (ruta.activo) {
          const locaciones = ruta.locaciones
          // Se obtienen las fechas programadas en la ruta y se ordenan de mas antigua a mas reciente
          const fechasProgramadas = Object.keys(locaciones).sort((a, b) => {
            const dateA = new Date(a.split('-').reverse().join('-'))
            const dateB = new Date(b.split('-').reverse().join('-'))
            return dateA - dateB
          })
          // Se obtiene el ultimo dia programado y se crea un objeto Date() a partir del día
          const ultimoDiaProgramado =
            fechasProgramadas[fechasProgramadas.length - 1]
          const [dia, mes, anio] = ultimoDiaProgramado.split('-')
          const fechaUltimaProgramada = new Date(anio, mes - 1, dia)

          // Si la fecha actual es mayor a la última fecha programada, se desactiva la ruta
          if (fechaActual > fechaUltimaProgramada) {
            await editarDocumento(ruta.id, { ...ruta, activo: false })
          }
        }
      }
    } catch (error) {
      toast.error('Error al desactivar rutas vencidas')
      console.error(error)
    }
  }

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
