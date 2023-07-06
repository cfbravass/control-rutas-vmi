import { useEffect } from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'

const RequireAuth = ({ allowedRoles }) => {
  const { isAuthenticated, userRoles, loadingAuth } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (loadingAuth) {
      return null
    }
  }, [loadingAuth])

  return userRoles.find((role) => allowedRoles?.includes(role)) ? (
    <Outlet />
  ) : isAuthenticated() ? (
    <Navigate to='/unauthorized' state={{ from: location }} replace />
  ) : (
    <Navigate to='/ingreso' state={{ from: location }} replace />
  )
}

export default RequireAuth
