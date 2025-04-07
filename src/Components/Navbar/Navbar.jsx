import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo-gwh.png'

const Navbar = () => {
  return (
    <div className='navbar'>

      <img src={logo} alt="" className='logo'/>

      <ul>
        <li>Home</li>
        <li>Inventar</li>
        <li>About</li>
      </ul>
      <div className='search-box'>
        <input type="text" placeholder='Suche' />
      </div>


    </div>
  )
}

export default Navbar
