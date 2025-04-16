import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Landingpage from './Components/Landingpage/Landingpage'
import QrBarcodeScanner from './Components/Scanner/QrScanner'
import Login from './Components/Login/Login'

const App = () => {
  return (
    <BrowserRouter>
    <div className='container'>
      <Routes>
        <Route path='/' element={<Landingpage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/scanner' element={<QrBarcodeScanner />} />
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
