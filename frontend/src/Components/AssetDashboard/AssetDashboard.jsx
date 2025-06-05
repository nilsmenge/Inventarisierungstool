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

  // Kategorien für das Kuchendiagramm zählen
  const getCategoryCounts = () => {
    const counts = {};
    assets.forEach(asset => {
      const cat = asset.category || "Unbekannt";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const pieData = {
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

  return (
    <div className="asset-manager-container">
      <div className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
            <div className="header-left">
              <button id="btn-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={24} />
              </button>
              <h1 className="asset-title">Asset-Dashboard</h1>
            </div>
            <div className="header-actions">
              <button className="btn-default" onClick={() => navigate('/test')}>
                <Package size={16} />
                Asset Inventar
              </button>
              <button className="btn-default" onClick={() => navigate('/scanner')}>
                <QrCode size={16} />
                Scanner
              </button>
            </div>
          </div>
          {/* Kuchendiagramm zentriert */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <div style={{ width: 400, height: 400 }}>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Package, QrCode, ArrowLeft } from "lucide-react";
// import { Pie } from "react-chartjs-2";
// import Chart from 'chart.js/auto';
// import "./AssetDashboard.css";

// const AssetDashboard = () => {
//   const [assets, setAssets] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAssets();
//   }, []);

//   const fetchAssets = async () => {
//     try {
//       const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/");
//       const data = await response.json();
//       setAssets(data);
//     } catch (err) {
//       console.log("Fehler beim Laden der Assets:", err);
//     }
//   };

//   // Kategorien für das Kuchendiagramm zählen
//   const getCategoryCounts = () => {
//     const counts = {};
//     assets.forEach(asset => {
//       const cat = asset.category || "Unbekannt";
//       counts[cat] = (counts[cat] || 0) + 1;
//     });
//     return counts;
//   };

//   const categoryCounts = getCategoryCounts();
//   const pieData = {
//     labels: Object.keys(categoryCounts),
//     datasets: [
//       {
//         data: Object.values(categoryCounts),
//         backgroundColor: [
//           "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
//           "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab"
//         ],
//       },
//     ],
//   };

//   return (
//     <div className="asset-manager-container">
//       <div className="main-content">
//         <div className="content-wrapper">
//           <div className="content-header">
//             <div className="header-left">
//               <button id="btn-back" onClick={() => navigate(-1)}>
//                 <ArrowLeft size={24} />
//               </button>
//               <h1 className="asset-title">Asset-Dashboard</h1>
//             </div>
//             <div className="header-actions">
//               <button className="btn-default" onClick={() => navigate('/test')}>
//                 <Package size={16} />
//                 Asset Inventar
//               </button>
//               <button className="btn-default" onClick={() => navigate('/scanner')}>
//                 <QrCode size={16} />
//                 Scanner
//               </button>
//             </div>
//           </div>
//           {/* Kuchendiagramm zentriert */}
//           <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
//             <div style={{ width: 400, height: 400 }}>
//               <Pie data={pieData} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssetDashboard;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BarChart3, Package, FileText, Settings, ArrowLeft, QrCode } from "lucide-react";
// import "./AssetDashboard.css";

// const AssetDashboard = () => {
//   // ========== STATE MANAGEMENT ==========
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [expandedCards, setExpandedCards] = useState(new Set());
//   const [assets, setAssets] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [editingAsset, setEditingAsset] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [sortOption, setSortOption] = useState("");

//   const navigate = useNavigate();

//   // ========== LIFECYCLE HOOKS ==========
//   useEffect(() => {
//     fetchAssets();
//   }, []);

//   // ========== API FUNCTIONS ==========
//   const fetchAssets = async () => {
//     try {
//       const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/");
//       const data = await response.json();
//       setAssets(data);
//     } catch (err) {
//       console.log("Fehler beim Laden der Assets:", err);
//     }
//   };

//   const handleCreateAsset = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const url = editingAsset
//         ? `https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/${editingAsset.serial_no}/`
//         : "https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/create/";

//       const method = editingAsset ? "PUT" : "POST";

//       const response = await fetch(url, {
//         method: method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         const assetData = await response.json();

//         if (editingAsset) {
//           setAssets((prevAssets) =>
//             prevAssets.map((asset) =>
//               asset.serial_no === editingAsset.serial_no ? assetData : asset
//             )
//           );
//           console.log("Asset erfolgreich bearbeitet:", assetData);
//         } else {
//           setAssets((prevData) => [...prevData, assetData]);
//           console.log("Asset erfolgreich erstellt:", assetData);
//         }

//         handleCloseModal();
//       } else {
//         const errorData = await response.json();
//         console.error("Fehler beim Speichern des Assets:", errorData);
//       }
//     } catch (error) {
//       console.error("Netzwerkfehler:", error);
//       alert("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ========== EVENT HANDLERS ==========
//   const handleScan = () => {
//     navigate('/scanner');
//   };

//   const handleAssets = () => {
//     navigate('/test');
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSortChange = (e) => {
//     setSortOption(e.target.value);
//   };

//   const handleEditAsset = (asset) => {
//     setEditingAsset(asset);
//     setFormData(asset);
//     setIsModalOpen(true);
//   };

//   const handleDeleteClick = (asset) => {
//     // Implementiere hier die Löschlogik
//     // z.B. setAssetToDelete(asset);
//   };

//   const handleActionClick = (e, action, asset) => {
//     e.stopPropagation();
//     if (action === 'edit') {
//       handleEditAsset(asset);
//     } else if (action === 'delete') {
//       handleDeleteClick(asset);
//     }
//   };

//   // Dummy-Funktion für getFilteredAndSortedAssets
//    const getFilteredAndSortedAssets = (assets, search, sortOption) => {
//   //   // Hier sollte deine Filter- und Sortierlogik stehen
//      return assets;
//    };

//    const filteredAndSortedAssets = getFilteredAndSortedAssets(assets, search, sortOption);

//   // ========== RENDER ==========
//   return (
//     <div className="asset-manager-container">
//       {/* Main Content */}
//       <div className="main-content">
//         <div className="content-wrapper">
//           {/* Header */}
//           <div className="content-header">
//             <div className="header-left">
//               <button id="btn-back" onClick={() => navigate(-1)}>
//                 <ArrowLeft size={24} />
//               </button>
//               <h1 className="asset-title">Asset-Dashboard</h1>
//             </div>

//             <div className="header-actions">
//               {/* Dashboard Button */}
//               <button className="btn-default" onClick={handleAssets}>
//                 <Package size={16} />
//                 Asset Inventar
//               </button>

//               {/* Scanner Button */}
//               <button className="btn-default" onClick={handleScan}>
//                 <QrCode size={16} />
//                 Scanner
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AssetDashboard;