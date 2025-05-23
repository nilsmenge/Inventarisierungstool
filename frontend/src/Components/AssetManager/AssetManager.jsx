import React, { useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = ["Assets", "Dashboard"];

  return (
    <div className="asset-manager-container">
      {/*Sidebar*/}
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

      {/*Main Content*/}
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

              <h1 className="asset-title">Assets</h1>
            </div>
            <div className="header-actions">
              <div className="search-con">
                <input
                  type="text"
                  placeholder="Suche..."
                  className="search-inp"
                />
              </div>
              <div className="dropd">
                <select className="select-option">
                  <option value="Neueste zuerst">Neueste zuerst</option>
                  <option value="Alphabetisch A-Z">Alphabetisch A-Z</option>
                  <option value="Alphabetisch Z-A">Alphabetisch Z-A</option>
                </select>
              </div>
              <button className="btn-default"
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

          <div className="table-con">
            <table className="asset-tab">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Zugewiesen</th>
                  <th>Kosten</th>
                  <th>Status</th>
                  <th>Kategorie</th>
                  <th className="action-col">Aktionen</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <h2 className="asset-modal-title">Neues Asset anlegen</h2>

            <div className="asset-form-group">
              <label className="form-label">ID</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Name eingeben"
                required
              />
            </div>

            <div className="asset-form-group">
              <label className="form-label">Seriennummer</label>
              <input
                type="text"
                name="zugewiesen"
                className="form-input"
                placeholder="Zugewiesen von"
                required
              />
            </div>

            <div className="asset-form-group">
              <label className="form-label">Gerätename</label>
              <input
                type="text"
                name="kosten"
                className="form-input"
                placeholder="Kosten eingeben"
                required
              />
            </div>

{/*            <div className="asset-form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select">
                <option value="Admin">Aktiv</option>
                <option value="Moderator">Inaktiv</option>
              </select>
            </div> */}

            <div className="asset-form-group">
              <label className="form-label">Kategorie</label>
              <select name="status" className="form-select">
                <option value="Admin">Laptop</option>
                <option value="Moderator">Handy</option>
                <option value="Moderator">Tablet</option>
                <option value="Moderator">Bildschirm</option>
                <option value="Moderator">PC</option>
              </select>
            </div>

            <div className="asset-modal-footer">
              <button
                onClick={() => setIsModalOpen(false)}
                className="asset-btn"
                id="dash-btn-cancel"
              >
                Abbrechen
              </button>
              <button className="asset-btn" id="asset-btn-save">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;
