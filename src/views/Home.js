import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { currentUser, logout } = useAuth()

  return (
    <div className='text-center'>
      <h1>Inicio</h1>
      <br />
      <p>Ingresaste como {currentUser.displayName}!</p>
      <br />
      <button onClick={logout} className='btn btn-outline-dark'>
        <i className='fas fa-arrow-right-from-bracket'></i> Cerrar Sesión
      </button>
    </div>
  )
}

export default Home
