import React from "react"
import './Navigator.css'
import { useNavigate } from 'react-router-dom'

const Navigator = () => {
  const navigate = useNavigate()
  const handleDashboard = () => {
    navigate('/dashboard')
  }
  const handleScanner = () => {
    navigate('/scanner')
  }
  const handleInventory = () => {
    navigate('/asset')
  }

  return (
    <div className="navigator-container">
      <button onClick={handleDashboard}>Zum Dashboard</button><br></br>
      <button onClick={handleScanner}>Zum Scanner</button><br></br>
      <button onClick={handleInventory}>Zum Inventar</button>
    </div>
  )
}
export default Navigator