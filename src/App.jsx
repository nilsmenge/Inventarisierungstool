import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Landingpage from './Components/Landingpage/Landingpage'
import QrReader from './Components/Scanner/QrScanner'

const App = () => {
  return (
    <div className='container'>
      <QrReader/>
      {/*<Landingpage/>*/}
    </div>
  )
}

export default App
