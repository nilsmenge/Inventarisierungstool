import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Package, FileText, Settings, QrCode } from "lucide-react";
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
  Menu,
  ChevronDown,
  ChevronUp,
  ChartPie
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
  
  // Mobile UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar für mobile
  const [expandedCards, setExpandedCards] = useState(new Set()); // Expanded Card States
  
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
    // Filtern basierend auf Suchbegriff
    let filteredAssets = assetList.filter((asset) => {
      // Wenn Suchfeld leer ist, alle Assets anzeigen
      if (searchTerm === '') return true;
      
      // Suche in Seriennummer und Gerätename (case-insensitive)
      return asset.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
             asset.device_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sortieren basierend auf ausgewählter Option
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
        // Sortierung nach ID absteigend (neueste zuerst)
        return filteredAssets.sort((a, b) => a.id - b.id);
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
   * Navigation zum Dashboard
   */
  const handleDashboard = () => {
    navigate('/assetdashboard')
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

  // ========== MOBILE SPECIFIC HANDLERS ==========
  /**
   * Toggle Sidebar für Mobile
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * Schließt Sidebar wenn Overlay geklickt wird
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  /**
   * Toggle Card Details
   * @param {number} assetId - ID des Assets
   */
  const toggleCardExpansion = (assetId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedCards(newExpanded);
  };

  /**
   * Verhindert Event Bubbling für Action Buttons
   * @param {Event} e - Click Event
   */
  const handleActionClick = (e, action, asset) => {
    e.stopPropagation(); // Verhindert Card Toggle
    
    if (action === 'edit') {
      handleEditAsset(asset);
    } else if (action === 'delete') {
      handleDeleteClick(asset);
    }
  };

  // ========== COMPUTED VALUES ==========
  // Gefilterte und sortierte Assets für die Anzeige
  const filteredAndSortedAssets = getFilteredAndSortedAssets(assets, search, sortOption);

  // Navigation Menu Items
  const menuItems = [
  { label: "Assets", icon: Package },
  { label: "Dashboard", icon: BarChart3 },
  ];

  // ========== RENDER ==========
  return (
    <div className="asset-manager-container">
      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {/* Header */}
          <div className="content-header">
            <div className="header-left">
              <button id="btn-back" onClick={() => navigate("/navigator")}>
                <ArrowLeft size={24} />
              </button>
              <h1 className="asset-title">Asset-Verwaltung</h1>
            </div>

            <div className="header-actions">
              {/* Search */}
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
                  placeholder="Suche nach Assets..."
                  className="search-inp"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

              {/* Dashboard Button */}
              <button className="btn-default" onClick={handleDashboard}>
                <ChartPie size={16} />
                Dashboard
              </button>

              {/* Scanner Button */}
              <button className="btn-default" onClick={handleScan}>
                <QrCode size={16} />
                Scanner
              </button>

              {/* New Asset Button */}
              <button 
                className="btn-newasset"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
                Neues Asset
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
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
                {filteredAndSortedAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.serial_no}</td>
                    <td>{asset.device_name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.device_status}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditAsset(asset)}
                          title="Bearbeiten"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(asset)}
                          title="Löschen"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-cards">
            {filteredAndSortedAssets.map((asset) => (
              <div 
                key={asset.id} 
                className="mobile-card"
                onClick={() => toggleCardExpansion(asset.id)}
              >
                <div className="mobile-card-header">
                  <div className="mobile-card-title">{asset.device_name}</div>
                  <div className="mobile-card-serial">{asset.serial_no}</div>
                  <div className="mobile-card-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={(e) => handleActionClick(e, 'edit', asset)}
                      title="Bearbeiten"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => handleActionClick(e, 'delete', asset)}
                      title="Löschen"
                    >
                      <Trash size={12} />
                    </button>
                    {expandedCards.has(asset.id) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <div className={`mobile-card-details ${expandedCards.has(asset.id) ? 'expanded' : ''}`}>
                  <div className="mobile-detail-row">
                    <span className="mobile-detail-label">ID:</span>
                    <span className="mobile-detail-value">{asset.id}</span>
                  </div>
                  <div className="mobile-detail-row">
                    <span className="mobile-detail-label">Kategorie:</span>
                    <span className="mobile-detail-value">{asset.category}</span>
                  </div>
                  <div className="mobile-detail-row">
                    <span className="mobile-detail-label">Status:</span>
                    <span className="mobile-detail-value">{asset.device_status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedAssets.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              color: '#6b7280' 
            }}>
              {search ? 'Keine Assets gefunden.' : 'Noch keine Assets vorhanden.'}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Asset Modal */}
      {isModalOpen && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <h2 className="asset-modal-title">
              {editingAsset ? 'Asset bearbeiten' : 'Neues Asset erstellen'}
            </h2>
            
            <form onSubmit={handleCreateAsset}>
              <div className="asset-form-group">
                <label className="form-label">Seriennummer</label>
                <input
                  type="text"
                  name="serial_no"
                  className="form-input"
                  value={formData.serial_no}
                  onChange={handleInputChange}
                  disabled={editingAsset !== null} // Seriennummer nicht änderbar bei Bearbeitung
                  required
                />
              </div>

              <div className="asset-form-group">
                <label className="form-label">Gerätename</label>
                <input
                  type="text"
                  name="device_name"
                  className="form-input"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="asset-form-group">
                <label className="form-label">Kategorie</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Drucker">Drucker</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Server">Server</option>
                  <option value="Netzwerk">Netzwerk</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div className="asset-form-group">
                <label className="form-label">Status</label>
                <select
                  name="device_status"
                  className="form-select"
                  value={formData.device_status}
                  onChange={handleInputChange}
                >
                  <option value="Aktiv">Aktiv</option>
                  <option value="Inaktiv">Inaktiv</option>
                  <option value="Wartung">Wartung</option>
                  <option value="Defekt">Defekt</option>
                  <option value="Ausgemustert">Ausgemustert</option>
                </select>
              </div>

              <div className="asset-modal-footer">
                <button
                  type="button"
                  id="dash-btn-cancel"
                  className="asset-btn"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  id="asset-btn-save"
                  className="asset-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Speichern...' : (editingAsset ? 'Aktualisieren' : 'Erstellen')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="asset-modal-overlay">
          <div className="asset-modal delete-modal">
            <h2 className="asset-modal-title">Asset löschen</h2>
            
            <div className="delete-confirmation-text">
              Sind Sie sicher, dass Sie das Asset <strong>"{assetToDelete?.device_name}"</strong> 
              {' '}mit der Seriennummer <strong>"{assetToDelete?.serial_no}"</strong> löschen möchten?
              <br /><br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </div>

            <div className="asset-modal-footer">
              <button
                type="button"
                id="dash-btn-cancel"
                className="asset-btn"
                onClick={handleCloseDeleteModal}
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="asset-btn delete-confirm-btn"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Löschen...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;