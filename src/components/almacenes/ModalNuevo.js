import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUsuarios } from '../../contexts/UsuariosContext'

export default function ModalNuevoAlmacen({ almacenes, crearAlmacen }) {
  const [nombresAlmacenes, setNombresAlmacenes] = useState([])
  const [nombreExistente, setNombreExistente] = useState(false)
  const { datos: usuarios } = useUsuarios()
  const [usuariosAdmin, setUsuariosAdmin] = useState([])
  const [uidCoordinadora, setUidCoordinadora] = useState('')
  const { currentUser } = useAuth()

  const [form, setForm] = useState({
    nombre: '',
    ciudad: '',
    direccion: '',
    latitud: 0,
    longitud: 0,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form['nombre'].trim() === '') {
      toast.warning('Debe ingresar el nombre del almacén')
      return null
    } else if (form['ciudad'].trim() === '') {
      toast.warning('Debe ingresar la ciudad del almacén')
      return null
    }

    setForm({ ...form, uidCoordinadora })

    toast.promise(crearAlmacen(form), {
      pending: 'Creando almacén...',
      error: 'No se pudo crear el almacén',
      success: 'Almacén creado con éxito',
    })

    resetForm()
  }

  const handleChange = (e) => {
    const { name: nombre, value } = e.target
    let valor = value.toUpperCase()
    // Verificamos si el nombre ya existe en la lista de nombresAlmacenes
    if (nombre === 'nombre') {
      setNombreExistente(nombresAlmacenes.includes(valor))
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
    })
    setNombreExistente(false)
    setUidCoordinadora(currentUser.uid)
  }

  useEffect(() => {
    setNombresAlmacenes(almacenes.map((almacen) => almacen.nombre))
    return resetForm

    // eslint-disable-next-line
  }, [almacenes])

  useEffect(() => {
    setUsuariosAdmin(
      usuarios.filter((usuario) => usuario.roles.includes('admin'))
    )

    setUidCoordinadora(currentUser.uid)
    // eslint-disable-next-line
  }, [usuarios])

  return (
    <>
      <button
        className='btn btn-success rounded my-1 p-1'
        data-bs-toggle='modal'
        data-bs-target='#modalNuevoAlmacen'
        title='Crear almacén'
      >
        <i className='fas fa-plus me-1' />
        Nuevo
      </button>

      <div
        className='modal fade'
        id='modalNuevoAlmacen'
        tabIndex='-1'
        aria-labelledby='modalNuevoAlmacenLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h1 className='modal-title fs-5' id='modalNuevoAlmacenLabel'>
                Registro de nuevo almacén
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
                <div className='form-floating mb-2'>
                  <input
                    type='text'
                    className={`form-control ${
                      nombreExistente
                        ? 'is-invalid'
                        : form['nombre'] !== '' && 'is-valid'
                    }`}
                    id='nombre'
                    placeholder='nombre'
                    name='nombre'
                    onChange={handleChange}
                    value={form['nombre']}
                    required
                  />
                  <label htmlFor='nombre'>
                    <i className='fas fa-shop' /> NOMBRE
                    <sup className='text-danger'>*</sup>
                  </label>
                  {nombreExistente && (
                    <div className='invalid-feedback'>
                      Ya existe un almacén con ese nombre
                    </div>
                  )}
                </div>

                <div className='form-floating mb-2'>
                  <input
                    type='text'
                    className='form-control'
                    id='ciudad'
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

                <div className='form-floating mb-2'>
                  <input
                    type='text'
                    className='form-control'
                    id='direccion'
                    placeholder='direccion'
                    name='direccion'
                    onChange={handleChange}
                    value={form['direccion']}
                  />
                  <label htmlFor='direccion'>
                    <i className='fas fa-location-dot' /> DIRECCIÓN
                  </label>
                </div>

                <div className='input-group mb-2'>
                  <label className='input-group-text' htmlFor='uidCoordinadora'>
                    <i className='fas fa-user-gear'></i>
                  </label>
                  <div className='form-floating'>
                    <select
                      className='form-select'
                      id='uidCoordinadora'
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
                    <label htmlFor='uidCoordinadora'>
                      Coordinadora<sup className='text-danger'>*</sup>
                    </label>
                  </div>
                </div>

                <div className='input-group'>
                  <div className='form-floating'>
                    <input
                      type='number'
                      className='form-control'
                      id='latitud'
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
                      id='longitud'
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
              </div>
              <div className='modal-footer'>
                <button
                  type='submit'
                  className='btn btn-success'
                  disabled={nombreExistente}
                  data-bs-dismiss='modal'
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
