/* Componentes */
import Cargando from '../components/Cargando'
import AdminRutas from '../components/rutas/AdminRutas'

/* Hooks */
import useRutas from '../hooks/useRutas'

import { useAuth } from '../contexts/AuthContext'

/* Imagenes */
import imgRutaCompletada from '../static/assets/img/ruta-completada.png'
import logoIngresar from '../static/assets/img/logo-entrar.png'
import logoSalir from '../static/assets/img/logo-salir.png'
import xCalendario from '../static/assets/img/xcalendario.png'

function Rutas() {
  const { currentUser, userData } = useAuth()
  const {
    rutas,
    cargando: cargandoRutas,
    marcarFichaje,
    marcarAlmuerzo,
  } = useRutas(currentUser.uid)

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

    const enAlmuerzo =
      ruta.horaInicioAlmuerzo && !ruta.horaFinAlmuerzo ? true : false

    if ([null, undefined, ''].includes(visita.horaIngreso)) {
      return (
        <button
          className='list-group-item list-group-item-action d-flex justify-content-between align-items-center fw-bold'
          onClick={() => marcarFichaje(ruta, almacen, 'ingreso')}
          key={`${ruta.id}-${almacen}`}
          disabled={enAlmuerzo}
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
          disabled={enAlmuerzo}
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

  return (
    <>
      <div className='mx-1 mx-sm-2 mx-md-5'>
        <h1 className='text-center h2 mb-3'>HOJA DE RUTAS</h1>
        {userData?.roles.includes('admin') ? (
          <AdminRutas />
        ) : cargandoRutas ? (
          <Cargando />
        ) : rutas.length === 0 ? (
          <div className='alert alert-warning text-center' role='alert'>
            <i className='fas fa-exclamation-triangle fa-2x'></i>
            <h4 className='alert-heading'>¡No tienes rutas programadas!</h4>
            <p>
              Tu coordinadora no ha programado ninguna ruta para el día,
              aprovecha para descansar y recargar energías.
            </p>
          </div>
        ) : (
          <div className='row m-0 justify-content-center align-items-center'>
            {rutas.map((ruta) => {
              if (ruta === rutas[0]) {
                return (
                  <div
                    className='row col-12 justify-content-center'
                    key={ruta.id}
                  >
                    <div
                      className='col-11 col-sm-7 col-md-6 col-lg-4 col-xl-3 col-xxl-2 p-0'
                      key={ruta.id}
                    >
                      <div className='card border-dark mb-4'>
                        <div className='card-header text-bg-primary text-center border-0'>
                          <h5 className='m-0'>
                            <i className='far fa-calendar me-1 fs-3'></i>
                            <br />
                            {ruta.fecha.toDate().toLocaleDateString('es-ES', {
                              weekday: 'long',
                            })}
                            <br />
                            {ruta.fecha.toDate().toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'numeric',
                              year: 'numeric',
                            })}
                          </h5>
                        </div>

                        {!ruta.horaFinAlmuerzo ? (
                          !ruta.horaInicioAlmuerzo ? (
                            <div className='card-body text-center text-white bg-primary p-1'>
                              <button
                                className='fw-bold p-1 text-warning-emphasis bg-warning-subtle border border-warning rounded-3'
                                onClick={() => marcarAlmuerzo(ruta, 'inicio')}
                              >
                                <i
                                  className='fas fa-burger'
                                  style={{ width: '32px', fontSize: '1.2rem' }}
                                ></i>
                                SALIR A ALMORZAR
                              </button>
                            </div>
                          ) : (
                            <div className='card-body text-center text-white bg-primary p-1'>
                              <button
                                className='fw-bold p-1 text-success-emphasis bg-primary-subtle border border-primary-subtle rounded-3'
                                onClick={() => marcarAlmuerzo(ruta, 'fin')}
                              >
                                <i
                                  className='fas fa-mug-hot'
                                  style={{ width: '32px', fontSize: '1.2rem' }}
                                ></i>
                                REGRESAR DE ALMUERZO
                              </button>
                            </div>
                          )
                        ) : null}

                        <div className='list-group list-group-flush'>
                          {Object.entries(ruta.almacenes)
                            .sort(([almacenA], [almacenB]) =>
                              almacenA.localeCompare(almacenB)
                            )
                            .map(([almacen, visita]) =>
                              renderButton(ruta, almacen, visita)
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div
                    className='col-11 col-sm-7 col-md-6 col-lg-4 col-xl-3 col-xxl-2'
                    key={ruta.id}
                  >
                    <div className='card border-dark mb-4'>
                      <div className='card-header text-bg-secondary text-center'>
                        <h5 className='m-0'>
                          <i className='far fa-calendar me-1 fs-3'></i>
                          <br />
                          {ruta.fecha.toDate().toLocaleDateString('es-ES', {
                            weekday: 'long',
                          })}
                          <br />
                          {ruta.fecha.toDate().toLocaleDateString('es-ES', {
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
                        {Object.entries(ruta.almacenes).map(
                          ([almacen, visita]) =>
                            renderButton(ruta, almacen, visita)
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Rutas
