import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle, ArrowLeft, Search, Plus } from 'lucide-react';
import './Login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // State für Formular-Daten (E-Mail und Passwort)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // State für Fehlermeldungen
  const [error, setError] = useState(null);
  
  // State für Lade-Zustand während API-Aufruf
  const [isLoading, setIsLoading] = useState(false);
  
  // State für Passwort-Sichtbarkeit (anzeigen/verbergen)
  const [showPassword, setShowPassword] = useState(false);
  
  // React Router Hook für Navigation zwischen Seiten
  const navigate = useNavigate();

  // Funktion zur Behandlung von Eingabeänderungen in den Formularfeldern
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Aktualisiere nur das geänderte Feld im formData State
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Lösche vorhandene Fehlermeldung wenn Benutzer tippt
    if (error) {
      setError(null);
    }
  };

  // Hilfsfunktion zur Validierung des E-Mail-Formats
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hauptfunktion für Benutzer-Authentifizierung
  const authenticateUser = async (email, password) => {
    // Setze Lade-Status und lösche vorherige Fehler
    setIsLoading(true);
    setError(null);

    try {
      // Kodiere E-Mail für sichere URL-Übertragung (Leerzeichen, Sonderzeichen)
      const encodedEmail = encodeURIComponent(email);
      
      // API-Aufruf zum Abrufen der Benutzerdaten
      const response = await fetch(`https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/${encodedEmail}/`);
      
      if (response.ok) {
        // Konvertiere Response zu JSON
        const userData = await response.json();
        
        // Überprüfe ob eingegebenes Passwort mit gespeichertem übereinstimmt
        if (userData.password === password) {
          console.log('Login erfolgreich:', userData);
          
          // Setze Login-Cookie für Session-Verwaltung
          document.cookie = "logged_in=true; path=/; SameSite=Strict";
          
          // Speichere Benutzerdaten temporär im Window-Objekt
          // (Hinweis: In echter App würden Tokens verwendet)
          window.currentUser = userData;
          
          // Navigiere zur Hauptseite nach erfolgreichem Login
          navigate('/navigator');

          // Überprüfe Admin-Berechtigung basierend auf Abteilung
          if (userData.department === 'OE18' || userData.department === 'OE 18') {
            console.log('Admin-Zugang gewährt');
            // Setze Admin-Cookie für erweiterte Berechtigungen
            document.cookie = "isAdmin=true; path=/; SameSite=Strict";
          } else {
            console.log('Benutzer-Zugang gewährt');
            document.cookie = "isAdmin=false; path=/; SameSite=Strict";
          }

          return true;
        } else {
          // Passwort stimmt nicht überein
          setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
          document.cookie = "logged_in=false; path=/; SameSite=Strict";
          return false;
        }
      } else if (response.status === 404) {
        // Benutzer wurde nicht in der Datenbank gefunden
        setError('Benutzer nicht gefunden. Bitte überprüfen Sie Ihre E-Mail-Adresse.');
        document.cookie = "logged_in=false; path=/; SameSite=Strict";
        return false;
      } else {
        // Andere HTTP-Fehler
        setError(`Fehler beim Anmelden: ${response.status}`);
        document.cookie = "logged_in=false; path=/; SameSite=Strict";
        return false;
      }
    } catch (err) {
      // Netzwerk- oder andere unerwartete Fehler
      console.error('Login error:', err);
      setError('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
      return false;
    } finally {
      // Lade-Status zurücksetzen (wird immer ausgeführt)
      setIsLoading(false);
    }
  };

  // Funktion zur Behandlung des Formular-Submits
  const handleSubmit = async (e) => {
    // Verhindere Standard-Formular-Submit (Seiten-Reload)
    e.preventDefault();
    
    // Validierung: Überprüfe ob alle Felder ausgefüllt sind
    if (!formData.email || !formData.password) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    // Validierung: Überprüfe E-Mail-Format
    if (!isValidEmail(formData.email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    // Starte Authentifizierung
    await authenticateUser(formData.email, formData.password);
  };

  // Funktion zum Umschalten der Passwort-Sichtbarkeit
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Header-Bereich mit Icon und Titel */}
        <div className="login-header">
          <div className="login-icon">
            <User size={48} color="#2563eb" />
          </div>
          <h1>Anmelden</h1>
          <p>Bitte geben Sie Ihre Zugangsdaten ein</p>
        </div>

        {/* Login-Formular */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* E-Mail-Eingabefeld */}
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
              disabled={isLoading} // Deaktiviert während Ladevorgang
              required
            />
          </div>

          {/* Passwort-Eingabefeld mit Sichtbarkeits-Toggle */}
          <div className="input-group">
            <label htmlFor="password">
              <Lock size={16} />
              Passwort
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'} // Wechselt zwischen Text und Passwort-Typ
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ihr Passwort"
                disabled={isLoading}
                required
              />
              {/* Button zum Ein-/Ausblenden des Passworts */}
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

          {/* Fehlermeldung (wird nur angezeigt wenn error State gesetzt ist) */}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit-Button */}
          <div className="login-button">
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password} // Deaktiviert wenn leer oder ladend
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
      </div>
    </div>
  );
};

export default Login;