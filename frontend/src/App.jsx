import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landingpage from './Components/Landingpage/Landingpage'
import QrBarcodeScanner from './Components/Scanner/QrScanner'
import Login from './Components/Login/Login'
import AdminDashboard from './Components/AdminDashboard/AdminDashboard'
import Navigator from './Components/Navigator/Navigator'
import AssetManager from './Components/AssetManager/AssetManager'
import AssetDashboard from './Components/AssetDashboard/AssetDashboard'

const App = () => {
  return (
    <BrowserRouter>
    <div className='container'>
      <Routes>
        <Route path='/' element={<Landingpage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/scanner' element={<QrBarcodeScanner />} />
        <Route path='/admindashboard' element={<AdminDashboard />} />
        <Route path='/navigator' element={<Navigator />} />
        <Route path='/assetmanager' element={<AssetManager />} />
        <Route path='/assetdashboard' element={<AssetDashboard />} />
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
