import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'

export default function ModalEditarAlmacen({
  idModal,
  almacen,
  almacenes,
  modificarAlmacen,
  usuariosAdmin,
}) {
  const [nombreExistente, setNombreExistente] = useState(false)
  const [form, setForm] = useState({
    nombre: almacen.nombre,
    ciudad: almacen.ciudad,
    direccion: almacen.direccion || '',
    latitud: almacen.ubicacion.latitude || 0,
    longitud: almacen.ubicacion.longitude || 0,
    nota: almacen.nota.replace(/\\n/g, '\n') || '',
  })
  const [uidCoordinadora, setUidCoordinadora] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form['nombre'].trim() === '') {
      toast.warning('Debe ingresar el nombre del almacén')
      return null
    } else if (form['ciudad'].trim() === '') {
      toast.warning('Debe ingresar la ciudad del almacén')
      return null
    }

    toast.promise(modificarAlmacen(almacen.id, { ...form, uidCoordinadora }), {
      pending: 'Actualizando almacén...',
      error: 'No se pudo modificar el almacén',
      success: 'Almacén actualizado con éxito',
    })

    resetForm()
  }

  const handleChange = (e) => {
    const { name: nombre, value } = e.target
    let valor = value.toUpperCase()

    // Verificamos si el nombre ya existe en la lista de nombresAlmacenes
    if (nombre === 'nombre') {
      setNombreExistente(
        almacenes.some(
          (x) => x.id !== almacen.id && x.nombre.trim() === valor.trim()
        )
      )
    }

    setForm({ ...form, [nombre]: valor })
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      ciudad: '',
      direccion: '',
      latitud: 0,
      longitud: 0,
      nota: '',
      uidCoordinadora: '',
    })
    setNombreExistente(false)

    // Eliminar el div .modal-backdrop
    const backdrop = document.querySelector('.modal-backdrop')
    if (backdrop) {
      backdrop.parentNode.removeChild(backdrop)
    }

    // Cerrar el modal programáticamente
    const modal = document.getElementById(idModal)
    if (modal) {
      modal.style.display = 'none'
    }
  }

  useEffect(() => {
    setUidCoordinadora(almacen.uidCoordinadora)

    return resetForm
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <button
        className='btn btn-sm btn-warning rounded my-1'
        data-bs-toggle='modal'
        data-bs-target={`#${idModal}`}
        title='Editar almacén'
      >
        <i className='fas fa-pen me-1' />
      </button>

      <div
        className='modal fade'
        id={idModal}
        tabIndex='-1'
        aria-labelledby='modalEditarAlmacenLabel'
        aria-hidden='true'
        data-bs-backdrop='static'
        data-bs-keyboard='false'
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 className='modal-title fs-5' id='modalEditarAlmacenLabel'>
                Editar almacén
              </h1>
              <button
                className='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <form
              onSubmit={handleSubmit}
              className='needs-validation'
              noValidate
            >
              <div className='modal-body'>
                <div className='form-floating mb-3'>
                  <input
                    type='text'
                    className={`form-control ${
                      nombreExistente
                        ? 'is-invalid'
                        : form['nombre'] !== '' && 'is-valid'
                    }`}
                    placeholder='nombre'
                    name='nombre'
                    onChange={handleChange}
                    value={form['nombre']}
                    required
                  />
                  <label htmlFor='nombre'>
                    <i className='fas fa-shop' /> NOMBRE PUNTO DE VENTA
                    <sup className='text-danger'>*</sup>
                  </label>
                  {nombreExistente && (
                    <div className='invalid-feedback'>
                      Ya existe un almacén con ese nombre
                    </div>
                  )}
                </div>

                <div className='input-group mb-2'>
                  <div className='form-floating'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='ciudad'
                      name='ciudad'
                      onChange={handleChange}
                      value={form['ciudad']}
                      required
                    />
                    <label htmlFor='ciudad'>
                      <i className='fas fa-tree-city' /> CIUDAD
                      <sup className='text-danger'>*</sup>
                    </label>
                  </div>

                  <div className='form-floating '>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='direccion'
                      name='direccion'
                      onChange={handleChange}
                      value={form['direccion']}
                    />
                    <label htmlFor='direccion'>
                      <i className='fas fa-location-dot' /> DIRECCIÓN
                    </label>
                  </div>
                </div>

                <div className='input-group mb-3'>
                  <div className='form-floating'>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='latitud'
                      name='latitud'
                      onChange={handleChange}
                      value={form['latitud']}
                      min={-90}
                      max={90}
                    />
                    <label htmlFor='latitud'>
                      <i className='fas fa-map-location' /> LATITUD
                    </label>
                  </div>
                  <div className='form-floating'>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='longitud'
                      name='longitud'
                      onChange={handleChange}
                      value={form['longitud']}
                      min={-180}
                      max={180}
                    />
                    <label htmlFor='longitud'>
                      <i className='fas fa-map-location-dot' /> LONGITUD
                    </label>
                  </div>
                </div>

                <div className='input-group mb-2'>
                  <label
                    className='input-group-text'
                    htmlFor='editUidCoordinadora'
                  >
                    <i className='fas fa-user-gear'></i>
                  </label>
                  <div className='form-floating'>
                    <select
                      className='form-select'
                      id='editUidCoordinadora'
                      required
                      value={uidCoordinadora}
                      onChange={(e) => setUidCoordinadora(e.target.value)}
                    >
                      <option value='' disabled>
                        Seleccionar...
                      </option>
                      {usuariosAdmin.map((usuario) => (
                        <option key={usuario.uid} value={usuario.uid}>
                          {usuario.nombre}
                        </option>
                      ))}
                    </select>
                    <label htmlFor='editUidCoordinadora'>
                      Coordinadora<sup className='text-danger'>*</sup>
                    </label>
                  </div>
                </div>

                <div className='form-floating'>
                  <textarea
                    className='form-control form-control-sm'
                    placeholder='Deja tus observaciones aquí...'
                    id='nota'
                    style={{ height: '100px' }}
                    name='nota'
                    onChange={handleChange}
                    value={form['nota']}
                  ></textarea>
                  <label htmlFor='nota'>
                    <i className='fas fa-comments me-1' />
                    NOTA
                  </label>
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='submit'
                  className='btn btn-success'
                  disabled={nombreExistente}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
