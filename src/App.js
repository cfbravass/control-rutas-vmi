import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import RequireAuth from './components/RequireAuth'

/* VISTAS */
import Home from './views/Home'
import Login from './views/Login'
import ProgramarRuta from './views/ProgramarRuta'
import Rutas from './views/Rutas'
import NotFound404 from './views/NotFound404'
import Register from './views/Register'
import Unauthorized from './views/Unauthorized'

const ROLES = {
  Usuario: 'usuario', // Asignado por defecto a todas las cuentas creadas
  Admin: 'admin',
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, userRoles } = useAuth()

  useEffect(() => {
    // Manejo de redireccion segun autenticacion y roles de usuario
    if (location.pathname === '/ingreso' && isAuthenticated()) {
      navigate(location.state?.from ?? '/', { replace: true })
    }
    // eslint-disable-next-line
  }, [userRoles])

  return (
    <Routes>
      <Route path='/ingreso' element={<Login />} />
      <Route path='/registro' element={<Register />} />

      <Route path='/' element={<MainLayout />}>
        {/* Rutas Privadas */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Usuario]} />}>
          <Route path='/' element={<Home />} />
          <Route path='/rutas' element={<Rutas />} />
        </Route>
        <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
          <Route path='/programacion' element={<ProgramarRuta />} />
        </Route>
      </Route>

      {/* (Error 403) No Autorizado */}
      <Route path='/unauthorized' element={<Unauthorized />} />

      {/* (Error 404) Recurso No Encontrado */}
      <Route path='*' element={<NotFound404 />} />
    </Routes>
  )
}

export default App
