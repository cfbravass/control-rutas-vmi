import { useState, useEffect } from 'react'

import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  GeoPoint,
} from 'firebase/firestore'
import { db } from '../firebaseApp'
import { toast } from 'react-toastify'

function useRutas() {
  const [rutas, setRutas] = useState([])
  const [cargandoRutas, setCargandoRutas] = useState(true)

  useEffect(() => {
    const obtenerRutas = async () => {
      setCargandoRutas(true)
      try {
        const rutasCollection = collection(db, 'rutas')
        const rutasSnapshot = await getDocs(rutasCollection)
        const rutasData = rutasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRutas(rutasData)
      } catch (error) {
        toast.error('Error al obtener la lista de rutas', {
          position: 'bottom-center',
        })
        console.error(error)
      }
      setCargandoRutas(false)
    }

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

  const actualizarRutas = (rutaId, fecha, almacen, horaVisitaFormateada) => {
    setRutas((prevRutas) =>
      prevRutas.map((rutaData) => {
        if (rutaData.id === rutaId) {
          return {
            ...rutaData,
            locaciones: {
              ...rutaData.locaciones,
              [fecha]: {
                ...rutaData.locaciones[fecha],
                almacenesVisitados: {
                  ...rutaData.locaciones[fecha].almacenesVisitados,
                  [almacen]: {
                    ...rutaData.locaciones[fecha].almacenesVisitados[almacen],
                    horaVisita: horaVisitaFormateada,
                  },
                },
              },
            },
          }
        }
        return rutaData
      })
    )
  }

  const marcarLlegada = async (ruta, fecha, almacen) => {
    const rutaDocRef = doc(db, 'rutas', ruta.id)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords

      await updateDoc(rutaDocRef, {
        [`locaciones.${fecha}.almacenesVisitados.${almacen}`]: {
          horaVisita: serverTimestamp(),
          ubicacion: new GeoPoint(latitude, longitude),
        },
      })

      const rutaData = rutas.find((rutaData) => rutaData.id === ruta.id)
      const almacenesVisitados = rutaData.locaciones[fecha].almacenesVisitados
      const almacenData = almacenesVisitados[almacen]

      const horaVisitaFormateada = almacenData?.horaVisita
        ? almacenData.horaVisita.toDate().toLocaleString('es-ES')
        : null

      actualizarRutas(ruta.id, fecha, almacen, horaVisitaFormateada)
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

  return { rutas, marcarLlegada, crearRuta, cargandoRutas }
}

export default useRutas
