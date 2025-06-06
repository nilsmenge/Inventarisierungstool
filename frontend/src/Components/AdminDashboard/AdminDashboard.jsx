import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./AdminDashboard.css";
import {
  Icon,
  Search,
  Plus,
  Trash,
  Edit,
  Check,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal für Löschbestätigung
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('Neueste zuerst'); // Sortierungsoption 

  // Mobile UI States
  const [expandedCards, setExpandedCards] = useState(new Set()); // Expanded Card States

  // User bezogene
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

  // ========== HELPER FUNCTIONS ==========
  /**
   * Sortiert und filtert die User basierend auf Suchbegriff und Sortierungsoption
   * @param {Array} userList - Liste der zu verarbeitenden User
   * @param {string} searchTerm - Suchbegriff für Filterung
   * @param {string} sortBy - Sortierungsoption
   * @returns {Array} - Gefilterte und sortierte User-Liste
   */
  const getFilteredAndSortedUsers = (userList, searchTerm, sortBy) => {
    // Filtern basierend auf Suchbegriff
    let filteredUsers = userList.filter((user) => {
      // Wenn Suchfeld leer ist, alle User anzeigen
      if (searchTerm === '') return true;
      
      // Suche in Vor- und Nachnamen (case-insensitive)
      return user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sortieren basierend auf ausgewählter Option
    switch (sortBy) {
      case 'Alphabetisch A-Z':
        // Sortierung nach Nachnamen aufsteigend (A-Z)
        return filteredUsers.sort((a, b) => 
          a.last_name.toLowerCase().localeCompare(b.last_name.toLowerCase())
        );
      
      case 'Alphabetisch Z-A':
        // Sortierung nach Nachnamen absteigend (Z-A)
        return filteredUsers.sort((a, b) => 
          b.last_name.toLowerCase().localeCompare(a.last_name.toLowerCase())
        );
      
      case 'Neueste zuerst':
      default:
        // Sortierung nach ID absteigend (neueste zuerst)
        return filteredUsers.sort((a, b) => a.id - b.id);
    }
  };  

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/");
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
      ? `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/${editingUser.email}/` // PUT für Update
      : "https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/create/"; // POST für Erstellung

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
        `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/${userToDelete.email}/`,
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
   * Behandelt Änderungen in der Sortierungsauswahl
   * @param {Event} e - Select Change Event
   */
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
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

  // =========== MOBILE SPECIFIC HANDLERS =============
  /**
   * Toggle Card Details
   */
  const toggleCardExpansion = (userId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedCards(newExpanded);
  };

  /**
   * Verhindert Event Bubbling für Action Buttons
   * @param {Event} e - Click Event
   */
  const handleActionClick = (e, action, user) => {
    e.stopPropagation(); // Verhindert Card Toggle
    
    if (action === 'edit') {
      handleEditUser(user);
    } else if (action === 'delete') {
      handleDeleteClick(user);
    }
  };

  // ========== COMPUTED VALUES ==========
  // Gefilterte und sortierte User für die Anzeige
  const filteredAndSortedUsers = getFilteredAndSortedUsers(users, search, sortOption);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
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

            <div className="header-actions">
            <div className="search-con">
              <Search 
                size={16} 
                style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
                }}
              />
            <input
              type="text"
              placeholder="Suche nach Benutzern..."
              onChange={(e) => setSearch(e.target.value)}
              className="search-inp"
            />
            </div>
            
            {/* Sort Dropdown */}
            <div className="dropd">
            <select
                  className="select-option"
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="Neueste zuerst">Neueste zuerst</option>
                  <option value="Alphabetisch A-Z">Alphabetisch A-Z</option>
                  <option value="Alphabetisch Z-A">Alphabetisch Z-A</option>
            </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn"
              id="btn-blue"
            >
              <Plus size={16} />
              Neuer Benutzer
            </button>
            </div>
          </div>

          <div className="table-con">
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
                {filteredAndSortedUsers.map((user) => (
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
                        aria-label="User bearbeiten"
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
          
          {/* Mobile Card View */}
          <div className="mobile-cards">
                {filteredAndSortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="mobile-card"
                    onClick={() => toggleCardExpansion(user.id)}
                  >
                    <div className="mobile-card-header">
                      <div className="mobile-card-title">{user.last_name}</div>
                      <div className="mobile-card-serial">{user.first_name}</div>
                      <div className="mobile-card-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => handleActionClick(e, 'edit', user)}
                          title="Bearbeiten"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => handleActionClick(e, 'delete', user)}
                        >
                          <Trash size={12} />
                        </button>
                        {expandedCards.has(user.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>

                  {/* Expanded Details */}
                  <div className={`mobile-card-details ${expandedCards.has(user.id) ? 'expanded' : ''}`}>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">ID:</span>
                      <span className="mobile-detail-value">{user.id}</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">E-Mail:</span>
                      <span className="mobile-detail-value">{user.email}</span>
                    </div>
                    <div className="mobile-detail-row">
                      <span className="mobile-detail-label">Abteilung:</span>
                      <span className="mobile-detail-value">{user.department}</span>
                    </div>
                    </div>
                  </div>
                ))}
          </div>
            {/* Empty State */}
            {filteredAndSortedUsers.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                {search ? 'Keine User gefunden.' : 'Noch keine User vorhanden'}
              </div>
            )}
        </div>
      </div>

      {/* ========== User MODAL (Erstellen/Bearbeiten) ========== */}
      {isModalOpen && (
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            <h2 className="modal-title">
              {editingUser ? "User bearbeiten" : "Neuen Benutzer anlegen"}
            </h2>
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
                type="button"
                onClick={handleCloseModal}
                className="btn"
                id="btn-cancel"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="submit" 
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
export default AdminDashboard;