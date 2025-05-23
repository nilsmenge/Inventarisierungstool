import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import {
  Icon,
  Search,
  Plus,
  Trash,
  Edit,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div className="header-left">
              <button
                className="btn"
                id="btn-back"
                onClick={() => navigate("/navigator")}
                aria-label="Zurück"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="dashboard-title"> Admin Dashboard</h1>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn"
              id="btn-blue"
            >
              Neuer Benutzer
            </button>
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
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            <h2 className="dash-modal-title">Neuen Benutzer anlegen</h2>

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
              <select name="rolle" className="form-select">
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Benutzer">Benutzer</option>
              </select>
            </div>

            <div className="dash-modal-footer">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn"
                id="btn-cancel"
              >
                Abbrechen
              </button>
              <button className="btn" id="btn-blue">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
