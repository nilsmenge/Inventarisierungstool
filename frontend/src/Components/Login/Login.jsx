import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo-gwh.png'
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault(); // Verhindert das Standard-Formular-Verhalten
        setError(null); // Fehler zurücksetzen
        
        try {
            // Hier solltest du normalerweise eine tatsächliche Authentifizierung durchführen
            if (password === '123') {
                navigate('/scanner');
            } else {
                setError('Falsche Anmeldedaten!');
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten!');
            console.error(err);
        }
    };

    return (
        <div className='login-container'>
            <div className='login-box'>
                <div className='login-header'>
                    <h1>Anmelden</h1>
                    <p>Bitte gib deine Zugangsdaten ein</p>
                </div>
                <form id='login-form' onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <label htmlFor="email">E-Mail</label>
                        <input 
                            type='email' 
                            name='email' 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
/*                            required = 'required'*/
                        />
                    </div>
                    <div className='input-group'>
                        <label htmlFor="password">Passwort</label>
                        <input 
                            type='password' 
                            name='password' 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
/*                            required = 'required'*/
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className='button'>    
                        <input type='submit' value='Anmelden' />
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