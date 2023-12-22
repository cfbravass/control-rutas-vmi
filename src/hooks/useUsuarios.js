import useFirestore from './useFirestore'

function useUsuarios() {
  const { datos, cargando } = useFirestore('usuarios')

  return { datos, cargando }
}

export default useUsuarios
