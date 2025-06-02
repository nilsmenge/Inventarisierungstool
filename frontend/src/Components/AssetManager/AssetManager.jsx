import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AssetManager.css";
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

const AssetManager = () => {
  // ========== STATE MANAGEMENT ==========
  // Navigation und UI States
  const [activeIndex, setActiveIndex] = useState(0); // Aktiver Menüpunkt in der Sidebar
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal für Erstellen/Bearbeiten
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal für Löschbestätigung
  const [isLoading, setIsLoading] = useState(false); // Loading-State für API-Calls
  const [search, setSearch] = useState(''); // Suchbegriff für Filterung
  const [sortOption, setSortOption] = useState('Neueste zuerst'); // Sortierungsoption
  
  // Asset-bezogene States
  const [assets, setAssets] = useState([]); // Liste aller Assets
  const [editingAsset, setEditingAsset] = useState(null); // Aktuell zu bearbeitendes Asset
  const [assetToDelete, setAssetToDelete] = useState(null); // Asset das gelöscht werden soll
  
  // Formular-Daten für Asset-Erstellung/Bearbeitung
  const [formData, setFormData] = useState({
    serial_no: "",
    device_name: "",
    category: "Laptop",
    device_status: "Aktiv",
  });

  // Navigation Hook
  const navigate = useNavigate();

  // ========== LIFECYCLE HOOKS ==========
  // Assets beim ersten Laden der Komponente abrufen
  useEffect(() => {
    fetchAssets();
  }, []);

  // ========== HELPER FUNCTIONS ==========
  /**
   * Sortiert und filtert die Assets basierend auf Suchbegriff und Sortierungsoption
   * @param {Array} assetList - Liste der zu verarbeitenden Assets
   * @param {string} searchTerm - Suchbegriff für Filterung
   * @param {string} sortBy - Sortierungsoption
   * @returns {Array} - Gefilterte und sortierte Asset-Liste
   */
  const getFilteredAndSortedAssets = (assetList, searchTerm, sortBy) => {
    // Schritt 1: Filtern basierend auf Suchbegriff
    let filteredAssets = assetList.filter((asset) => {
      // Wenn Suchfeld leer ist, alle Assets anzeigen
      if (searchTerm === '') return true;
      
      // Suche in Seriennummer und Gerätename (case-insensitive)
      return asset.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
             asset.device_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Schritt 2: Sortieren basierend auf ausgewählter Option
    switch (sortBy) {
      case 'Alphabetisch A-Z':
        // Sortierung nach Gerätename aufsteigend (A-Z)
        return filteredAssets.sort((a, b) => 
          a.device_name.toLowerCase().localeCompare(b.device_name.toLowerCase())
        );
      
      case 'Alphabetisch Z-A':
        // Sortierung nach Gerätename absteigend (Z-A)
        return filteredAssets.sort((a, b) => 
          b.device_name.toLowerCase().localeCompare(a.device_name.toLowerCase())
        );
      
      case 'Neueste zuerst':
      default:
        // Sortierung nach ID aufsteigend (neueste zuerst)
        return filteredAssets.sort((a, b) => b.id - a.id);
    }
  };

  // ========== API FUNCTIONS ==========
  /**
   * Lädt alle Assets vom Backend
   */
  const fetchAssets = async () => {
    try {
      const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/");
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      console.log("Fehler beim Laden der Assets:", err);
    }
  };

  /**
   * Erstellt ein neues Asset oder aktualisiert ein vorhandenes
   * @param {Event} e - Form Submit Event
   */
  const handleCreateAsset = async (e) => {
    e.preventDefault(); // Verhindert Standard-Formular-Submit
    setIsLoading(true);

    try {
      // URL und HTTP-Methode je nach Aktion (Erstellen/Bearbeiten) bestimmen
      const url = editingAsset 
        ? `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/${editingAsset.serial_no}/` // PUT für Update
        : "https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/create/"; // POST für Erstellung
      
      const method = editingAsset ? "PUT" : "POST";

      // API-Call ausführen
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const assetData = await response.json();
        
        if (editingAsset) {
          // Bei Bearbeitung: Asset in der Liste aktualisieren
          setAssets((prevAssets) =>
            prevAssets.map((asset) =>
              asset.serial_no === editingAsset.serial_no ? assetData : asset
            )
          );
          console.log("Asset erfolgreich bearbeitet:", assetData);
        } else {
          // Bei Erstellung: Asset zur Liste hinzufügen
          setAssets((prevData) => [...prevData, assetData]);
          console.log("Asset erfolgreich erstellt:", assetData);
        }

        // Modal schließen und Formular zurücksetzen
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Speichern des Assets:", errorData);
      }
    } catch (error) {
      console.error("Netzwerkfehler:", error);
      alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Löscht ein Asset permanent
   */
  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/${assetToDelete.serial_no}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Asset aus der lokalen Liste entfernen
        setAssets((prevAssets) =>
          prevAssets.filter((asset) => asset.serial_no !== assetToDelete.serial_no)
        );
        console.log("Asset erfolgreich gelöscht:", assetToDelete);
        
        // Lösch-Modal schließen
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Löschen des Assets:", errorData);
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
   * Navigation zum Scanner
   */
  const handleScan = () => {
    navigate('/scanner')
  }

  /**
   * Behandelt Änderungen in Formularfeldern
   * @param {Event} e - Input Change Event
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
   * @param {Object} asset - Das zu bearbeitende Asset
   */
  const handleEditAsset = (asset) => {
    setEditingAsset(asset); // Asset für Bearbeitung markieren
    
    // Formular mit Asset-Daten füllen
    setFormData({
      serial_no: asset.serial_no,
      device_name: asset.device_name,
      category: asset.category,
      device_status: asset.device_status,
    });
    
    setIsModalOpen(true); // Modal öffnen
  };

  /**
   * Öffnet das Löschbestätigungs-Modal
   * @param {Object} asset - Das zu löschende Asset
   */
  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  /**
   * Schließt das Erstellen/Bearbeiten-Modal und setzt das Formular zurück
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null); // Bearbeitungsmodus beenden
    
    // Formular auf Standardwerte zurücksetzen
    setFormData({
      serial_no: "",
      device_name: "",
      category: "Laptop",
      device_status: "Aktiv",
    });
  };

  /**
   * Schließt das Löschbestätigungs-Modal
   */
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAssetToDelete(null);
  };

  // ========== RENDER ==========
  const menuItems = ["Assets", "Dashboard"]; // Sidebar-Menüpunkte

  // Gefilterte und sortierte Assets für die Anzeige vorbereiten
  const displayedAssets = getFilteredAndSortedAssets(assets, search, sortOption);

  return (
    <div className="asset-manager-container">
      {/* ========== SIDEBAR ========== */}
      <div className="sideb">
        <nav className="nav-menu">
          {menuItems.map((item, idx) => (
            <a
              href="#"
              key={item}
              className={`nav-item${activeIndex === idx ? " active" : ""}`}
              onClick={() => setActiveIndex(idx)}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="main-content">
        <div className="content-wrapper">
          {/* Header mit Titel und Aktionen */}
          <div className="content-header">
            <div className="header-left">
              {/* Zurück-Button */}
              <button
                className="btn"
                id="btn-back"
                onClick={() => navigate("/navigator")}
                aria-label="Zurück"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="asset-title">Assets</h1>
            </div>
            
            {/* Header-Aktionen (Suche, Filter, Buttons) */}
            <div className="header-actions">
              {/* Suchfeld */}
              <div className="search-con">
                <input
                  type="text"
                  placeholder="Suche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-inp"
                />
              </div>
              
              {/* Sortierung/Filter Dropdown */}
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
              
              {/* Aktions-Buttons */}
              <button 
                className="btn-default"
                onClick={handleScan}
              >
                Scan
              </button>
              <button className="btn-default">Filter</button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-newasset"
              >
                Neues Asset
              </button>
            </div>
          </div>

          {/* ========== ASSETS TABELLE ========== */}
          <div className="table-con">
            <table className="asset-tab">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Seriennummer</th>
                  <th>Gerätename</th>
                  <th>Kategorie</th>
                  <th>Status</th>
                  <th className="action-col">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {/* Asset-Zeilen dynamisch rendern mit Filterung und Sortierung */}
                {displayedAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.serial_no}</td>
                    <td>{asset.device_name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.device_status}</td>
                    <td className="action-buttons">
                      {/* Bearbeiten-Button */}
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditAsset(asset)}
                        aria-label="Asset bearbeiten"
                      >
                        <Edit size={16} />
                      </button>
                      {/* Löschen-Button */}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(asset)}
                        aria-label="Asset löschen"
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
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <form onSubmit={handleCreateAsset}>
              {/* Modal-Titel dynamisch je nach Aktion */}
              <h2 className="asset-modal-title">
                {editingAsset ? "Asset bearbeiten" : "Neues Asset anlegen"}
              </h2>

              {/* Seriennummer Eingabe */}
              <div className="asset-form-group">
                <label className="form-label">Seriennummer</label>
                <input
                  type="text"
                  name="serial_no"
                  value={formData.serial_no}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Seriennummer eingeben"
                  required
                />
              </div>

              {/* Gerätename Eingabe */}
              <div className="asset-form-group">
                <label className="form-label">Gerätename</label>
                <input
                  type="text"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Gerätenamen eingeben"
                  required
                />
              </div>

              {/* Kategorie Auswahl */}
              <div className="asset-form-group">
                <label className="form-label">Kategorie</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Handy">Handy</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Bildschirm">Bildschirm</option>
                  <option value="PC">PC</option>
                </select>
              </div>

              {/* Status Auswahl */}
              <div className="asset-form-group">
                <label className="form-label">Status</label>
                <select 
                  name="device_status"
                  value={formData.device_status}
                  onChange={handleInputChange} 
                  className="form-select"
                >
                  <option value="Aktiv">Aktiv</option>
                  <option value="Im Lager">Im Lager</option>
                  <option value="Defekt">Defekt</option>
                </select>
              </div>

              {/* Modal Footer mit Buttons */}
              <div className="asset-modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="asset-btn"
                  id="dash-btn-cancel"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit" 
                  className="asset-btn" 
                  id="asset-btn-save"
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
        <div className="asset-modal-overlay">
          <div className="asset-modal delete-modal">
            <h2 className="asset-modal-title">Asset löschen</h2>
            
            {/* Bestätigungstext mit Asset-Details */}
            <p className="delete-confirmation-text">
              Sind Sie sicher, dass Sie das Asset "{assetToDelete?.device_name}" 
              (Seriennummer: {assetToDelete?.serial_no}) löschen möchten?
            </p>
            
            {/* Modal Footer mit Abbrechen/Bestätigen */}
            <div className="asset-modal-footer">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="asset-btn"
                id="dash-btn-cancel"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="asset-btn delete-confirm-btn"
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

export default AssetManager;