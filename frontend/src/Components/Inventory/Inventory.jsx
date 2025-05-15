import { useState } from 'react';
import React from 'react';
import './Inventory.css';

// Mock-Daten für Assets
const mockAssets = [
  {
    id: 1,
    name: "MacBook Pro",
    icon: "laptop",
    assigned: "Andrea Rademeyer",
    cost: "2.000,00 €",
    status: "NEW",
    category: "HARDWARE",
    assetId: "#1459384",
    location: "Büro 305",
    purchaseDate: "15.03.2025",
    warranty: "2 Jahre",
    notes: "Business Modell, 16GB RAM, 512GB SSD"
  },
  {
    id: 2,
    name: "iPhone 14 Pro",
    icon: "smartphone",
    assigned: "Thomas Weber",
    cost: "1.200,00 €",
    status: "ACTIVE",
    category: "HARDWARE",
    assetId: "#1459372",
    location: "Mobil",
    purchaseDate: "05.01.2025",
    warranty: "2 Jahre",
    notes: "256GB, Schwarz"
  },
  {
    id: 3,
    name: "Bildschirm LG HD45",
    icon: "monitor",
    assigned: "Michael Fuchs",
    cost: "350,00 €",
    status: "ACTIVE",
    category: "HARDWARE",
    assetId: "#1459624",
    location: "Büro 201",
    purchaseDate: "22.02.2025",
    warranty: "3 Jahre",
    notes: "27 Zoll, 4K"
  },
  {
    id: 4,
    name: "Adobe Creative Cloud",
    icon: "book",
    assigned: "Design Team",
    cost: "599,00 €",
    status: "ACTIVE",
    category: "SOFTWARE",
    assetId: "#1462875",
    location: "Digital",
    purchaseDate: "01.04.2025",
    warranty: "N/A",
    notes: "10 Lizenzen, Jahresabo"
  },
  {
    id: 5,
    name: "CNC-Maschine XF34",
    icon: "tool",
    assigned: "Florian Reichelt",
    cost: "15.750,00 €",
    status: "WARTUNG",
    category: "MASCHINE",
    assetId: "#653947",
    location: "Werkraum C4",
    purchaseDate: "10.12.2024",
    warranty: "5 Jahre",
    notes: "Harmuth CNC, nächste Wartung in 4 Wochen"
  },
  {
    id: 6,
    name: "Bürostuhl Ergotec 2000",
    icon: "package",
    assigned: "Julia Schreiber",
    cost: "280,00 €",
    status: "ACTIVE",
    category: "MÖBEL",
    assetId: "#1472365",
    location: "Büro 107",
    purchaseDate: "25.02.2025",
    warranty: "2 Jahre",
    notes: "Ergonomischer Bürostuhl mit Lendenwirbelstütze"
  },
  {
    id: 7,
    name: "Samsung Galaxy S24",
    icon: "smartphone",
    assigned: "Markus Stein",
    cost: "899,00 €",
    status: "NEW",
    category: "HARDWARE",
    assetId: "#1846498",
    location: "Mobil",
    purchaseDate: "02.05.2025",
    warranty: "2 Jahre",
    notes: "256GB, Blau, Firmenvertrag"
  }
];

// Statustypen für Assets
const statusTypes = {
  NEW: "status-new",
  ACTIVE: "status-active",
  WARTUNG: "status-maintenance",
  DEFEKT: "status-defect"
};

// Kategorietypen für Assets
const categoryTypes = {
  HARDWARE: "category-hardware",
  SOFTWARE: "category-software",
  MÖBEL: "category-furniture",
  MASCHINE: "category-machine"
};

// Icons für die Assets
const icons = {
  laptop: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  smartphone: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  monitor: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  book: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  tool: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  package: (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default function AssetManagement() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAssetDetails = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Icon für Asset basierend auf dem Typ
  const getAssetIcon = (iconType) => {
    return (
      <div className="asset-icon">
        {icons[iconType] || icons.package}
      </div>
    );
  };

  // Status-Badge
  const StatusBadge = ({ status }) => (
    <span className={`badge ${statusTypes[status] || "status-default"}`}>
      {status}
    </span>
  );

  // Kategorie-Badge
  const CategoryBadge = ({ category }) => (
    <span className={`badge ${categoryTypes[category] || "category-default"}`}>
      {category}
    </span>
  );

  // Modal für Detailansicht
  const AssetDetailsModal = ({ asset, isOpen, onClose }) => {
    if (!isOpen || !asset) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Asset Details</h2>
            <button
              onClick={onClose}
              className="modal-close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="modal-asset-header">
            {getAssetIcon(asset.icon)}
            <div>
              <h3 className="asset-title">{asset.name} <span className="asset-id">{asset.assetId}</span></h3>
              <div className="badges">
                <StatusBadge status={asset.status} />
                <CategoryBadge category={asset.category} />
              </div>
            </div>
          </div>

          <div className="asset-details-grid">
            <div className="detail-item">
              <span className="detail-label">Zugewiesene Person</span>
              <span className="detail-value">{asset.assigned}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Kosten</span>
              <span className="detail-value">{asset.cost}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Standort</span>
              <span className="detail-value">{asset.location}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Kaufdatum</span>
              <span className="detail-value">{asset.purchaseDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Garantie</span>
              <span className="detail-value">{asset.warranty}</span>
            </div>
          </div>

          <div className="detail-notes">
            <span className="detail-label">Notizen</span>
            <p className="notes-content">{asset.notes}</p>
          </div>

          <div className="modal-footer">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebart">
        <div className="brand">
          <span className="brand-logo">sortful</span>
        </div>

        <nav className="nav-menu">
          <a href="#" className="nav-items">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="nav-items active">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Assets
          </a>
          <a href="#" className="nav-items">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
            Zuweisungen
          </a>
          <a href="#" className="nav-items">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Mitarbeiter
          </a>
          <a href="#" className="nav-items">
            <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Einstellungen
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-contents">
        <div className="content-wrappers">
          {/* Header */}
          <div className="content-headers">
            <h1 className="page-titles">Assets</h1>
            <div className="headers-actions">
              <div className="search-containers">
                <input
                  type="text"
                  placeholder="Suche..."
                  className="search-inputs"
                />
                <div className="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="dropdowns">
                <button className="btn-default">
                  <span>Neuste zuerst</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <button className="btns-default">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span>Scan</span>
              </button>
              <button className="btns-default">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filter</span>
              </button>
              <button className="btns-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Neues Asset</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="assets-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Zugewiesen</th>
                  <th>Kosten</th>
                  <th>Status</th>
                  <th>Kategorie</th>
                  <th className="actions-col">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {mockAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="table-row"
                    onClick={() => openAssetDetails(asset)}
                  >
                    <td>
                      {getAssetIcon(asset.icon)}
                    </td>
                    <td>
                      <div className="asset-name">{asset.name}</div>
                      <div className="asset-id">{asset.assetId}</div>
                    </td>
                    <td>
                      <div className="asset-assigned">{asset.assigned}</div>
                    </td>
                    <td>
                      <div className="asset-cost">{asset.cost}</div>
                    </td>
                    <td>
                      <StatusBadge status={asset.status} />
                    </td>
                    <td>
                      <CategoryBadge category={asset.category} />
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal für Detailansicht */}
      <AssetDetailsModal
        asset={selectedAsset}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}