import React from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo-gwh.png'
import './Login.css'


const Login = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/scanner');
    };




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
                <input type='submit' value='Anmelden' onClick={handleClick}/>
            </div>
        </form>
        <div className='link-pw'>
            <a href="#">Passwort vergessen?</a>
        </div>
        </div>
    </div>
  )
}

export default Login
