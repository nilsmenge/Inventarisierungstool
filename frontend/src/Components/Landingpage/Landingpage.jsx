import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landingpage.css'
import logo from '../../assets/logo-gwh.png'
import vid from '../../assets/video-gwh.mp4'


const Landingpage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };


  return (
    <div className='logo-vid-container'>
      <video src={vid} className='vid' autoPlay muted loop></video>
      <img src={logo} alt="" className='logo'/>
      <div className='header-container'>
        <h1>Inventarisierungstool</h1>
        <button onClick={handleLogin}>Anmelden</button>
      </div>
    </div>
  )
}

export default Landingpage
