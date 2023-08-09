/* Componentes */
import { useEffect, useState } from 'react'
import AcordionRutas from '../components/rutas/AcordionRutas'

/* Hooks */
import useRutas from '../hooks/useRutas'

function Rutas() {
  const { datos: rutas } = useRutas()
  const [rutasActivas, setRutasActivas] = useState([])

  useEffect(() => {
    setRutasActivas(rutas.filter((ruta) => ruta.activo === true))
  }, [rutas])

  return (
    <>
      <div className='mx-1 mx-sm-2 mx-md-5'>
        <h1 className='text-center'>Rutas Programadas</h1>
        <br />
        <AcordionRutas rutas={rutasActivas} />
      </div>
    </>
  )
}

export default Rutas
