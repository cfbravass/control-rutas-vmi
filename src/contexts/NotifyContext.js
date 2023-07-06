import { ToastContainer } from 'react-toastify'
import React, { createContext, useContext, useEffect } from 'react'

const NotifyContext = createContext()

export const useNotify = () => useContext(NotifyContext)

export default function NotifyContextProvider({ children }) {
  useEffect(() => {
    return function cleanup() {
      var id = window.setTimeout(null, 0)
      while (id--) {
        window.clearTimeout(id)
      }
    }
  })

  return (
    <NotifyContext.Provider value={null}>
      <ToastContainer />
      {children}
    </NotifyContext.Provider>
  )
}
