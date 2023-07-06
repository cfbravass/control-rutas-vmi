import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const navigate = useNavigate()

  const goBack = () => navigate(-1)

  return (
    <div className='text-center'>
      <h1>No Autorizado</h1>
      <br />
      <p>No tienes acceso a la página solicitada.</p>
      <div>
        <button onClick={goBack}>Regresar</button>
      </div>
    </div>
  )
}

export default Unauthorized
