/* Componentes */
import AcordionRutas from '../components/rutas/AcordionRutas'
import useAlmacenes from '../hooks/useAlmacenes'

/* Hooks */
import useRutas from '../hooks/useRutas'
import useUsuarios from '../hooks/useUsuarios'

function Rutas() {
  const {
    datos: rutasActivas,
    marcarLlegada,
    marcarSalida,
    cargandoRutas,
  } = useRutas(true)

  const { datos: usuarios } = useUsuarios()
  const { datos: almacenes } = useAlmacenes()

  return (
    <>
      <div className='mx-1 mx-sm-2 mx-md-5'>
        <h1 className='text-center'>Rutas Programadas</h1>
        <br />
        <AcordionRutas
          rutas={rutasActivas}
          marcarLlegada={marcarLlegada}
          marcarSalida={marcarSalida}
          cargandoRutas={cargandoRutas}
          usuarios={usuarios}
          almacenes={almacenes}
        />
      </div>
    </>
  )
}

export default Rutas
