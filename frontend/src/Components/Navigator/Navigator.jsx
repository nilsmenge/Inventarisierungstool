import React from "react"
import './Navigator.css'
import { useNavigate } from 'react-router-dom'
import { BarChart3, QrCode, Package, User, ChartPie, LogOut} from 'lucide-react'

const Navigator = () => {
  const navigate = useNavigate()

  // Hilfsfunktion zum Auslesen des Cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const isAdmin = getCookie("isAdmin") === "true";

    const handleLogout = () => {
    document.cookie = "logged_in=false; path=/; SameSite=Strict";
    document.cookie = "isAdmin=false; path=/; SameSite=Strict";
    window.currentUser = null;
    navigate('/login');
  }

  const handleAdmindashboard = () => {
    navigate('/admindashboard')
  }
  const handleScanner = () => {
    navigate('/scanner')
  }
  const handleAssetdashboard = () => {
    navigate('/assetdashboard')
  }

  const handleAssetManager = () => {
    navigate('/assetmanager')
  }

return (
  <div className="navigator-container">
    <div className="navigator-content">
      <div className="navigator-card">
        <div className="navigator-header">
          <h1 className="navigator-title">Asset Management</h1>
          <p className="navigator-suptitle">Wählen Sie einen Bereich aus</p>
        </div>
        <div className="n-btns">
          <button className="navigator-button" onClick={handleScanner}>
            <QrCode size={20} />
            QR/Barcode Scanner
          </button>

          {isAdmin && (
            <button className="navigator-button secondary" onClick={handleAdmindashboard}>
              <User size={20} />
              Admin
            </button>
          )}

          <button className="navigator-button secondary" onClick={handleAssetdashboard}>
            <ChartPie size={20} />
            Asset Dashboard
          </button>

          <button className="navigator-button secondary" onClick={handleAssetManager}>
            <Package size={20} />
            Asset Inventar
          </button>

          <button className="navigator-button logout" onClick={handleLogout}>
            <LogOut size={20} /> 
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
)
}
export default Navigator