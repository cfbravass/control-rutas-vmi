import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import ReactDOM from 'react-dom'

import 'react-toastify/dist/ReactToastify.min.css'

import App from './App'
import AuthContextProvider from './contexts/AuthContext'
import NotifyContextProvider from './contexts/NotifyContext'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotifyContextProvider>
        <AuthContextProvider>
          <Routes>
            <Route path='/*' element={<App />} />
          </Routes>
        </AuthContextProvider>
      </NotifyContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
