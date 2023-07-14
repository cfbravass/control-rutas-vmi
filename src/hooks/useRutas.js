import { useState, useEffect } from 'react'

import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  GeoPoint,
} from 'firebase/firestore'
import { db } from '../firebaseApp'
import { toast } from 'react-toastify'

import useAlmacenes from './useAlmacenes'

function useRutas() {
  const [rutas, setRutas] = useState([])
  const [cargandoRutas, setCargandoRutas] = useState(true)

  useEffect(() => {
    obtenerRutas()
    // Suscribirse a los cambios en la colección de rutas
    const unsubscribe = onSnapshot(collection(db, 'rutas'), (snapshot) => {
      const rutasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setRutas(rutasData)
    })

    // Devolver una función de limpieza para cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe()
  }, [])

  const obtenerRutas = async () => {
    setCargandoRutas(true)
    try {
      const rutasCollection = collection(db, 'rutas')
      const rutasSnapshot = await getDocs(rutasCollection)
      const rutasData = rutasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const rutasActivas = rutasData.filter((ruta) => ruta.activo === true)
      setRutas(rutasActivas)
    } catch (error) {
      toast.error('Error al obtener la lista de rutas', {
        position: 'bottom-center',
      })
      console.error(error)
    }
    setCargandoRutas(false)
  }

  const marcarLlegada = async (ruta, fecha, nombreAlmacen) => {
    const rutaDocRef = doc(db, 'rutas', ruta.id)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords

      const almacenRef = [`locaciones.${fecha}.${nombreAlmacen}`]

      await updateDoc(rutaDocRef, {
        [`${almacenRef}.fechaIngreso`]: serverTimestamp(),
        [`${almacenRef}.ubicacionIngreso`]: new GeoPoint(latitude, longitude),
      })

      await obtenerRutas()
    } catch (error) {
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

      await obtenerRutas()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const crearRuta = async (nuevaRuta) => {
    const rutaRef = await addDoc(collection(db, 'rutas'), nuevaRuta)
    const nuevaRutaData = {
      id: rutaRef.id,
      ...nuevaRuta,
    }
    setRutas((prevRutas) => [...prevRutas, nuevaRutaData])
  }

  return { rutas, marcarLlegada, marcarSalida, crearRuta, cargandoRutas }
}

export default useRutas
