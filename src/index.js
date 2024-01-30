import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'

import 'react-toastify/dist/ReactToastify.min.css'

import App from './App'
import AuthContextProvider from './contexts/AuthContext'
import NotifyContextProvider from './contexts/NotifyContext'
import { UsuariosProvider } from './contexts/UsuariosContext'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <UsuariosProvider>
          <NotifyContextProvider>
            <Routes>
              <Route path='/*' element={<App />} />
            </Routes>
          </NotifyContextProvider>
        </UsuariosProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
