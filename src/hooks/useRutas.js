import { useState, useEffect, useRef } from 'react'

import {
  collection,
  onSnapshot,
  getDoc,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  where,
  query,
  and,
  or,
  serverTimestamp,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore'
import { toast } from 'react-toastify'
import { db } from '../firebaseApp'
import { useAuth } from '../contexts/AuthContext'

export default function useRutas(uidUsuario = '') {
  const [rutas, setRutas] = useState([])
  const [rutasPorFecha, setRutasPorFecha] = useState([])
  const [cargando, setCargando] = useState(true)
  const unsubscribeRef = useRef(null)
  const { isAuthenticated } = useAuth()

  // Función para obtener las rutas vigentes de un usuario y escuchar cambios en tiempo real
  const obtenerRutasVigentes = () => {
    setCargando(true)

    try {
      const rutasRef = collection(db, 'rutas')
      // Obtener la fecha del dia actual a medianoche
      const fechaInicio = Timestamp.fromDate(
        new Date(new Date().setHours(0, 0, 0, 0))
      )

      const fechaFin = Timestamp.fromDate(
        new Date(new Date().setDate(new Date().getDate() + 6))
      )

      const q = query(
        rutasRef,
        and(
          where('fecha', '>=', fechaInicio),
          where('fecha', '<=', fechaFin),
          or(
            where('uidUsuario', '==', uidUsuario),
            where('uidCoordinadora', '==', uidUsuario)
          )
        )
      )

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const rutas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRutas(rutas)
          setCargando(false)
        },
        (error) => {
          toast.error(`{Error al obtener las rutas:\n${error.message}`)
          console.error('Error al obtener las rutas:', error)
          setCargando(false)
        }
      )

      // Devolver la función para desuscribirse de los cambios
      return () => unsubscribe()
    } catch (error) {
      toast.error(`Error al obtener las rutas:\n${error.message}`)
      console.error('Error al obtener las rutas:', error)
    } finally {
      setCargando(false)
    }
  }

  // Función para crear un documento de ruta en Firestore
  const crearRuta = async (datos, idRuta = null) => {
    setCargando(true)
    try {
      let documentRef

      // Verificar si se proporcionó un idRuta
      if (idRuta) {
        // Si se proporciona un idRuta, verificar si ya existe un documento con ese ID
        const docSnap = await getDoc(doc(db, 'rutas', idRuta))
        if (docSnap.exists()) {
          throw new Error(`Ya existe la ruta '${idRuta}'`)
        }
        // Si no existe, usar el idRuta proporcionado
        documentRef = doc(db, 'rutas', idRuta)
      } else {
        // Si no se proporciona un idRuta, Firestore generará uno automáticamente
        documentRef = await addDoc(collection(db, 'rutas'), datos)
      }

      // Guardar los datos en Firestore
      await setDoc(documentRef, datos)
    } catch (error) {
      // Manejar errores mostrando un mensaje de error
      toast.error(error.message || 'Error al agregar el documento ruta')
      console.error('Error al agregar el documento ruta:\n', error)
      throw error
    } finally {
      // Establecer el estado de carga en falso después de completar la operación
      setCargando(false)
    }
  }

  // Función para actualizar un documento de ruta en Firestore
  const editarRuta = async (idRuta, nuevosDatos) => {
    setCargando(true)
    try {
      const documentRef = doc(db, 'rutas', idRuta)

      // Agregar los datos actualizados al documento en Firestore sin sobrescribir los datos existentes
      await updateDoc(documentRef, nuevosDatos)
    } catch (error) {
      toast.error(`Error al actualizar la ruta ${idRuta}`)
      console.error('Error al actualizar el documento:', error)
    } finally {
      setCargando(false)
    }
  }

  // Funcion para eliminar un documento de ruta en Firestore
  const eliminarRuta = async (idRuta) => {
    setCargando(true)
    try {
      const documentRef = doc(db, 'rutas', idRuta)

      // Eliminar el documento de Firestore
      await deleteDoc(documentRef)
    } catch (error) {
      toast.error(`Error al eliminar la ruta ${idRuta}`)
      console.error('Error al eliminar el documento:', error)
    } finally {
      setCargando(false)
    }
  }

  // Función para marcar un fichaje de ingreso o salida en una ruta
  const marcarFichaje = async (ruta, almacen, tipo) => {
    try {
      if (['ingreso', 'salida'].includes(tipo) === false) {
        throw new Error(`Tipo de fichaje no permitido: '${tipo}'`)
      }

      const geo = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = geo.coords

      const novedad = prompt(`Ingrese la novedad de ${tipo} o pulse aceptar`)

      if (novedad === null) {
        return
      }

      await editarRuta(ruta.id, {
        [`almacenes.${almacen}`]: {
          ...ruta.almacenes[almacen],
          [tipo === 'ingreso' ? 'horaIngreso' : 'horaSalida']:
            serverTimestamp(),
          [tipo === 'ingreso' ? 'ubicacionIngreso' : 'ubicacionSalida']:
            new GeoPoint(latitude, longitude),
          [tipo === 'ingreso' ? 'novedadIngreso' : 'novedadSalida']: novedad,
        },
      })
    } catch (error) {
      toast.error(error.message)
      console.error(error)
    }
  }

  // Función para marcar inicio y fin del tiempo de almuerzo
  const marcarAlmuerzo = async (ruta, tipo) => {
    try {
      if (['inicio', 'fin'].includes(tipo) === false) {
        throw new Error(`Tipo de almuerzo no permitido: '${tipo}'`)
      }

      const hora = serverTimestamp()

      await editarRuta(ruta.id, {
        [`hora${tipo === 'inicio' ? 'Inicio' : 'Fin'}Almuerzo`]: hora,
      })
    } catch (error) {
      toast.error(error.message)
      console.error(error)
    }
  }

  // Función para filtrar las rutas por fecha y escuchar cambios en tiempo real
  const filtrarRutasPorFecha = async (
    fechaInicio,
    fechaFin = null,
    uidUsuario = null,
    uidCoordinadora = null
  ) => {
    if (!isAuthenticated) return
    if (!fechaInicio) return

    setCargando(true)
    try {
      if (!(fechaInicio instanceof Date)) {
        throw new Error('Fecha inválida')
      }

      if (!fechaFin) fechaFin = fechaInicio

      const fDesde = Timestamp.fromDate(
        new Date(fechaInicio.setHours(0, 0, 0, 0))
      )
      const fHasta = Timestamp.fromDate(
        new Date(fechaFin.setHours(23, 59, 59, 999))
      )

      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      const rutasRef = collection(db, 'rutas')
      let q = query(
        rutasRef,
        where('fecha', '>=', fDesde),
        where('fecha', '<=', fHasta)
      )

      if (uidUsuario) q = query(q, where('uidUsuario', '==', uidUsuario))
      if (uidCoordinadora)
        q = query(q, where('uidCoordinadora', '==', uidCoordinadora))

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          // Si se desautentica justo en medio del snapshot
          if (!isAuthenticated) return

          const rutas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRutasPorFecha(rutas)
          setCargando(false)
        },
        (error) => {
          if (isAuthenticated) {
            toast.error(
              `Error al filtrar las rutas por fecha:\n${error.message}`
            )
            console.error('Error al filtrar las rutas por fecha:', error)
          }
          setCargando(false)
        }
      )

      unsubscribeRef.current = unsubscribe
    } catch (error) {
      if (isAuthenticated) {
        toast.error(`Error al filtrar las rutas por fecha:\n${error.message}`)
        console.error('Error al filtrar las rutas por fecha:', error)
      }
      setCargando(false)
    }
  }

  useEffect(() => {
    const unsubscribe = obtenerRutasVigentes()
    // Limpiar la suscripción cuando el componente se desmonte o el usuario cambie
    return () => unsubscribe && unsubscribe()

    // eslint-disable-next-line
  }, [uidUsuario])

  return {
    cargando,
    rutas,
    rutasPorFecha,
    editarRuta,
    crearRuta,
    eliminarRuta,
    marcarFichaje,
    marcarAlmuerzo,
    filtrarRutasPorFecha,
  }
}
