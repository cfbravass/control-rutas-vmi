import { useState, useEffect } from 'react'

import {
  collection,
  onSnapshot,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  deleteDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebaseApp'
import { toast } from 'react-toastify'

const useFirestore = (collectionName, activo = null) => {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)

  // Función para obtener los documentos de una colección
  const obtenerDocumentos = async () => {
    try {
      setCargando(true)

      let query
      if (activo !== null) {
        query = query(
          collection(db, collectionName),
          where('activo', '==', activo)
        )
      } else {
        query = collection(db, collectionName)
      }

      const querySnapshot = await getDocs(query)
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setDatos(documents)
    } catch (error) {
      toast.error(`Error al obtener los documentos de '${collectionName}'`)
      console.error('Error al obtener los documentos:', error)
    } finally {
      setCargando(false)
    }
  }

  // Función para agregar un nuevo documento a una colección
  const agregarDocumento = async (data, documentId = null) => {
    setCargando(true)
    try {
      let documentRef

      // Verificar si se proporcionó un documentId
      if (documentId) {
        // Si se proporciona un documentId, verificar si ya existe un documento con ese ID
        const docSnap = await getDoc(doc(db, collectionName, documentId))
        if (docSnap.exists()) {
          throw new Error(
            `El documento '${documentId}' ya existe en '${collectionName}'`
          )
        }
        // Si no existe, usar el documentId proporcionado
        documentRef = doc(db, collectionName, documentId)
      } else {
        // Si no se proporciona un documentId, Firestore generará uno automáticamente
        documentRef = await addDoc(collection(db, collectionName), data)
      }

      // Guardar los datos en Firestore
      await setDoc(documentRef, data)

      /* // Construir el objeto de documento con el ID y los datos proporcionados
      const document = {
        id: documentRef.id,
        ...data,
      }

      // Actualizar el estado de datos con el nuevo documento
      setDatos((prevData) => [...prevData, document]) */
    } catch (error) {
      // Manejar errores mostrando un mensaje de error
      toast.error(error.message || 'Error al agregar el documento')
      console.error('Error al agregar el documento:\n', error)
      throw error
    } finally {
      // Establecer el estado de carga en falso después de completar la operación
      setCargando(false)
    }
  }

  // Función para actualizar un documento en una colección
  const editarDocumento = async (documentId, updatedData) => {
    setCargando(true)
    try {
      const documentRef = doc(db, collectionName, documentId)
      await updateDoc(documentRef, updatedData)
      /* setDatos((prevData) =>
        prevData.map((doc) =>
          doc.id === documentId ? { id: doc.id, ...doc, ...updatedData } : doc
        )
      ) */
    } catch (error) {
      toast.error(
        `Error al actualizar el documento '${collectionName}/${documentId}'`
      )
      console.error('Error al actualizar el documento:', error)
    } finally {
      setCargando(false)
    }
  }

  // Función para eliminar un documento de una colección
  const eliminarDocumento = async (documentId) => {
    setCargando(true)
    try {
      const documentRef = doc(db, collectionName, documentId)
      await deleteDoc(documentRef)
      setDatos((prevData) => prevData.filter((doc) => doc.id !== documentId))
    } catch (error) {
      toast.error(
        `Error al eliminar el documento '${collectionName}/${documentId}'`
      )
      console.error('Error al eliminar el documento:', error)
    } finally {
      setCargando(true)
    }
  }

  // Suscripcion para actualizar datos en tiempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (querySnapshot) => {
        try {
          setCargando(true)

          let documents
          if (activo !== null) {
            documents = querySnapshot.docs
              .filter((doc) => doc.data().activo === activo)
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
          } else {
            documents = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          }

          setDatos(documents)
        } catch (error) {
          toast.error(
            `Error al obtener los documentos de '${collectionName}' en tiempo real`
          )
          console.error(
            'Error al obtener los documentos en tiempo real:',
            error
          )
        } finally {
          setCargando(false)
        }
      }
    )

    // Cancelar la suscripción cuando el componente se desmonte
    return () => {
      unsubscribe()
    }

    // eslint-disable-next-line
  }, [collectionName, activo])

  return {
    datos,
    cargando,
    obtenerDocumentos,
    agregarDocumento,
    editarDocumento,
    eliminarDocumento,
  }
}

export default useFirestore
