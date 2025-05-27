import React from "react";
import { useState, useEffect } from "react";
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
  const [users, setUsers] = useState([]);

  useEffect(() => {
      fetchUsers();
    }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.log(err);
    }
  };

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
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vorname</th>
                  <th>Nachname</th>
                  <th>E-Mail</th>
                  <th>Abteilung</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
                  </tr>
                ))}
              </tbody>
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
                name="first_name"
                className="form-input"
                placeholder="Vorname eingeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nachname</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                placeholder="Nachname eingeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="E-Mail eingeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Abteilung</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="Abteilung angeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passwort</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Passwort vergeben"
                required
              />
            </div>

{/*            <div className="form-group">
              <label className="form-label">Rolle</label>
              <select name="rolle" className="form-select">
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Benutzer">Benutzer</option>
              </select>
            </div>*/}

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
