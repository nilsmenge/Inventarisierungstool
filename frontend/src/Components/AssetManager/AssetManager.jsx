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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    serial_no: "",
    device_name: "",
    category: "Laptop",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assets/");
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      console.log(err);
    }
  };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    const handleCreateAsset = async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/assets/create/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
        if (response.ok) {
          // Asset created successfully
          const newAsset = await response.json();
          //Asset zur Liste hinzufügen
          setAssets((prevData) => [...prevData, newAsset]);

          //Modal schließen und Formular zurücksetzen
          setIsModalOpen(false);
          setFormData({
            serial_no: "",
            device_name: "",
            category: "Laptop",
          });

          console.log("Asset erfolgreich erstellt:", newAsset);
        } else {
          const errorData = await response.json();
          console.error("Fehler beim Erstellen des Assets:", errorData);
        }
      } catch (error) {
        console.error("Netzwerkfehler:", error);
        alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
      } finally {
        setIsLoading(false);
      }
    };
{/*  };             */}

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      serial_no: "",
      device_name: "",
      category: "Laptop",
    });
  };

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
              <button className="btn-default">Scan</button>
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
                  <th>ID</th>
                  <th>Seriennummer</th>
                  <th>Gerätename</th>
                  <th>Kategorie</th>
                  <th className="action-col">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.serial_no}</td>
                    <td>{asset.device_name}</td>
                    <td>{asset.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="asset-modal-overlay">
          <div className="asset-modal">
            <form onSubmit={handleCreateAsset}>
              <h2 className="asset-modal-title">Neues Asset anlegen</h2>

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

              <div className="asset-form-group">
                <label className="form-label">Gerätename</label>
                <input
                  type="text"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
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
    </div>
  );
};

export default AssetManager;
