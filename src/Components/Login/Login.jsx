import React from 'react'
import logo from '../../assets/logo-gwh.png'
import './Login.css'
import { FaUser } from "react-icons/fa"
import { FaLock } from "react-icons/fa"


const Login = () => {
  return (
    <div className='container'>
        <form>
            <h1>Login</h1>
            <div className='input-box'>
                <input type='email' name='email' placeholder='E-Mail'/>
                <FaUser className='icon'/>
            </div>
            <div className='input-box'>
                <input type='password' name='password' placeholder='Passwort'/>
                <FaLock className='icon'/>
            </div>
            <div className='button'>    
                <input type='submit' value='Anmelden'/>
            </div>
        </form>
    </div>
  )
}

export default Login
