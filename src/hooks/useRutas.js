import { serverTimestamp, GeoPoint } from 'firebase/firestore'
import { toast } from 'react-toastify'
import useFirestore from './useFirestore'

function useRutas(activo = null) {
  const {
    datos: rutas,
    cargando: cargandoRutas,
    editarDocumento,
    agregarDocumento,
  } = useFirestore('rutas', activo)

  const marcarFichaje = async (ruta, almacen, tipo) => {
    try {
      if (['ingreso', 'salida'].includes(tipo) === false) {
        throw new Error('Tipo de fichaje no permitido')
      }

      const geo = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = geo.coords

      const novedad = prompt(`Ingrese la novedad de ${tipo} o pulse aceptar`)

      if (novedad === null) {
        return
      }

      await editarDocumento(ruta.id, {
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

  return {
    datos: rutas,
    marcarFichaje,
    crearRuta: agregarDocumento,
    cargandoRutas,
  }
}

export default useRutas
