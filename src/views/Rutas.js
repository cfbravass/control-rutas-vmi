/* Componentes */
import AcordionRutas from '../components/rutas/AcordionRutas'

/* Hooks */
import { useAlmacenes } from '../contexts/AlmacenesContext'
import { useUsuarios } from '../contexts/UsuariosContext'
import useRutas from '../hooks/useRutas'

function Rutas() {
  const {
    datos: rutasActivas,
    marcarLlegada,
    marcarSalida,
    cargandoRutas,
  } = useRutas(true)

  const { obtenerUsuariosActivos } = useUsuarios()
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
          usuarios={obtenerUsuariosActivos()}
          almacenes={almacenes}
        />
      </div>
    </>
  )
}

export default Rutas
