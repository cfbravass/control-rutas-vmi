import { startOfWeek, addWeeks, addDays, format } from 'date-fns'
import { toast } from 'react-toastify'
import React, { useState, useEffect } from 'react'

import useAlmacenes from '../hooks/useAlmacenes'
import useRutas from '../hooks/useRutas'
import useUsuarios from '../hooks/useUsuarios'

function ProgramarRuta() {
  const usuarios = useUsuarios()
  const almacenes = useAlmacenes()
  const { crearRuta } = useRutas()
  const [selectedUsuario, setSelectedUsuario] = useState('')
  const [selectedLocaciones, setSelectedLocaciones] = useState({})
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    return () => {
      setIsMounted(false)
    }
  }, [])

  const handleUsuarioChange = (e) => {
    setSelectedUsuario(e.target.value)
    setSelectedLocaciones({})
  }

  const handleAlmacenChange = (e, fecha, almacenIndex) => {
    const selectedValue = e.target.value
    setSelectedLocaciones((prevAlmacenes) => {
      if (!isMounted) {
        return prevAlmacenes
      }
      const updatedAlmacenes = { ...prevAlmacenes }
      if (!updatedAlmacenes[fecha]) {
        updatedAlmacenes[fecha] = {}
      }
      if (selectedValue === '') {
        delete updatedAlmacenes[fecha][almacenIndex]
        if (almacenIndex === 1) {
          delete updatedAlmacenes[fecha][2]
        }
      } else {
        updatedAlmacenes[fecha][almacenIndex] = selectedValue
      }
      return updatedAlmacenes
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const locaciones = {}

    for (const [fecha, programacion] of Object.entries(selectedLocaciones)) {
      const fechaProgramadas = []

      Object.values(programacion).forEach((value) => {
        fechaProgramadas.push(value)
      })

      if (fechaProgramadas.length > 0) {
        locaciones[fecha] = {
          almacenesVisitados: [],
          almacenesProgramados: fechaProgramadas,
        }
      }
    }

    if (Object.keys(locaciones).length === 0) {
      toast.warning('No hay datos para guardar')
      return null
    }

    const datosRuta = {
      uidUsuario: selectedUsuario,
      locaciones,
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
      setSelectedLocaciones({})
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
      const firstAlmacenValue =
        (selectedLocaciones[formattedDate] &&
          selectedLocaciones[formattedDate][1]) ||
        ''

      const fechaSelector = (
        <div
          key={i}
          className='col-12 col-lg-2 text-center mb-3 border rounded bg-light py-2 px-1'
        >
          <div>
            {daysOfWeek[i]} {formattedDate}
          </div>
          {selectedUsuario && (
            <>
              <select
                className='form-select mb-2'
                value={firstAlmacenValue}
                onChange={(e) => handleAlmacenChange(e, formattedDate, 1)}
                id={`almacen-${formattedDate}-1`}
              >
                <option value=''>...</option>
                {almacenes.map((almacen) => (
                  <option key={almacen.id} value={almacen.nombre}>
                    {almacen.nombre}
                  </option>
                ))}
              </select>
              {firstAlmacenValue && (
                <select
                  className='form-select'
                  value={selectedLocaciones[formattedDate]?.[2] || ''}
                  onChange={(e) => handleAlmacenChange(e, formattedDate, 2)}
                  id={`almacen-${formattedDate}-2`}
                >
                  <option value=''>...</option>
                  {almacenes.map((almacen) => (
                    <option key={almacen.id} value={almacen.nombre}>
                      {almacen.nombre}
                    </option>
                  ))}
                </select>
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
      <h1>Programar Ruta</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-floating mb-3'>
          <select
            className='form-select'
            value={selectedUsuario}
            onChange={handleUsuarioChange}
          >
            <option value='' disabled>
              Seleccionar usuario...
            </option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
          <label htmlFor='selectorUsuario'>USUARIO:</label>
        </div>
        {selectedUsuario && <div className='row'>{renderFechaSelectors()}</div>}
        <div className='text-center'>
          <button type='submit' className='btn btn-outline-dark'>
            <i className='fas fa-floppy-disk me-2'></i>
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProgramarRuta
