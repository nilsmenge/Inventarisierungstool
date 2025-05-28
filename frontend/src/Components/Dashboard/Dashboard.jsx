import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal für Löschbestätigung
  const [isLoading, setIsLoading] = useState(false);

  // Asset bezogene
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // Aktuell zu bearbeitender User
  const [userToDelete, setUserToDelete] = useState(null); // User der gelöscht werden soll

  const [formData, setFormData] = useState({
    last_name:"",
    first_name:"",
    department:"",
    email:"",
    password:"",
  });

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // URL und HTTP-Methode je nach Aktion (Erstellen/Bearbeiten) bestimmen
      const url = editingUser
      ? `http://127.0.0.1:8000/api/users/${editingUser.email}/` // PUT für Update
      : "http://127.0.0.1:8000/api/users/create/"; // POST für Erstellung

      const method = editingUser ? "PUT" : "POST";

      // API-Call ausführen
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const userData = await response.json();

        if (editingUser) {
          // Bei Bearbeitung: User in der Liste aktualisieren
          setUsers((prevUsers) => 
            prevUsers.map((user) =>
              user.email === editingUser.email ? userData : user
            )
          );
          console.log("User erfolgreich bearbeitet:", userData);
        } else {
          // Bei Erstellung: User zur Liste hinzufügen
          setUsers((prevData) => [...prevData, userData]);
          console.log("User erfolgreich erstellt:", userData);
        }

        //Modal schließen und Formular zurücksetzen
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Speichern des Users:", errorData);
      }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Löscht einen User permanent
   */
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/users/${userToDelete.email}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // User aus der lokalen Liste entfernen
        setUsers((prevUsers) => 
          prevUsers.filter((user) => user.email !== userToDelete.email)
        );
        console.log("User erfolgreich gelöscht:", userToDelete);

        // Lösch-Modal schließen
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Löschen des Users:", errorData);
      }
    } catch (error) {
      console.error("Netzwerkfehler:", error);
      alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Behandelt Änderungen in Formularfeldern
   */ 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Öffnet das Bearbeitungs-Modal mit vorausgefüllten Daten
   */
  const handleEditUser = (user) => {
    setEditingUser(user); // User für Bearbeitung markieren

    // Formular mit User-Daten füllen
    setFormData({
      last_name: user.last_name,
      first_name: user.first_name,
      department: user.department,
      email: user.email,
      password: user.password,
    });

    setIsModalOpen(true); // Modal öffnen
  };

  /**
   * Öfnnet das Löschbestätigungs-Modal
   */
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  /**
   * Schließt das Erstellen/Bearbeiten-Modal und setzt das Formular zurück
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null); // Bearbeitungsmodus beenden

    // Formular auf Standardwerte zurücksetzen
    setFormData({
      last_name:"",
      first_name:"",
      department:"",
      email:"",
      password:"",
    });
  };

  /**
   * Schlie0t das Löschbestätigungs-Modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

/*    try{
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        // User erfolgreich erstellt
        const newUser = await response.json();
        // User zur Liste hinzufügen
        setUsers((prevData) => [...prevData, newUser]);

        // Modal schließen und Formular zurücksetzen
        setIsModalOpen(false);
        setFormData({
          last_name:"",
          first_name:"",
          department:"",
          email:"",
          password:"",
        });

        console.log("User erfolgreich erstellt:", newUser);
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Erstellen des Users:", errorData);   
      }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      last_name:"",
      first_name:"",
      department:"",
      email:"",
      password:"",
    });
  }
*/
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                    <td className="action-buttons">
                      {/* Bearbeiten-Button */}
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditUser(user)}
                        aria-label="Asset bearbeiten"
                      >
                        <Edit size={16} />
                      </button>
                      {/* Löschen-Button */}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(user)}
                        aria-label="User löschen"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========== ASSET MODAL (Erstellen/Bearbeiten) ========== */}
      {isModalOpen && (
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            <h2 className="modal-title">Neuen Benutzer anlegen</h2>
            <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label className="form-label">Vorname</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
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
                value={formData.last_name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nachname eingeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Abteilung</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Abteilung angeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="E-Mail eingeben"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passwort</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                onChange={handleInputChange}
                  className="form-input"
                  placeholder="Passwort vergeben"
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
                onClick={handleCloseModal}
                className="btn"
                id="btn-cancel"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button 
                className="btn" 
                id="btn-blue"
                disabled={isLoading}
              >
                {isLoading ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LÖSCH-BESTÄTIGUNGS MODAL ========== */}
      {isDeleteModalOpen && (
        <div className="dash-modal-overlay">
          <div className="dash-modal delete-modal">
            <h2 className="modal-title">User löschen</h2>

            {/* Bestätigungstext mit User-Details */}
            <p className="delete-confirmation-text">
              Sind Sie sicher, dass Sie den User "{userToDelete?.first_name} {userToDelete?.last_name}" 
              (E-Mail: {userToDelete?.email}) löschen möchten?
            </p>

            {/* Modal Footer mit Abbrechen/Bestätigen */}
            <div className="dash-modal-footer">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="btn"
                id="btn-cancel"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn delete-confirm-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Löschen...' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;