import { collection, getDocs } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

import { db } from '../firebaseApp'

function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true)

  useEffect(() => {
    const obtenerUsuarios = async () => {
      setCargandoUsuarios(true)
      try {
        const usuariosCollection = collection(db, 'usuarios')
        const usuariosSnapshot = await getDocs(usuariosCollection)
        const usuariosData = usuariosSnapshot.docs.map((doc) => ({
          ...doc.data(),
        }))
        setUsuarios(usuariosData)
      } catch (error) {
        toast.error('Error al obtener la lista de usuarios', {
          position: 'bottom-center',
        })
        console.error(error)
      }
      setCargandoUsuarios(false)
    }

    obtenerUsuarios()
  }, [])

  return { usuarios, cargandoUsuarios }
}

export default useUsuarios
