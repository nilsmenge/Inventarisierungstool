import React from 'react'
import './Landingpage.css'
import logo from '../../assets/logo-gwh.png'
import vid from '../../assets/video-gwh.mp4'


const Landingpage = () => {
  return (
    <div className='logo-vid-container'>
      <video src={vid} className='vid' autoPlay muted loop></video> {/* Video läuft automatisch, stumm und in Schleife */}
      <img src={logo} alt="" className='logo'/>
      <div className='text-btn-container'>
        <h1>Inventarisierungstool</h1>
        <button>Anmelden</button>
      </div>
    </div>
  )
}

export default Landingpage
