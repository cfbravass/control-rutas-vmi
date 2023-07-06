import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import React, { useState, useEffect } from 'react'

import { useAuth } from '../contexts/AuthContext'

function Login() {
  document.title = 'Ingresar - Rutas VMI Vanessa'
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const handleRedirectOrBack = () => {
    navigate(location.state?.from ?? '/', { replace: true })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const id = toast.loading('Iniciando sesión...', {
      position: toast.POSITION.BOTTOM_CENTER,
    })

    try {
      const user = await login(email, password)

      if (user) {
        toast.update(id, {
          render: 'Ingresaste correctamente',
          type: toast.TYPE.SUCCESS,
          autoClose: 3000,
          hideProgressBar: true,
          isLoading: false,
          pauseOnHover: false,
        })
      }
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
    console.log(isAuthenticated())
    if (isAuthenticated()) {
      handleRedirectOrBack()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <div className='container text-center'>
      <h2>Acceso a Rutas VMI Vanessa</h2>
      <form>
        <div className='form-floating mb-3'>
          <input
            type='email'
            className='form-control'
            id='email'
            placeholder='correo'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor='email'>
            <sup className='text-danger'>*</sup>Correo:
          </label>
        </div>
        <div className='form-floating'>
          <input
            type='password'
            className='form-control'
            id='password'
            placeholder='contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor='password'>
            <sup className='text-danger'>*</sup>Contraseña:
          </label>
        </div>

        <button
          type='button'
          onClick={handleLogin}
          className='btn btn-outline-info me-2 my-2'
        >
          Iniciar Sesión
        </button>
        <p>
          ¿No tiene una cuenta? <Link to='/registro'>Cree una</Link>.
        </p>
      </form>
    </div>
  )
}

export default Login
