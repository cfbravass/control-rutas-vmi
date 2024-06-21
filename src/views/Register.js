import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'

import { useAuth } from '../contexts/AuthContext'
import { useUsuarios } from '../contexts/UsuariosContext'

import logoAzul from '../static/assets/img/logo-vanessa-azul.png'

function Register() {
  document.title = 'Ingresar - Rutas VMI Vanessa'
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()
  const { datos: usuarios } = useUsuarios()
  const usuariosAdmin = usuarios.filter((usuario) =>
    usuario.roles.includes('admin')
  )

  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [uidCoordinadora, setUidCoordinadora] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleShowPass = () => {
    setShowPassword(!showPassword)
  }

  const handleRedirectOrBack = () => {
    navigate(location.state?.from ?? '/', { replace: true })
  }

  const updateNombre = (e) => {
    const { value } = e.target
    const uppercaseValue = value.toUpperCase()
    setNombre(uppercaseValue)
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!nombre || !email || !password || !uidCoordinadora) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    const id = toast.loading('Creando cuenta...', {
      position: toast.POSITION.BOTTOM_CENTER,
    })

    try {
      const user = await register(nombre, email, password, uidCoordinadora)

      if (user) {
        toast.update(id, {
          render: 'Ingresaste correctamente',
          type: toast.TYPE.SUCCESS,
          autoClose: 3000,
          hideProgressBar: true,
          isLoading: false,
          pauseOnHover: false,
        })
        handleRedirectOrBack()
      }
    } catch (error) {
      toast.update(id, {
        render: `Error al intentar crear cuenta: ${error.code}`,
        type: toast.TYPE.ERROR,
        autoClose: 3000,
        isLoading: false,
        pauseOnHover: true,
      })
    }
  }

  return (
    <div className='d-flex align-items-center justify-content-center vh-100'>
      <div className='mx-4 p-5 rounded border bg-light text-center'>
        <img src={logoAzul} alt='Logo Vanessa' height='69' className='mb-3' />
        <h2 className='mb-5'>Crear una nueva cuenta</h2>
        <form>
          <div className='input-group mb-1'>
            <label className='input-group-text' htmlFor='nombre'>
              <i className='fas fa-user me-1'></i>
            </label>
            <div className='form-floating'>
              <input
                type='text'
                className='form-control'
                id='nombre'
                placeholder='nombre'
                value={nombre}
                onChange={updateNombre}
                required
              />
              <label htmlFor='nombre'>
                <sup className='text-danger'>*</sup>Nombre Completo
              </label>
            </div>
          </div>
          <div className='input-group mb-1'>
            <label className='input-group-text' htmlFor='email'>
              <i className='fas fa-envelope me-1'></i>
            </label>
            <div className='form-floating'>
              <input
                autoComplete='email'
                className='form-control'
                id='email'
                onChange={(e) => setEmail(e.target.value)}
                placeholder='correo'
                required
                type='email'
                value={email}
              />
              <label htmlFor='email'>
                <sup className='text-danger'>*</sup>Correo
              </label>
            </div>
          </div>
          <div className='input-group mb-1'>
            <label className='input-group-text' htmlFor='password'>
              <i className='fas fa-key me-1'></i>
            </label>
            <div className='form-floating'>
              <input
                autoComplete='current-password'
                className='form-control'
                id='password'
                onChange={(e) => setPassword(e.target.value)}
                placeholder='contraseña'
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <label htmlFor='password'>
                <sup className='text-danger'>*</sup>Contraseña
              </label>
            </div>
            <span
              role='button'
              className='input-group-text text-center'
              title={showPassword ? 'Ocultar' : 'Mostrar'}
              onClick={handleShowPass}
            >
              <span
                style={{
                  width: '1em',
                }}
              >
                <i
                  className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}
                  style={{ marginRight: '-4px' }}
                ></i>
              </span>
            </span>
          </div>

          <div className='input-group mb-1'>
            <label class='input-group-text' htmlFor='uidCoordinadora'>
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
                <sup className='text-danger'>*</sup>Coordinadora
              </label>
            </div>
          </div>

          <button
            type='submit'
            onClick={handleRegister}
            className='btn btn-outline-info my-2'
          >
            Crear Cuenta
          </button>
          <p>
            ¿Ya tiene una cuenta? <Link to='/ingreso'>Ingresar</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
