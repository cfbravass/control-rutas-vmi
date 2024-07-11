import { useEffect, useState } from 'react'

/* Componentes */
import Cargando from '../components/Cargando'

/* Hooks */
import useRutas from '../hooks/useRutas'

/* Imagenes */
import imgRutaCompletada from '../static/assets/img/ruta-completada.png'
import logoIngresar from '../static/assets/img/logo-entrar.png'
import logoSalir from '../static/assets/img/logo-salir.png'
import xCalendario from '../static/assets/img/xcalendario.png'

function Rutas() {
  const [rutasVigentes, setRutasVigentes] = useState([])
  const { datos: rutas, marcarFichaje, cargandoRutas } = useRutas()

  const renderButton = (ruta, almacen, visita) => {
    /* Validar si la ruta corresponde a la fecha actual y renderizar botones */
    if (
      ruta.fecha.toDate().setHours(0, 0, 0, 0) !==
      new Date().setHours(0, 0, 0, 0)
    ) {
      return (
        <button
          className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'
          disabled
          key={`${ruta.id}-${almacen}`}
        >
          {almacen}
          <img
            src={xCalendario}
            alt='xCalendario'
            className='img-fluid'
            width={30}
          />
        </button>
      )
    }

    if ([null, undefined, ''].includes(visita.horaIngreso)) {
      return (
        <button
          className='list-group-item list-group-item-action d-flex justify-content-between align-items-center fw-bold'
          onClick={() => marcarFichaje(ruta, almacen, 'ingreso')}
          key={`${ruta.id}-${almacen}`}
        >
          {almacen}
          <img
            src={logoIngresar}
            alt='logoIngresar'
            className='img-fluid'
            width={30}
          />
        </button>
      )
    } else if ([null, undefined, ''].includes(visita.horaSalida)) {
      return (
        <button
          className='list-group-item list-group-item-action d-flex justify-content-between align-items-center fw-bold'
          onClick={() => marcarFichaje(ruta, almacen, 'salida')}
          key={`${ruta.id}-${almacen}`}
        >
          {almacen}
          <img
            src={logoSalir}
            alt='logoSalir'
            className='img-fluid'
            width={30}
          />
        </button>
      )
    } else {
      return (
        <button
          className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'
          disabled
          key={`${ruta.id}-${almacen}`}
        >
          {almacen}
          <img
            src={imgRutaCompletada}
            alt='imgRutaCompletada'
            className='img-fluid'
            width={30}
          />
        </button>
      )
    }
  }

  useEffect(() => {
    const rutasVigentes = rutas
      .filter((ruta) => {
        const fechaRuta = ruta.fecha.toDate()
        const fechaActual = new Date().setHours(0, 0, 0, 0)
        return fechaRuta >= fechaActual
      })
      .sort((a, b) => a.fecha.toDate() - b.fecha.toDate())

    setRutasVigentes(rutasVigentes)
  }, [rutas])

  return (
    <>
      <div className='mx-1 mx-sm-2 mx-md-5'>
        <h1 className='text-center'>MI HOJA DE RUTAS</h1>
        <br />
        {cargandoRutas ? (
          <Cargando />
        ) : (
          <div className='row m-0 justify-content-center align-items-center'>
            {rutasVigentes.map((ruta) => (
              <div
                className='col-11 col-sm-7 col-md-6 col-lg-4 col-xl-3 col-xxl-2'
                key={ruta.id}
              >
                <div className='card border-dark mb-4'>
                  <div className='card-header text-bg-primary text-center'>
                    <h5 className='m-0'>
                      <i className='far fa-calendar me-1 fs-3'></i>{' '}
                      {ruta.fecha.toDate().toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                      })}
                    </h5>
                  </div>
                  <div className='card-body d-none'>
                    <h5 className='card-title'>Titulo</h5>
                    <p className='card-text'>Descripción</p>
                  </div>

                  <div className='list-group list-group-flush'>
                    {Object.entries(ruta.almacenes).map(([almacen, visita]) =>
                      renderButton(ruta, almacen, visita)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Rutas
