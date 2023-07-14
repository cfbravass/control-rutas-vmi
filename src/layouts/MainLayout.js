import { NavLink, Link, Outlet } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

import logo from '../static/assets/img/vanessa.ico'
import { ROLES } from '../routes'

const MainLayout = () => {
  const { logout, userRoles } = useAuth()

  return (
    <main>
      <nav className='navbar navbar-expand-sm sticky-top bg-body-tertiary mb-3'>
        <div className='container-fluid'>
          <Link className='navbar-brand' to='/'>
            <img
              src={logo}
              alt='Logo'
              width='30'
              className='d-inline-block align-text-bottom rounded me-1'
            />
            Rutas VMI
          </Link>
          <button
            className='navbar-toggler'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#navbarNav'
            aria-controls='navbarNav'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarNav'>
            <ul className='navbar-nav'>
              <li className='nav-item'>
                <NavLink
                  className='nav-link btn btn-light fw-semibold mx-1'
                  to='/'
                >
                  Inicio
                </NavLink>
              </li>
              {userRoles.includes(ROLES.Admin) && (
                <li className='nav-item'>
                  <NavLink
                    className='nav-link btn btn-light fw-semibold mx-1'
                    to='/maestro'
                  >
                    Maestro
                  </NavLink>
                </li>
              )}
              <li className='nav-item'>
                <NavLink
                  className='nav-link btn btn-light fw-semibold mx-1'
                  to='/rutas'
                >
                  Rutas
                </NavLink>
              </li>
            </ul>
            <ul className='navbar-nav ms-auto'>
              <li className='nav-item dropdown text-center'>
                <NavLink
                  className='nav-link dropdown-toggle'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  <i className='fas fa-user'></i>
                </NavLink>

                <ul className='dropdown-menu dropdown-menu-end text-center'>
                  <li className='nav-item'>
                    <NavLink className='dropdown-item disabled' to='/perfil'>
                      <i className='fas fa-user-gear'></i> Perfil
                    </NavLink>
                  </li>
                  <li className='nav-item'>
                    <Link className='dropdown-item' onClick={logout}>
                      <i className='fas fa-arrow-right-from-bracket'></i>{' '}
                      &nbsp;Salir
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </main>
  )
}

export default MainLayout
