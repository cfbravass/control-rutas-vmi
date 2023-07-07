import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { currentUser } = useAuth()

  return (
    <div className='text-center'>
      <h1>Inicio</h1>
      <br />
      <p>Ingresaste como {currentUser.displayName}!</p>
    </div>
  )
}

export default Home
