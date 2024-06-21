import { addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import React, { useState, useEffect } from 'react'
import { Timestamp } from 'firebase/firestore'

import useRutas from '../../hooks/useRutas'
import { useUsuarios } from '../../contexts/UsuariosContext'
import { useAlmacenes } from '../../contexts/AlmacenesContext'

function MaestroRutas() {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(startDate)

  const [almacenesValidos, setAlmacenesValidos] = useState({})
  const [formularioValido, setFormularioValido] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState('')
  const [selectedValues, setSelectedValues] = useState({})
  const [usuarioValido, setUsuarioValido] = useState(false)
  const { crearRuta } = useRutas(false)
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
        .filter((u) => u.activo)
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

      if (
        almacenIndex === 1 &&
        prevValues[`${fecha}_almacen2`] === selectedValue
      ) {
        const updatedValues = { ...prevValues }
        delete updatedValues[`${fecha}_almacen2`]
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
        (almacen) => almacen.nombre === selectedValue
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
      toast.warning('No hay datos para guardar')
      return null
    }

    const nombreUsuario = selectedUsuario
    const uidUsuario = usuarios.find((u) => u.nombre === selectedUsuario)?.uid

    // Objeto para agrupar por fecha
    const agrupacionPorFecha = {}

    for (const [key, value] of Object.entries(selectedValues)) {
      let [fecha] = key.split('_')

      fecha = new Date(fecha.split('-').reverse().join('-')).setHours(
        0,
        0,
        0,
        0
      )

      fecha = Timestamp.fromDate(fecha)

      if (!agrupacionPorFecha[fecha]) {
        agrupacionPorFecha[fecha] = {
          nombreUsuario,
          uidUsuario,
          fecha,
          almacenes: [value], // Iniciar con el primer almacen encontrado
          activo: true,
        }
      } else {
        // Si la fecha ya fue agregada, simplemente añadimos el almacen al array existente
        agrupacionPorFecha[fecha].almacenes.push(value)
      }
    }

    let promesasDeCreacion = []

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
          toast.success('Las rutas han sido asignadas correctamente')
        } else if (fallos === resultados.length) {
          // Todos los intentos fallaron
          toast.error('No se pudieron asignar las rutas')
        } else {
          // Algunos intentos fueron exitosos y otros fallaron
          toast.warning(
            `Se asignaron ${exitos} rutas correctamente, pero ${fallos} no se pudieron asignar.`
          )
        }
      })
      .finally(resetForm)
  }

  const renderFechaSelectors = () => {
    const fechaSelectors = []
    let currentDate = startDate

    while (currentDate <= endDate) {
      const formattedDate = format(currentDate, 'dd-MM-yyyy', {
        locale: es,
      })

      const almacen1Key = `${formattedDate}_almacen1`
      const almacen2Key = `${formattedDate}_almacen2`
      const almacen3Key = `${formattedDate}_almacen3`

      const almacen1Value = selectedValues[almacen1Key] || ''
      const almacen2Value = selectedValues[almacen2Key] || ''
      const almacen3Value = selectedValues[almacen3Key] || ''

      const fechaSelector = (
        <div
          key={formattedDate}
          className='col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 text-center mb-3 border rounded bg-light py-2 px-1'
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
                  {almacenesActivos.map((almacen) => (
                    <option key={almacen.id} value={almacen.nombre} />
                  ))}
                </datalist>
              </div>

              {almacenesActivos.some(
                (almacen) => almacen.nombre === almacen1Value
              ) && (
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
                        .filter((almacen) => almacen.nombre !== almacen1Value)
                        .map((almacen) => (
                          <option key={almacen.id} value={almacen.nombre} />
                        ))}
                    </datalist>
                  </div>

                  {almacenesActivos.some(
                    (almacen) => almacen.nombre === almacen2Value
                  ) && (
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
                              )
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
        <h4 className='text-center'>Asignar una nueva ruta</h4>
        <form onSubmit={handleSubmit} className='needs-validation' noValidate>
          <div className='text-center'>
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
          <div className='input-group mb-3'>
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
                .filter((u) => u.activo)
                .map((usuario) => (
                  <option key={usuario.uid} value={usuario.nombre} />
                ))}
            </datalist>
          </div>

          {usuarios
            .filter((u) => u.activo)
            .find((u) => u.nombre === selectedUsuario) ? (
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
                No se han encontrado resultados
              </p>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}

export default MaestroRutas
