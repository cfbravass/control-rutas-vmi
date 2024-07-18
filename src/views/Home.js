import { useAuth } from '../contexts/AuthContext'

import logoAzul from '../static/assets/img/logo-vanessa-azul.png'

const Home = () => {
  const { currentUser } = useAuth()

  return (
    <div className='container text-center'>
      <img
        src={logoAzul}
        alt='Logo Vanessa Azul'
        height={'69px'}
        className='mb-4'
      />
      <h1 className='mb-3'>Control de Rutas VMI</h1>
      <div className='row d-flex justify-content-center'>
        <div className='col-12 col-sm-10 col-md-8'>
          <p>
            ¡Bienvenida {currentUser.displayName} a nuestro sistema de control
            de rutas de promotoras de VMI Vanessa!
          </p>
          <p>
            Este software ha sido diseñado para optimizar y simplificar la
            gestión de las rutas de las promotoras de Ventas, Mercadeo e Impulso
            (VMI). Es crucial para nosotros tener un control eficiente sobre las
            actividades de las promotoras y asegurarnos de que lleguen a los
            lugares correctos en el momento adecuado.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
