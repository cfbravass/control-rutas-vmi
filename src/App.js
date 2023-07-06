import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import RequireAuth from './components/RequireAuth'

/* VISTAS */
import Home from './views/Home'
import Login from './views/Login'
import NotFound404 from './views/NotFound404'
import Register from './views/Register'
import Unauthorized from './views/Unauthorized'

const ROLES = {
  Usuario: 'usuario', // Asignado por defecto a todas las cuentas creadas
  Vendedor: 'vendedor',
  Admin: 'admin',
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, userRoles } = useAuth()

  useEffect(() => {
    // Manejo de redireccion segun autenticacion y roles de usuario
    if (location.pathname === '/ingreso' && isAuthenticated()) {
      console.error(location.state?.from)
      navigate(location.state?.from ?? '/', { replace: true })
    }
    // eslint-disable-next-line
  }, [userRoles])

  return (
    <Routes>
      <Route exact path='/ingreso' element={<Login />} />
      <Route path='/registro' element={<Register />} />

      <Route path='/' element={<MainLayout />}>
        {/* Rutas Públicas */}
        {/* (Error 403) No Autorizado */}
        <Route path='unauthorized' element={<Unauthorized />} />

        {/* Rutas Privadas */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Usuario]} />}>
          <Route path='/' element={<Home />} />
        </Route>

        {/* (Error 404) Recurso No Encontrado */}
        <Route path='*' element={<NotFound404 />} />
      </Route>
    </Routes>
  )
}

export default App
