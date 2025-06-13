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
  // ========== STATE MANAGEMENT ==========
  // Modal-States für UI-Kontrolle
  const [isModalOpen, setIsModalOpen] = useState(false); // User erstellen/bearbeiten Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal für Löschbestätigung
  const [showPassword, setShowPassword] = useState(false); // Passwort anzeigen/verbergen Toggle
  
  // Navigation Hook für Routing zwischen Seiten
  const navigate = useNavigate();
  
  // Loading und UI States
  const [isLoading, setIsLoading] = useState(false); // Zeigt Loading-Spinner während API-Calls
  const [search, setSearch] = useState(''); // Suchbegriff für User-Filterung
  const [sortOption, setSortOption] = useState('ID absteigend'); // Aktuelle Sortierungsoption

  // Mobile UI States - für responsive Design
  const [expandedCards, setExpandedCards] = useState(new Set()); // Verwaltet welche Karten auf Mobile erweitert sind

  // User-Management States
  const [users, setUsers] = useState([]); // Liste aller User vom Backend
  const [editingUser, setEditingUser] = useState(null); // Aktuell zu bearbeitender User (null = Erstellungsmodus)
  const [userToDelete, setUserToDelete] = useState(null); // User der gelöscht werden soll

  // Formular-Datenstruktur für User-Eingaben
  const [formData, setFormData] = useState({
    last_name:"",
    first_name:"",
    department:"",
    email:"",
    password:"",
  });

  // ========== LIFECYCLE HOOKS ==========
  // Lädt User-Daten beim ersten Rendern der Komponente
  useEffect(() => {
      fetchUsers();
    }, []);

  // ========== HELPER FUNCTIONS ==========
  /**
   * Sortiert und filtert die User basierend auf Suchbegriff und Sortierungsoption
   * Diese Funktion ist das Herzstück der Tabellen-Logik und kombiniert Suche + Sortierung
   * @param {Array} userList - Liste der zu verarbeitenden User
   * @param {string} searchTerm - Suchbegriff für Filterung
   * @param {string} sortBy - Sortierungsoption
   * @returns {Array} - Gefilterte und sortierte User-Liste
   */
  const getFilteredAndSortedUsers = (userList, searchTerm, sortBy) => {
    // SCHRITT 1: Filtern basierend auf Suchbegriff
    let filteredUsers = userList.filter((user) => {
      // Wenn Suchfeld leer ist, alle User anzeigen
      if (searchTerm === '') return true;
      
      // Suche in Vor- und Nachnamen (case-insensitive für bessere UX)
      return user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // SCHRITT 2: Sortieren basierend on ausgewählter Option
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
      
      case 'ID absteigend':
      default:
        // Sortierung nach ID absteigend (neueste User haben höhere IDs)
        return filteredUsers.sort((a, b) => a.id - b.id);
    }
  };  

  // ========== API FUNCTIONS ==========
  /**
   * Lädt alle User vom Backend
   */
  const fetchUsers = async () => {
    try {
      const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/");
      const data = await response.json();
      setUsers(data); // User-State mit Backend-Daten aktualisieren
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Erstellt einen neuen User oder aktualisiert einen bestehenden
   * Diese Funktion behandelt sowohl CREATE als auch UPDATE Operationen
   * @param {Event} e - Form Submit Event
   */
  const handleCreateUser = async (e) => {
    e.preventDefault(); // Verhindert Standard-Formular-Reload
    setIsLoading(true); // Loading-State für UI-Feedback

    try {
      // URL und HTTP-Methode je nach Aktion (Erstellen/Bearbeiten) bestimmen
      const url = editingUser
      ? `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/${editingUser.email}/` // PUT für Update
      : "https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/users/create/"; // POST für Erstellung

      const method = editingUser ? "PUT" : "POST";

      // API-Call mit JSON-Daten ausführen
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
          // EDIT-Modus: User in der lokalen Liste aktualisieren
          setUsers((prevUsers) => 
            prevUsers.map((user) =>
              user.email === editingUser.email ? userData : user
            )
          );
          console.log("User erfolgreich bearbeitet:", userData);
        } else {
          // CREATE-Modus: Neuen User zur Liste hinzufügen
          setUsers((prevData) => [...prevData, userData]);
          console.log("User erfolgreich erstellt:", userData);
        }

        // UI zurücksetzen nach erfolgreichem Speichern
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Speichern des Users:", errorData);
      }
    } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
    } finally {
      setIsLoading(false); // Loading-State zurücksetzen
    }
  };

  /**
   * Löscht einen User permanent aus dem System
   * Wird nach Bestätigung im Lösch-Modal aufgerufen
   */
  const handleConfirmDelete = async () => {
    if (!userToDelete) return; // Sicherheitscheck

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

        // Lösch-Modal schließen und State zurücksetzen
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

  // ========== EVENT HANDLERS ==========
  /**
   * Behandelt Änderungen in Formularfeldern
   * Generischer Handler für alle Input-Felder im User-Formular
   */ 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Spread-Operator für immutable State Updates
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
    // Die Tabelle wird automatisch durch die computed values neu gerendert
  };

  /**
   * Öffnet das Bearbeitungs-Modal mit vorausgefüllten Daten
   * Setzt die Komponente in den "Edit-Modus"
   */
  const handleEditUser = (user) => {
    setEditingUser(user); // User für Bearbeitung markieren

    // Formular mit User-Daten vorausfüllen für bessere UX
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
   * Öffnet das Löschbestätigungs-Modal
   * Zeigt Sicherheitsabfrage vor dem endgültigen Löschen
   */
  const handleDeleteClick = (user) => {
    setUserToDelete(user); // User für Löschung markieren
    setIsDeleteModalOpen(true); // Bestätigungs-Modal öffnen
  };

  /**
   * Schließt das Erstellen/Bearbeiten-Modal und setzt das Formular zurück
   * Wichtig: Alle States werden zurückgesetzt für saubere UI
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null); // Bearbeitungsmodus beenden

    // Formular auf Standardwerte zurücksetzen (wichtig für nächste Nutzung)
    setFormData({
      last_name:"",
      first_name:"",
      department:"",
      email:"",
      password:"",
    });
  };

  /**
   * Schließt das Löschbestätigungs-Modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // =========== MOBILE SPECIFIC HANDLERS =============
  /**
   * Toggle Card Details für Mobile Ansicht
   * Verwaltet welche User-Karten erweitert/kollabiert sind
   */
  const toggleCardExpansion = (userId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId); // Karte schließen
    } else {
      newExpanded.add(userId); // Karte öffnen
    }
    setExpandedCards(newExpanded);
  };

  /**
   * Verhindert Event Bubbling für Action Buttons in Mobile Cards
   * Ohne diese Funktion würde ein Klick auf Edit/Delete auch die Karte togglen
   * @param {Event} e - Click Event
   */
  const handleActionClick = (e, action, user) => {
    e.stopPropagation(); // Verhindert Card Toggle
    
    // Action entsprechend weiterleiten
    if (action === 'edit') {
      handleEditUser(user);
    } else if (action === 'delete') {
      handleDeleteClick(user);
    }
  };

  // ========== COMPUTED VALUES ==========
  // Gefilterte und sortierte User für die Anzeige
  // Diese Werte werden bei jeder State-Änderung neu berechnet (React Re-rendering)
  const filteredAndSortedUsers = getFilteredAndSortedUsers(users, search, sortOption);

  // Toggle password visibility - Simple UI State Funktion
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ========== RENDER LOGIC ==========
  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="content-wrapper">
          {/* ========== HEADER SECTION ========== */}
          <div className="content-header">
            <div className="header-left">
              {/* Zurück-Button für Navigation */}
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

            {/* ========== HEADER ACTIONS (Suche, Sortierung, Neuer User) ========== */}
            <div className="header-actions">
            {/* Such-Input mit Icon */}
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
              onChange={(e) => setSearch(e.target.value)} // Live-Suche
              className="search-inp"
            />
            </div>
            
            {/* Sortierungs-Dropdown */}
            <div className="dropd">
            <select
                  className="select-option"
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="ID absteigend">ID absteigend</option>
                  <option value="Alphabetisch A-Z">Alphabetisch A-Z</option>
                  <option value="Alphabetisch Z-A">Alphabetisch Z-A</option>
            </select>
            </div>

            {/* Neuer User Button */}
            <button
              onClick={() => setIsModalOpen(true)} // Öffnet Modal im CREATE-Modus
              className="btn"
              id="btn-blue"
            >
              <Plus size={16} />
              Neuer Benutzer
            </button>
            </div>
          </div>

          {/* ========== DESKTOP TABLE VIEW ========== */}
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
                {/* Rendering der gefilterten und sortierten User */}
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
          
          {/* ========== MOBILE CARD VIEW ========== 
              Responsive Alternative zur Tabelle für kleine Bildschirme */}
          <div className="mobile-cards">
                {filteredAndSortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="mobile-card"
                    onClick={() => toggleCardExpansion(user.id)} // Karte erweitern/schließen
                  >
                    {/* Card Header - immer sichtbar */}
                    <div className="mobile-card-header">
                      <div className="mobile-card-title">{user.last_name}</div>
                      <div className="mobile-card-serial">{user.first_name}</div>
                      <div className="mobile-card-actions">
                        {/* Action Buttons mit Event Bubbling Prevention */}
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
                        {/* Chevron Icon zeigt Expansion-State */}
                        {expandedCards.has(user.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>

                  {/* Expanded Details - nur sichtbar wenn Karte erweitert */}
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
            {/* ========== EMPTY STATE ========== 
                Zeigt hilfreiche Nachricht wenn keine User gefunden werden */}
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

      {/* ========== User MODAL (Erstellen/Bearbeiten) ========== 
          Wiederverwendbares Modal für CREATE und UPDATE Operationen */}
      {isModalOpen && (
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            {/* Dynamischer Titel basierend auf Modus */}
            <h2 className="modal-title">
              {editingUser ? "User bearbeiten" : "Neuen Benutzer anlegen"}
            </h2>
            <form onSubmit={handleCreateUser}>
            {/* Formular-Felder mit Controlled Components */}
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

            {/* Passwort-Feld mit Sichtbarkeits-Toggle */}
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

{/*          TODO: Rollen-Feature für zukünftige Entwicklung
            <div className="form-group">
              <label className="form-label">Rolle</label>
              <select name="rolle" className="form-select">
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Benutzer">Benutzer</option>
              </select>
            </div>*/}

            {/* Modal Footer mit Action Buttons */}
            <div className="dash-modal-footer">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn"
                id="btn-cancel"
                disabled={isLoading} // Verhindert Interaktion während Loading
              >
                Abbrechen
              </button>
              <button
                type="submit" 
                className="btn" 
                id="btn-blue"
                disabled={isLoading}
              >
                {/* Dynamischer Button-Text mit Loading-State */}
                {isLoading ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LÖSCH-BESTÄTIGUNGS MODAL ========== 
          Sicherheitsabfrage vor permanentem Löschen */}
      {isDeleteModalOpen && (
        <div className="dash-modal-overlay">
          <div className="dash-modal delete-modal">
            <h2 className="modal-title">User löschen</h2>

            {/* Bestätigungstext mit User-Details für Klarheit */}
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
                onClick={handleConfirmDelete} // Führt tatsächliche Löschung aus
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