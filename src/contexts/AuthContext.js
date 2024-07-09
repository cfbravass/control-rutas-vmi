import { doc, setDoc, getDoc } from 'firebase/firestore'
import { sendPasswordResetEmail as sendPasswordResetEmailFirebase } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { auth, db } from '../firebaseApp'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  confirmPasswordReset,
  updateProfile,
} from 'firebase/auth'
import { toast } from 'react-toastify'

const AuthContext = createContext({
  currentUser: null,
  forgotPassword: null,
  isAuthenticated: null,
  loadingAuth: null,
  login: null,
  logout: null,
  register: null,
  sendPasswordResetEmail: null,
  resetPassword: null,
  userData: null,
  userRoles: [],
})

export const useAuth = () => useContext(AuthContext)

export default function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({})
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [userData, setUserData] = useState(null)
  const [userRoles, setUserRoles] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (!toast.isActive('loginToast')) {
          toast.loading('Validando sesión...', {
            position: toast.POSITION.BOTTOM_CENTER,
            toastId: 'loginToast',
          })
        } else {
          toast.update('loginToast', {
            render: 'Comprobando permisos...',
            hideProgressBar: false,
            autoClose: 5000,
            isLoading: true,
            pauseOnHover: false,
          })
        }

        setLoadingAuth(true)
        setCurrentUser(user)
        getUserData(user.uid).then((userData) => {
          if (!userData.activo) {
            toast.update('loginToast', {
              render: 'Tu cuenta de usuario se encuentra inactiva',
              type: toast.TYPE.ERROR,
              hideProgressBar: false,
              autoClose: 3003,
              isLoading: false,
              pauseOnHover: false,
            })
            setCurrentUser({})
            setUserData(null)
            setUserRoles([])
            setLoadingAuth(false)
            logout()
          } else {
            toast.update('loginToast', {
              render: 'Ingresaste correctamente',
              type: toast.TYPE.SUCCESS,
              hideProgressBar: true,
              autoClose: 3003,
              isLoading: false,
              pauseOnHover: false,
            })
          }

          setUserData(userData)
          setUserRoles(userData.roles || [])
          setLoadingAuth(false)
        })
      } else {
        setCurrentUser({})
        setUserData(null)
        setUserRoles([])
        setLoadingAuth(false)
        toast.dismiss('loginToast')
      }
    })
    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      throw error
    }
  }

  async function getUserData(uid) {
    const userDocRef = doc(db, 'usuarios', uid)
    const userDocSnapshot = await getDoc(userDocRef)

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data()
      return userData
    }

    return null
  }

  async function register(nombre, email, password, uidCoordinadora) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    await setDoc(doc(db, 'usuarios', user.uid), {
      nombre,
      uid: user.uid,
      email,
      uidCoordinadora,
      roles: ['usuario'],
      activo: true,
    })
    await updateProfile(user, { displayName: nombre })

    return user
  }

  async function sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmailFirebase(auth, email)
      // El correo de restablecimiento de contraseña se ha enviado con éxito.
      toast.success(
        'Se ha enviado un correo de restablecimiento de contraseña.'
      )
    } catch (error) {
      // Ocurrió un error al enviar el correo de restablecimiento de contraseña.
      console.error(
        'Error al enviar el correo de restablecimiento de contraseña:',
        error
      )
      toast.error(
        'Ocurrió un error al enviar el correo de restablecimiento de contraseña.'
      )
    }
  }

  function resetPassword(oobCode, newPassword) {
    return confirmPasswordReset(auth, oobCode, newPassword)
  }

  function logout() {
    return signOut(auth)
  }

  function isAuthenticated() {
    return (
      currentUser !== null &&
      typeof currentUser === 'object' &&
      Object.keys(currentUser).length > 0
    )
  }

  const value = {
    currentUser,
    isAuthenticated,
    loadingAuth,
    login,
    logout,
    register,
    sendPasswordResetEmail,
    resetPassword,
    userData,
    userRoles,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
