import useFirestore from './useFirestore'

function useUsuarios(activo = null) {
  const { datos, cargando, editarDocumento } = useFirestore('usuarios', activo)

  return { datos, cargando, editarDocumento }
}

export default useUsuarios
