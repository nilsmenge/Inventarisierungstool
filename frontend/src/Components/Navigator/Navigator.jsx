import React from "react"
import './Navigator.css'
import { useNavigate } from 'react-router-dom'
import { BarChart3, QrCode, Package } from 'lucide-react'

const Navigator = () => {
  const navigate = useNavigate()
  const handleDashboard = () => {
    navigate('/dashboard')
  }
  const handleScanner = () => {
    navigate('/scanner')
  }
  const handleInventory = () => {
    navigate('/assets')
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
            <button className="navigator-button" onClick={handleDashboard}>
              <BarChart3 size={20} />
              Dashboard
            </button>

            <button className="navigator-button" onClick={handleScanner}>
              <QrCode size={20} />
              QR/Barcode Scanner
            </button>

            <button className="navigator-button secondary" onClick={handleInventory}>
              <Package size={20} />
              Asset Inventar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Navigator