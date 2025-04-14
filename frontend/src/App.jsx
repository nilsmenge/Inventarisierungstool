import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Landingpage from './Components/Landingpage/Landingpage'
import QrBarcodeScanner from './Components/Scanner/QrScanner'
import Login from './Components/Login/Login'

const App = () => {
  return (
    <div className='container'>
      <Login/>
    </div>
  )
}

export default App
