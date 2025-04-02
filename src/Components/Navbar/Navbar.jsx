import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <div className='Navbar'>

      <img src="" alt="" className='logo'/>

      <ul>
        <li>Home</li>
        <li>Inventar</li>
        <li>About</li>
      </ul>
      <div className='search-box'>
        <input type="text" placeholder='Search' />
        <img src="" alt="" />
      </div>

      
    </div>
  )
}

export default Navbar
