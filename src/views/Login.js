import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'

import { useAuth } from '../contexts/AuthContext'

import logoAzul from '../static/assets/img/logo-vanessa-azul.png'

function Login() {
  document.title = 'Ingresar - Rutas VMI Vanessa'
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRedirectOrBack = () => {
    navigate(location.state?.from ?? '/', { replace: true })
  }

  const handleShowPass = () => {
    setShowPassword(!showPassword)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const id = toast.loading('Iniciando sesión...', {
      position: toast.POSITION.BOTTOM_CENTER,
      toastId: 'loginToast',
    })

    try {
      await login(email, password)
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.update(id, {
          render: 'No existe un usuario con ese correo',
          type: toast.TYPE.ERROR,
          hideProgressBar: true,
          autoClose: 3000,
          isLoading: false,
          pauseOnHover: false,
        })
      } else if (error.code === 'auth/wrong-password') {
        toast.update(id, {
          render: 'Contraseña incorrecta',
          type: toast.TYPE.ERROR,
          autoClose: 3000,
          hideProgressBar: true,
          isLoading: false,
          pauseOnHover: false,
        })
      } else {
        toast.update(id, {
          render: 'Error al intentar iniciar sesión',
          type: toast.TYPE.ERROR,
          hideProgressBar: true,
          autoClose: 3000,
          isLoading: false,
          pauseOnHover: false,
        })
      }
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      handleRedirectOrBack()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className='d-flex align-items-center justify-content-center vh-100'>
      <div className='mx-4 p-5 rounded border bg-light text-center'>
        <img src={logoAzul} alt='Logo Vanessa' height='69' className='mb-3' />
        <h1 className='mb-4'>Control Rutas VMI</h1>
        <form>
          <div className='input-group mb-3'>
            <span className='input-group-text'>
              <i className='fas fa-envelope'></i>
            </span>
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
              <label htmlFor='email'>Correo</label>
            </div>
          </div>

          <div className='input-group mb-3'>
            <span className='input-group-text'>
              <i className='fas fa-key'></i>
            </span>
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
              <label htmlFor='password'>Contraseña</label>
            </div>
            <span
              role='button'
              className='input-group-text text-center'
              title={showPassword ? 'Ocultar' : 'Mostrar'}
              onClick={handleShowPass}
            >
              {/* span adicional con estilos para alinear ambos iconos */}
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

          <button
            type='submit'
            onClick={handleLogin}
            className='btn btn-outline-dark me-2 my-2'
          >
            <i className='fas fa-arrow-right-to-bracket'>&nbsp;</i>
            Iniciar Sesión
          </button>
          <p>
            ¿No tiene una cuenta? <Link to='/registro'>Crear una</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
