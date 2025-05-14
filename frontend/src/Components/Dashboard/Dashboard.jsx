import React from "react";
import { useState } from "react";
import './Dashboard.css'
import { Icon, Search, Plus, Trash, Edit, Check, X } from 'lucide-react';

const Dashboard = () => {

    const [ isModalOpen, setIsModalOpen ] = useState(false);
  
  
    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="dashboard-card">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title"> Admin Dashboard</h1>
                        <button
                            onClick={() => setIsModalOpen(true)} 
                            className="btn" id="btn-blue"
                        >
                            Neuer Benutzer</button>
                    </div>

                    <div className="search-container">
                        <input 
                            type="text"
                            placeholder="Suche nach Benutzern..."
                            className="search-input"
                             />
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vorname</th>
                                    <th>Nachname</th>
                                    <th>E-Mail</th>
                                    <th>Rolle</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2 className="modal-title">Neuen Benutzer anlegen</h2>

                        <div className="form-group">
                            <label className="form-label">Vorname</label>
                            <input 
                                type="text"
                                name="vorname"
                                className="form-input"
                                placeholder="Vorname eingeben"
                                required    
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nachname</label>
                            <input 
                                type="text"
                                name="nachname"
                                className="form-input"
                                placeholder="Nachname eingeben"
                                required    
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">E-Mail</label>
                            <input 
                                type="text"
                                name="email"
                                className="form-input"
                                placeholder="E-Mail eingeben"
                                required    
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rolle</label>
                            <select 
                                name="rolle"
                                className="form-select"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Benutzer">Benutzer</option>
                            </select>
                        </div>

                        <div className="modal-footer">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="btn"
                                id="btn-cancel"
                            >
                                Abbrechen
                            </button>
                            <button
                                className="btn"
                                id="btn-blue"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

        
    )
  }
  export default Dashboard
