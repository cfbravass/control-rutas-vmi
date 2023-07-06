import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { toast } from 'react-toastify'

function Register() {
  document.title = 'Ingresar - Rutas VMI Vanessa'
  const navigate = useNavigate()
  const location = useLocation()
  const { register } = useAuth()

  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')

  const handleRedirectOrBack = () => {
    navigate(location.state?.from ?? '/', { replace: true })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    const id = toast.loading('Creando cuenta...', {
      position: toast.POSITION.BOTTOM_CENTER,
    })

    try {
      const user = await register(nombre, email, password)

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
    <div className='container text-center'>
      <h2>Registro de Usuarios Nuevos</h2>
      <form>
        <div className='form-floating mb-3'>
          <input
            type='text'
            className='form-control'
            id='nombre'
            placeholder='nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <label htmlFor='nombre'>
            <sup className='text-danger'>*</sup>Nombre Completo:
          </label>
        </div>
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
  )
}

export default Register
