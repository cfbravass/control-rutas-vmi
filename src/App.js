import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { ROLES } from './routes'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import RequireAuth from './components/RequireAuth'

/* VISTAS */
import Home from './views/Home'
import Login from './views/Login'
import MaestroRutas from './views/maestros/Rutas'
import AsignarRutasVTM from './views/maestros/AsignarRutasVTM'
import MaestroAlmacenes from './views/maestros/Almacenes'
import MaestroUsuarios from './views/maestros/Usuarios'
import Rutas from './views/Rutas'
import NotFound404 from './views/NotFound404'
import Register from './views/Register'
import Unauthorized from './views/Unauthorized'

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
      {/* Rutas Públicas */}
      <Route path='/ingreso' element={<Login />} />
      <Route path='/registro' element={<Register />} />

      {/* Rutas para iframe VTM intranet */}
      <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
        <Route path='/vtm/rutas' element={<AsignarRutasVTM />} />
      </Route>

      <Route path='/' element={<MainLayout />}>
        {/* Rutas De Usuario */}
        <Route element={<RequireAuth allowedRoles={[ROLES.Usuario]} />}>
          <Route path='/' element={<Home />} />
          <Route path='/rutas' element={<Rutas />} />
        </Route>

        {/* Rutas Administrativas */}
        <Route
          path='/maestros'
          element={<RequireAuth allowedRoles={[ROLES.Admin]} />}
        >
          <Route path='/maestros/rutas' element={<MaestroRutas />} />
          <Route path='/maestros/almacenes' element={<MaestroAlmacenes />} />
          <Route path='/maestros/usuarios' element={<MaestroUsuarios />} />
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
