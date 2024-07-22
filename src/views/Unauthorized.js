import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className='d-flex align-items-center justify-content-center vh-100'>
      <div className='text-center'>
        <h1>No Autorizado</h1>
        <br />
        <p>No tienes acceso a la página solicitada.</p>
        <Link to='/' className='btn btn-outline-dark'>
          Ir al Inicio
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
