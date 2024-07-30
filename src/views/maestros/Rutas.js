import { addDays, format } from 'date-fns'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import React, { useState, useEffect } from 'react'
import { Timestamp } from 'firebase/firestore'

import useRutas from '../../hooks/useRutas'
import { useUsuarios } from '../../contexts/UsuariosContext'
import { useAlmacenes } from '../../contexts/AlmacenesContext'
import { useAuth } from '../../contexts/AuthContext'

function MaestroRutas() {
  const [almacenesValidos, setAlmacenesValidos] = useState({})
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(startDate)
  const [formularioValido, setFormularioValido] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState('')
  const [selectedValues, setSelectedValues] = useState({})
  const [usuarioValido, setUsuarioValido] = useState(false)
  const [rutasExistentes, setRutasExistentes] = useState({})
  const { rutasPorFecha, filtrarRutasPorFecha, crearRuta, editarRuta } =
    useRutas()
  const { currentUser } = useAuth()
  const { datos: almacenesActivos } = useAlmacenes(true)
  const { datos: usuarios } = useUsuarios()

  useEffect(() => {
    const almacenesValidosArray = Object.values(almacenesValidos)
    const todosVacios = almacenesValidosArray.every(
      (almacenValido) => almacenValido === undefined
    )

    const esFormularioValido =
      !todosVacios &&
      almacenesValidosArray.every(
        (almacenValido) => almacenValido === true || almacenValido === undefined
      )

    setFormularioValido(esFormularioValido)
  }, [almacenesValidos])

  useEffect(() => {
    // Funcion para validar si ya existe una ruta para la fecha seleccionada
    const validarFechas = async () => {
      if (!selectedUsuario || !startDate || !endDate) return null

      const uidUsuario = usuarios.find((u) => u.nombre === selectedUsuario)?.uid
      if (!uidUsuario) return null

      await filtrarRutasPorFecha(startDate, endDate, uidUsuario)
    }

    validarFechas()

    // eslint-disable-next-line
  }, [selectedUsuario, startDate, endDate])

  useEffect(() => {
    const rutasExistentes = {}

    rutasPorFecha.forEach((ruta) => {
      const fecha = format(ruta.fecha.toDate(), 'dd-MM-yyyy')
      rutasExistentes[fecha] = ruta
    })

    setRutasExistentes(rutasExistentes)
  }, [rutasPorFecha])

  const resetForm = () => {
    setSelectedUsuario('')
    setSelectedValues({})
    setUsuarioValido(false)
    setAlmacenesValidos({})
    setFormularioValido(false)
  }

  const handleDateChange = (dates) => {
    const [start, end] = dates

    // Mantén startDate siempre actualizado
    setStartDate(start || new Date())

    // Actualiza endDate solo si se selecciona un rango
    setEndDate(end || null)
  }

  const handleUsuarioChange = (e) => {
    const nombreUsuario = e.target.value.toUpperCase()
    setSelectedUsuario(nombreUsuario)
    setSelectedValues({})
    setAlmacenesValidos({})
    setUsuarioValido(
      usuarios
        .filter((u) => u.activo && u.uidCoordinadora === currentUser.uid)
        .some((usuario) => usuario.nombre === nombreUsuario)
    )
    setFormularioValido(false)
  }

  const handleAlmacenChange = (e, fecha, almacenIndex) => {
    const selectedValue = e.target.value.toUpperCase()
    const key = `${fecha}_almacen${almacenIndex}`

    setSelectedValues((prevValues) => {
      if (selectedValue === '') {
        const updatedValues = { ...prevValues }
        delete updatedValues[key]
        return updatedValues
      }

      // Si se elimina un almacen, se eliminan los almacenes siguientes
      if (almacenIndex === 1) {
        const updatedValues = { ...prevValues }
        delete updatedValues[`${fecha}_almacen2`]
        delete updatedValues[`${fecha}_almacen3`]
        return {
          ...updatedValues,
          [key]: selectedValue,
        }
      } else if (almacenIndex === 2) {
        const updatedValues = { ...prevValues }
        delete updatedValues[`${fecha}_almacen3`]
        return {
          ...updatedValues,
          [key]: selectedValue,
        }
      }

      return {
        ...prevValues,
        [key]: selectedValue,
      }
    })

    setAlmacenesValidos((prevValidos) => ({
      ...prevValidos,
      [key]: almacenesActivos.some(
        (almacen) =>
          almacen.nombre === selectedValue &&
          almacen.activo &&
          almacen.uidCoordinadora === currentUser.uid
      ),
    }))

    if (selectedValue === '') {
      setAlmacenesValidos((prevValidos) => {
        const updatedValidos = { ...prevValidos }
        delete updatedValidos[key]
        return updatedValidos
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formularioValido) {
      return null
    }

    if (Object.keys(selectedValues).length === 0) {
      toast.error('No hay datos para guardar', {
        position: toast.POSITION.BOTTOM_CENTER,
        autoClose: 3000,
      })
      return null
    }

    // Crear toast cargando mientras se procesa la petición
    const toastId = toast.loading('Asignando las rutas...', {
      position: toast.POSITION.BOTTOM_CENTER,
    })

    const nombreUsuario = selectedUsuario
    const uidUsuario = usuarios.find((u) => u.nombre === selectedUsuario)?.uid

    // Objeto para agrupar por fecha
    const agrupacionPorFecha = {}
    const grupoEditado = {}

    for (const [key, value] of Object.entries(selectedValues)) {
      let [fechaStr] = key.split('_')
      const editar = rutasExistentes[fechaStr] ? true : false

      // Si se está editando, se eliminan los almacenes actuales y se agregan los nuevos datos al grupo editado
      if (editar) {
        const datosRuta = rutasExistentes[fechaStr]

        const { id: idRuta, almacenes, ...restoDatos } = datosRuta

        if (!grupoEditado[idRuta]) {
          grupoEditado[idRuta] = {
            ...restoDatos,
            almacenes: {
              [value]: {
                idAlmacen: almacenesActivos.find(
                  (almacen) => almacen.nombre === value
                ).id,
              },
            },
          }
        } else {
          grupoEditado[idRuta].almacenes[value] = {
            idAlmacen: almacenesActivos.find(
              (almacen) => almacen.nombre === value
            ).id,
          }
        }
      } else if (!agrupacionPorFecha[fechaStr]) {
        const fechaTimeStamp = Timestamp.fromDate(
          new Date(
            fechaStr.split('-')[2],
            fechaStr.split('-')[1] - 1,
            fechaStr.split('-')[0]
          )
        )
        agrupacionPorFecha[fechaStr] = {
          nombreUsuario,
          uidUsuario,
          uidCoordinadora: currentUser.uid,
          fecha: fechaTimeStamp,
          almacenes: {
            [value]: {
              idAlmacen: almacenesActivos.find(
                (almacen) => almacen.nombre === value
              ).id,
            },
          },
        }
      } else {
        // Si la fecha ya fue agregada, simplemente añadimos el almacen al map existente
        agrupacionPorFecha[fechaStr].almacenes[value] = {
          idAlmacen: almacenesActivos.find(
            (almacen) => almacen.nombre === value
          ).id,
        }
      }
    }

    let promesasDeCreacion = []

    // Si hay rutas a editar, se crean las promesas de edición
    for (const [idRuta, datosRuta] of Object.entries(grupoEditado)) {
      promesasDeCreacion.push(editarRuta(idRuta.split('|')[0], datosRuta))
    }

    for (const datosRuta of Object.values(agrupacionPorFecha)) {
      // En este punto, cada `datosRuta` ya tiene su `almacenes` consolidado por fecha
      promesasDeCreacion.push(crearRuta(datosRuta))
    }

    await Promise.allSettled(promesasDeCreacion)
      .then((resultados) => {
        // Contadores para éxito y fallos
        const exitos = resultados.filter(
          (resultado) => resultado.status === 'fulfilled'
        ).length
        const fallos = resultados.length - exitos // Cualquier resultado no 'fulfilled' se considera un fallo

        // Lógica para decidir qué mensaje mostrar
        if (exitos === resultados.length) {
          // Todos los intentos fueron exitosos
          toast.update(toastId, {
            render: 'Rutas asignadas correctamente',
            type: toast.TYPE.SUCCESS,
            isLoading: false,
            autoClose: 3000,
          })
        } else if (fallos === resultados.length) {
          // Todos los intentos fallaron
          toast.update(toastId, {
            render: 'No se pudieron asignar las rutas',
            type: toast.TYPE.ERROR,
            isLoading: false,
            autoClose: 3000,
          })
        } else {
          // Algunos intentos fueron exitosos y otros fallaron
          toast.update(toastId, {
            render: `Se asignaron ${exitos} rutas correctamente, pero ${fallos} no se pudieron asignar.`,
            type: toast.TYPE.WARNING,
            isLoading: false,
            autoClose: 5000,
          })
        }
      })
      .finally(resetForm)
  }

  useEffect(() => {
    // Cada cambio en rutasExistentes dispara la validación de almacenes y establece el estado de los valores seleccionados
    const validarAlmacenes = () => {
      const almacenesValidos = {}
      const selectedValues = {}

      // recorrer las rutas existentes y establecer los almacenes válidos
      for (const [fechaStr, ruta] of Object.entries(rutasExistentes)) {
        if (!ruta.almacenes) continue

        const almacenes = Object.keys(ruta.almacenes)

        for (const [index, almacen] of almacenes.entries()) {
          const key = `${fechaStr}_almacen${index + 1}`
          const almacenValido = almacenesActivos.some(
            (a) => a.nombre === almacen
          )

          almacenesValidos[key] = almacenValido
          selectedValues[key] = almacen
        }
      }

      setAlmacenesValidos(almacenesValidos)
      setSelectedValues(selectedValues)
    }

    validarAlmacenes()

    // eslint-disable-next-line
  }, [rutasExistentes])

  const renderFechaSelectors = () => {
    const fechaSelectors = []
    let currentDate = startDate

    while (currentDate <= endDate) {
      const formattedDate = format(currentDate, 'dd-MM-yyyy')

      const almacen1Key = `${formattedDate}_almacen1`
      const almacen2Key = `${formattedDate}_almacen2`
      const almacen3Key = `${formattedDate}_almacen3`

      const almacen1Value = selectedValues[almacen1Key] || ''
      const almacen2Value = selectedValues[almacen2Key] || ''
      const almacen3Value = selectedValues[almacen3Key] || ''

      // true o false si ya existe una ruta para la fecha seleccionada
      const rutaExistente = rutasExistentes[formattedDate]

      const fechaSelector = (
        <div
          key={formattedDate}
          id={formattedDate}
          className={`col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 text-center mb-3 border rounded py-1 px-1 ${
            rutaExistente ? 'bg-warning' : 'bg-light'
          }`}
        >
          <div>{formattedDate}</div>
          {selectedUsuario && (
            <>
              <div>
                <input
                  className={`form-control my-2 ${
                    almacenesValidos[`${formattedDate}_almacen1`] === true
                      ? 'is-valid'
                      : almacenesValidos[`${formattedDate}_almacen1`] === false
                      ? 'is-invalid'
                      : ''
                  }`}
                  list={`opcionesAlmacen-${formattedDate}-1`}
                  id={`almacen-${formattedDate}-1`}
                  placeholder='...'
                  value={almacen1Value}
                  onChange={(e) => handleAlmacenChange(e, formattedDate, 1)}
                />
                <datalist id={`opcionesAlmacen-${formattedDate}-1`}>
                  {almacenesActivos
                    .filter(
                      (almacen) =>
                        almacen.activo &&
                        almacen.uidCoordinadora === currentUser.uid
                    )
                    .map((almacen) => (
                      <option key={almacen.id} value={almacen.nombre} />
                    ))}
                </datalist>
              </div>

              {almacenesActivos
                .filter(
                  (almacen) =>
                    almacen.activo &&
                    almacen.uidCoordinadora === currentUser.uid
                )
                .some((almacen) => almacen.nombre === almacen1Value) && (
                <>
                  <div>
                    <input
                      className={`form-control my-2 ${
                        almacenesValidos[`${formattedDate}_almacen2`] === true
                          ? 'is-valid'
                          : almacenesValidos[`${formattedDate}_almacen2`] ===
                            false
                          ? 'is-invalid'
                          : ''
                      }`}
                      list={`opcionesAlmacen-${formattedDate}-2`}
                      id={`almacen-${formattedDate}-2`}
                      placeholder='...'
                      value={almacen2Value}
                      onChange={(e) => handleAlmacenChange(e, formattedDate, 2)}
                    />
                    <datalist id={`opcionesAlmacen-${formattedDate}-2`}>
                      {almacenesActivos
                        .filter(
                          (almacen) =>
                            almacen.nombre !== almacen1Value &&
                            almacen.activo &&
                            almacen.uidCoordinadora === currentUser.uid
                        )
                        .map((almacen) => (
                          <option key={almacen.id} value={almacen.nombre} />
                        ))}
                    </datalist>
                  </div>

                  {almacenesActivos
                    .filter(
                      (almacen) =>
                        almacen.activo &&
                        almacen.uidCoordinadora === currentUser.uid
                    )
                    .some((almacen) => almacen.nombre === almacen2Value) && (
                    <div>
                      <input
                        className={`form-control my-2 ${
                          almacenesValidos[`${formattedDate}_almacen3`] === true
                            ? 'is-valid'
                            : almacenesValidos[`${formattedDate}_almacen3`] ===
                              false
                            ? 'is-invalid'
                            : ''
                        }`}
                        list={`opcionesAlmacen-${formattedDate}-3`}
                        id={`almacen-${formattedDate}-3`}
                        placeholder='...'
                        value={almacen3Value}
                        onChange={(e) =>
                          handleAlmacenChange(e, formattedDate, 3)
                        }
                      />
                      <datalist id={`opcionesAlmacen-${formattedDate}-3`}>
                        {almacenesActivos
                          .filter(
                            (almacen) =>
                              ![almacen1Value, almacen2Value].includes(
                                almacen.nombre
                              ) &&
                              almacen.activo &&
                              almacen.uidCoordinadora === currentUser.uid
                          )
                          .map((almacen) => (
                            <option key={almacen.id} value={almacen.nombre} />
                          ))}
                      </datalist>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )

      fechaSelectors.push(fechaSelector)

      currentDate = addDays(currentDate, 1)
    }

    return fechaSelectors
  }

  return (
    <div className='mx-2'>
      <h1 className='text-center'>Maestro de Rutas</h1>
      <br />
      <section className='rounded border p-2 mb-3'>
        <h5 className='text-center'>Crear nueva hoja de rutas</h5>
        <form onSubmit={handleSubmit} className='needs-validation' noValidate>
          <div className='input-group mb-1'>
            <label htmlFor='listaUsuarios' className='input-group-text'>
              <i className='fas fa-id-card-clip me-1'></i> Promotora:
            </label>
            <input
              className={`form-control rounded-end ${
                usuarioValido ? 'is-valid' : 'is-invalid'
              }`}
              list='datalistOptions'
              id='listaUsuarios'
              placeholder='Buscar...'
              onChange={handleUsuarioChange}
              value={selectedUsuario}
              name='nombreUsuario'
              required
            />
            <datalist id='datalistOptions'>
              {usuarios
                .filter(
                  (u) => u.activo && u.uidCoordinadora === currentUser.uid
                )
                .map((usuario) => (
                  <option key={usuario.uid} value={usuario.nombre} />
                ))}
            </datalist>
          </div>
          <div className='text-center mb-1'>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              className='text-center'
            />
          </div>

          {usuarios.find(
            (u) =>
              u.nombre === selectedUsuario &&
              u.activo &&
              u.uidCoordinadora === currentUser.uid
          ) ? (
            <>
              <div className='row px-3 d-flex justify-content-center'>
                {renderFechaSelectors()}
              </div>
              <div className='text-center mb-2'>
                <button
                  type='submit'
                  className='btn btn-outline-dark'
                  disabled={!formularioValido}
                >
                  <i className='fas fa-floppy-disk me-2'></i>
                  Guardar
                </button>
              </div>
            </>
          ) : (
            <div className='text-center px-5'>
              <p className='text-danger fa-bounce'>
                <i className='fas fa-exclamation-triangle me-2'></i>
                No ha seleccionado una promotora válida
              </p>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}

export default MaestroRutas
