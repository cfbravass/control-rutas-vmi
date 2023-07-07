import { collection, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

import { db } from '../firebaseApp'

function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuariosCollection = collection(db, 'usuarios')
        const usuariosSnapshot = await getDocs(usuariosCollection)
        const usuariosData = usuariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setUsuarios(usuariosData)
      } catch (error) {
        toast.error('Error al obtener la lista de usuarios', {
          position: 'bottom-center',
        })
        console.error(error)
      }
    }

    obtenerUsuarios()
  }, [])

  return usuarios
}

export default useUsuarios
