import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, QrCode, ArrowLeft } from "lucide-react";
import { Pie } from "react-chartjs-2";
import Chart from 'chart.js/auto';
import "./AssetDashboard.css";

const AssetDashboard = () => {
  const [assets, setAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/");
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      console.log("Fehler beim Laden der Assets:", err);
    }
  };

  // Kategorien für das erste Kuchendiagramm zählen
  const getCategoryCounts = () => {
    const counts = {};
    assets.forEach(asset => {
      const cat = asset.category || "Unbekannt";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  };

  // Device Status für das zweite Kuchendiagramm zählen
  const getStatusCounts = () => {
    const counts = {};
    assets.forEach(asset => {
      const status = asset.device_status || "Unbekannt";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const statusCounts = getStatusCounts();

  const pieDataCategory = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
          "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
        ],
      },
    ],
  };

  const pieDataStatus = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#59a14f", "#e15759", "#4e79a7", "#f28e2b", "#edc949",
          "#af7aa1", "#ff9da7", "#76b7b2", "#9c755f", "#bab0ab"
        ],
      },
    ],
  };

  return (
    <div className="asset-manager-container">
      <div className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
            <div className="header-left">
              <button id="btn-back" onClick={() => navigate("/navigator")}>
                <ArrowLeft size={24} />
              </button>
              <h1 className="asset-title">Asset-Dashboard</h1>
            </div>
            <div className="header-actions">
              <button className="btn-default" onClick={() => navigate('/assetmanager')}>
                <Package size={16} />
                Asset Inventar
              </button>
              <button className="btn-default" onClick={() => navigate('/scanner')}>
                <QrCode size={16} />
                Scanner
              </button>
            </div>
          </div>

          {/* Zwei Kuchendiagramme nebeneinander zentriert */}
          <div className="charts-container">
            <div className="chart-item">
              <h3 className="chart-title">Kategorien</h3>
              <Pie data={pieDataCategory} />
            </div>
            <div className="chart-item">
              <h3 className="chart-title">Gerätestatus</h3>
              <Pie data={pieDataStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;