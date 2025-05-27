import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';
import './Login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Login API call
  const authenticateUser = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Replace spaces and special characters in email for URL
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`http://127.0.0.1:8000/api/users/${encodedEmail}/`);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Check if password matches
        if (userData.password === password) {
          console.log('Login erfolgreich:', userData);
          
          // Store user data in memory (not localStorage due to artifact restrictions)
          // In a real app, you'd use proper authentication tokens
          window.currentUser = userData;
          
          // Navigate to navigator page
          navigate('/navigator');
          return true;
        } else {
          setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
          return false;
        }
      } else if (response.status === 404) {
        setError('Benutzer nicht gefunden. Bitte überprüfen Sie Ihre E-Mail-Adresse.');
        return false;
      } else {
        setError(`Fehler beim Anmelden: ${response.status}`);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    // Authenticate user
    await authenticateUser(formData.email, formData.password);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">
            <User size={48} color="#2563eb" />
          </div>
          <h1>Anmelden</h1>
          <p>Bitte geben Sie Ihre Zugangsdaten ein</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">
              <User size={16} />
              E-Mail-Adresse
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ihre.email@beispiel.com"
              disabled={isLoading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <Lock size={16} />
              Passwort
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ihr Passwort"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-button">
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </div>
        </form>

        <div className="link-pw">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Passwort vergessen?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;