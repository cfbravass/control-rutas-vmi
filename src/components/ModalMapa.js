import { useAlmacenes } from '../contexts/AlmacenesContext'
import { useEffect, useState } from 'react'

import ContenedorMapa from './ContenedorMapa'
import { format } from 'date-fns'

export default function ModalMapa({ idModal, visita, ruta }) {
  const { obtenerAlmacen } = useAlmacenes()
  const [almacen, setAlmacen] = useState({})
  const [mostrarMapa, setMostrarMapa] = useState(false)

  useEffect(() => {
    const datos = obtenerAlmacen(visita.idAlmacen)
    setAlmacen(datos)

    // eslint-disable-next-line
  }, [visita.idAlmacen])

  return (
    <div
      className='modal'
      id={idModal}
      tabIndex='-1'
      aria-labelledby={`label${idModal}`}
      aria-hidden='true'
    >
      <div className='modal-dialog modal-dialog-centered modal-dialog-scrollable'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1
              className='modal-title fs-5 text-primary'
              id={`label${idModal}`}
            >
              {format(ruta.fecha.toDate(), 'yyyy-MM-dd')} | {ruta.nombreUsuario}
            </h1>
            <button
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            />
          </div>
          <div className='modal-body text-center pt-0'>
            <h5 className='modal-title'>
              {almacen.ciudad} - {almacen.nombre}
            </h5>

            <ul className='list-group list-group-horizontal mb-1'>
              <li className='list-group-item w-50 p-0'>
                Ingreso:{' '}
                {visita.horaIngreso?.toDate().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || '--:--'}
              </li>
              <li className='list-group-item w-50 p-0'>
                Salida:{' '}
                {visita.horaSalida?.toDate().toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || '--:--'}
              </li>
            </ul>
            {(visita.novedadIngreso || visita.novedadSalida) && (
              <ul className='list-group list-group-horizontal mb-1'>
                <li className='list-group-item w-50 p-0'>
                  {visita.novedadIngreso}
                </li>
                <li className='list-group-item w-50 p-0'>
                  {visita.novedadSalida}
                </li>
              </ul>
            )}

            <button
              className='btn btn-sm btn-primary my-2'
              onClick={() => setMostrarMapa(!mostrarMapa)}
            >
              {mostrarMapa ? 'Ocultar mapa' : 'Mostrar mapa'}
            </button>

            {mostrarMapa && (
              <>
                <ContenedorMapa almacen={almacen} visita={visita} />
                {/* DIV temporal para la facil asignacion de correctas ubicaciones de almacen */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ margin: 0, padding: 0 }}>
                    LAT: {visita?.ubicacionIngreso?.latitude}
                  </span>
                  <span
                    style={{ margin: 0, padding: 0, float: 'right', top: 0 }}
                  >
                    LNG: {visita?.ubicacionIngreso?.longitude}
                  </span>
                </div>
              </>
            )}

            {almacen.nota && (
              <div className='m-0 p-0'>
                <b>NOTAS DEL ALMACÉN</b>
                <p
                  dangerouslySetInnerHTML={{
                    __html: almacen.nota?.replace(/\\n/g, '<br>'),
                  }}
                ></p>
              </div>
            )}
          </div>
          <div className='modal-footer d-none'></div>
        </div>
      </div>
    </div>
  )
}
