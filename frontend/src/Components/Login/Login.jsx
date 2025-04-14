import React from 'react'
import logo from '../../assets/logo-gwh.png'
import './Login.css'
import { FaUser } from "react-icons/fa"
import { FaLock } from "react-icons/fa"


const Login = () => {
  return (
    <div className='login-container'>
        <div className='login-box'>
        <div className='login-header'>
            <h1>Anmelden</h1>
            <p>Bitte gib deine Zugangsdaten ein</p>
        </div>
        <form id='login-form'>
            <div className='input-group'>
                <label htmlFor="email">E-Mail</label>
                <input type='email' name='email'/>
            </div>
            <div className='input-group'>
                <label htmlFor="password">Passwort</label>
                <input type='password' name='password'/>
            </div>
            <div className='button'>    
                <input type='submit' value='Anmelden'/>
            </div>
        </form>
        <div>
            <a href="#">Passwort vergessen?</a>
        </div>
        </div>
    </div>
  )
}

export default Login
