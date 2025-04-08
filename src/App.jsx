import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Landingpage from './Components/Landingpage/Landingpage'
import QrReader from './Components/Scanner/QrScanner'
import Login from './Components/Login/Login'

const App = () => {
  return (
    <div className='container'>
      <Login/>
      {/*<QrReader/>*/}
      {/*<Landingpage/>*/}
    </div>
  )
}

export default App
