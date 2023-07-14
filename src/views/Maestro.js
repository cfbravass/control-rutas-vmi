import { startOfWeek, addWeeks, addDays, format } from 'date-fns'
import { toast } from 'react-toastify'
import React, { useState, useEffect } from 'react'

import useAlmacenes from '../hooks/useAlmacenes'
import useRutas from '../hooks/useRutas'
import useUsuarios from '../hooks/useUsuarios'

function Maestro() {
  const [almacenesValidos, setAlmacenesValidos] = useState({})
  const [formularioValido, setFormularioValido] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState('')
  const [selectedValues, setSelectedValues] = useState({})
  const [usuarioValido, setUsuarioValido] = useState(false)
  const { almacenes } = useAlmacenes()
  const { crearRuta } = useRutas()
  const { usuarios } = useUsuarios()

  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

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

  const handleUsuarioChange = (e) => {
    const nombreUsuario = e.target.value.toUpperCase()
    setSelectedUsuario(nombreUsuario)
    setSelectedValues({})
    setUsuarioValido(
      usuarios.some((usuario) => usuario.nombre === nombreUsuario)
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
      [key]: almacenes.some((almacen) => almacen.nombre === selectedValue),
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

    const locaciones = {}

    for (const [key, value] of Object.entries(selectedValues)) {
      // eslint-disable-next-line
      const [fecha, almacenIndex] = key.split('_')

      if (!locaciones[fecha]) {
        locaciones[fecha] = {}
      }

      locaciones[fecha][value] = {
        almacen: value,
        fechaIngreso: '',
        ubicacionIngreso: '',
        fechaSalida: '',
        ubicacionSalida: '',
      }
    }

    const locacionesKeys = Object.keys(locaciones)

    if (locacionesKeys.length === 0) {
      toast.warning('No hay datos para guardar')
      return null
    }

    const datosRuta = {
      nombreUsuario: selectedUsuario,
      uidUsuario: usuarios.find((u) => u.nombre === selectedUsuario)?.uid,
      locaciones,
      activo: true,
    }

    await toast.promise(
      crearRuta(datosRuta),
      {
        pending: 'Asignando la ruta...',
        error: 'Error al asignar la ruta',
        success: 'Se ha asignado la ruta',
      },
      { position: 'bottom-center' }
    )

    if (isMounted) {
      setSelectedUsuario('')
      setSelectedValues({})
      setUsuarioValido(false)
    }
  }

  const renderFechaSelectors = () => {
    const startDate = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })
    const daysOfWeek = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ]
    const fechaSelectors = []

    for (let i = 0; i < 6; i++) {
      const date = addDays(startDate, i)
      const formattedDate = format(date, 'dd-MM-yyyy')

      const almacen1Key = `${formattedDate}_almacen1`
      const almacen2Key = `${formattedDate}_almacen2`

      const almacen1Value = selectedValues[almacen1Key] || ''
      const almacen2Value = selectedValues[almacen2Key] || ''

      const fechaSelector = (
        <div
          key={formattedDate}
          className='col-12 col-lg-2 text-center mb-3 border rounded bg-light py-2 px-1'
        >
          <div>
            {daysOfWeek[i]} {formattedDate}
          </div>
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
                  {almacenes.map((almacen) => (
                    <option key={almacen.id} value={almacen.nombre} />
                  ))}
                </datalist>
              </div>

              {almacenes.some(
                (almacen) => almacen.nombre === almacen1Value
              ) && (
                <div>
                  <input
                    className={`form-control ${
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
                    {almacenes
                      .filter((almacen) => almacen.nombre !== almacen1Value)
                      .map((almacen) => (
                        <option key={almacen.id} value={almacen.nombre} />
                      ))}
                  </datalist>
                </div>
              )}
            </>
          )}
        </div>
      )

      fechaSelectors.push(fechaSelector)
    }

    return fechaSelectors
  }

  return (
    <div className='mx-5'>
      <h1 className='text-center'>Maestreo de Rutas</h1>
      <br />
      <form onSubmit={handleSubmit} className='needs-validation' noValidate>
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
            {usuarios.map((usuario) => (
              <option key={usuario.uid} value={usuario.nombre} />
            ))}
          </datalist>
        </div>

        {usuarios.find((u) => u.nombre === selectedUsuario) ? (
          <>
            <div className='row'>{renderFechaSelectors()}</div>
            <div className='text-center'>
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
          <p className='text-center text-danger fa-bounce'>
            No se han encontrado resultados
          </p>
        )}
      </form>
    </div>
  )
}

export default Maestro
