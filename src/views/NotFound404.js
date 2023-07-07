import { Link } from 'react-router-dom'

const NotFound404 = () => {
  return (
    <div className='d-flex align-items-center justify-content-center vh-100'>
      <div className='text-center'>
        <h1>Oops!</h1>
        <p>Página No Encontrada</p>
        <Link to='/' className='btn btn-outline-dark'>
          Ir al Inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound404
