// EnhancedQrScanner.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import "./Test.css";
import {
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const EnhancedQrScanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState("qr");
  
  // Modal states
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assetData, setAssetData] = useState(null);
  const [scannedSerialNo, setScannedSerialNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data for creating new asset
  const [formData, setFormData] = useState({
    serial_no: "",
    device_name: "",
    category: "Laptop",
  });

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize ZXing Barcode Reader
  useEffect(() => {
    const hints = new Map();
    const formats = [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
    ];

    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    zxingReaderRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      if (zxingReaderRef.current) {
        zxingReaderRef.current.reset();
      }
    };
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopScanning();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // Fetch asset by serial number
  const fetchAssetBySerial = async (serialNumber) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/assets/${serialNumber}/`);
      
      if (response.ok) {
        const data = await response.json();
        setAssetData(data);
        setIsAssetModalOpen(true);
      } else if (response.status === 404) {
        // Asset not found, show create modal
        setScannedSerialNo(serialNumber);
        setFormData(prev => ({ ...prev, serial_no: serialNumber }));
        setIsCreateModalOpen(true);
      } else {
        setError(`Fehler beim Abrufen des Assets: ${response.status}`);
      }
    } catch (err) {
      setError("Netzwerkfehler beim Abrufen des Assets");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scan result
  const handleScanResult = (scanResult) => {
    console.log("Scan-Ergebnis:", scanResult);
    setResult(scanResult);
    
    // Treat scan result as serial number and fetch asset
    fetchAssetBySerial(scanResult);
  };

  const prepareScanner = async () => {
    setError(null);
    setResult("");
    setPreparing(true);
    setCountdown(3);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playback started");

              countdownTimerRef.current = setInterval(() => {
                setCountdown((prevCount) => {
                  if (prevCount <= 1) {
                    clearInterval(countdownTimerRef.current);
                    startActualScanning();
                    return 0;
                  }
                  return prevCount - 1;
                });
              }, 1000);
            })
            .catch((err) => {
              setError("Video konnte nicht abgespielt werden: " + err.message);
              setPreparing(false);
            });
        };
      } else {
        throw new Error("Video-Element nicht gefunden");
      }
    } catch (err) {
      setError("Kamera konnte nicht aktiviert werden: " + err.message);
      setPreparing(false);
    }
  };

  const startActualScanning = () => {
    console.log("Starte das eigentliche Scannen im Modus:", scanMode);
    setPreparing(false);
    setScanning(true);

    if (scanMode === "barcode" && zxingReaderRef.current) {
      try {
        zxingReaderRef.current.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result, error) => {
            if (result) {
              console.log("Barcode gefunden:", result.getText());
              handleScanResult(result.getText());
              stopScanning();
            }
            if (error && !(error instanceof TypeError)) {
              console.log("ZXing Error (nicht kritisch):", error);
            }
          }
        );
      } catch (err) {
        console.error("Fehler beim Starten des Barcode-Scanners:", err);
        setError("Fehler beim Starten des Barcode-Scanners: " + err.message);
        stopScanning();
      }
    } else {
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            console.log("Verarbeite Bild:", imageData.width, "x", imageData.height);

            try {
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                  inversionAttempts: "dontInvert",
                }
              );

              if (code) {
                console.log("QR-Code gefunden:", code.data);
                handleScanResult(code.data);
                stopScanning();
              }
            } catch (qrErr) {
              console.error("jsQR Error:", qrErr);
            }
          } catch (drawErr) {
            console.error("Error drawing video to canvas:", drawErr);
          }
        } else {
          console.log("Video not ready yet. readyState:", video.readyState);
        }
      }, 500);
    }
  };

  const stopScanning = () => {
    console.log("Scanning wird gestoppt");

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (scanMode === "barcode" && zxingReaderRef.current) {
      zxingReaderRef.current.reset();
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanning(false);
    setPreparing(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Create new asset
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/assets/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAsset = await response.json();
        console.log("Asset erfolgreich erstellt:", newAsset);
        
        // Show success and close modal
        setIsCreateModalOpen(false);
        setAssetData(newAsset);
        setIsAssetModalOpen(true);
        
        // Reset form
        setFormData({
          serial_no: "",
          device_name: "",
          category: "Laptop",
        });
      } else {
        const errorData = await response.json();
        console.error("Fehler beim Erstellen des Assets:", errorData);
        setError("Fehler beim Erstellen des Assets");
      }
    } catch (error) {
      console.error("Netzwerkfehler:", error);
      setError("Netzwerkfehler beim Erstellen des Assets");
    } finally {
      setIsLoading(false);
    }
  };

  // Close modals
  const closeAssetModal = () => {
    setIsAssetModalOpen(false);
    setAssetData(null);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setScannedSerialNo("");
    setFormData({
      serial_no: "",
      device_name: "",
      category: "Laptop",
    });
  };

  return (
    <div className="enhanced-scanner-container">
      <div className="enhanced-scanner-content">
        <div className="scanner-header">
          <button
            className="back-button"
            onClick={() => navigate("/navigator")}
            aria-label="Zurück"
          >
            <ArrowLeft size={24} />
          </button>
          <h2>QR/Barcode Asset Scanner</h2>
        </div>

        <div className="scanner-mode">
          <button
            className={`mode-button ${scanMode === "qr" ? "active" : ""}`}
            onClick={() => setScanMode("qr")}
            disabled={scanning || preparing}
          >
            QR-Code
          </button>
          <button
            className={`mode-button ${scanMode === "barcode" ? "active" : ""}`}
            onClick={() => setScanMode("barcode")}
            disabled={scanning || preparing}
          >
            Barcode
          </button>
        </div>

        <div className="scanner-preview">
          <video ref={videoRef} className="scanner-video" playsInline />
          <canvas ref={canvasRef} className="scanner-canvas" />

          {(scanning || preparing) && (
            <div className="scanner-overlay">
              <div className="scanner-corner top-left"></div>
              <div className="scanner-corner top-right"></div>
              <div className="scanner-corner bottom-left"></div>
              <div className="scanner-corner bottom-right"></div>
              {scanMode === "barcode" && scanning && (
                <div className="barcode-line"></div>
              )}

              {preparing && (
                <div className="countdown-overlay">
                  <div className="countdown-number">{countdown}</div>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Lade Asset-Daten...</p>
            </div>
          )}
        </div>

        {result && !isAssetModalOpen && !isCreateModalOpen && (
          <div className="result-container">
            <h3>Gescannte Seriennummer:</h3>
            <p className="result-text">{result}</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="button-container">
          {!scanning && !preparing ? (
            <button className="scan-button" onClick={prepareScanner}>
              {scanMode === "qr" ? "QR-Code scannen" : "Barcode scannen"}
            </button>
          ) : (
            <button className="stop-button" onClick={stopScanning}>
              {preparing ? "Vorbereitung abbrechen" : "Scannen stoppen"}
            </button>
          )}
        </div>
      </div>

      {/* Asset Details Modal */}
      {isAssetModalOpen && assetData && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Asset Details</h3>
              <button onClick={closeAssetModal} className="close-button">
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="asset-detail">
                <label>ID:</label>
                <span>{assetData.id}</span>
              </div>
              <div className="asset-detail">
                <label>Seriennummer:</label>
                <span>{assetData.serial_no}</span>
              </div>
              <div className="asset-detail">
                <label>Gerätename:</label>
                <span>{assetData.device_name}</span>
              </div>
              <div className="asset-detail">
                <label>Kategorie:</label>
                <span>{assetData.category}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeAssetModal} className="btn-secondary">
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Asset Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Asset nicht gefunden</h3>
              <button onClick={closeCreateModal} className="close-button">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAsset}>
              <div className="modal-content">
                <div className="info-message">
                  <AlertCircle size={20} />
                  <p>
                    Die Seriennummer <strong>{scannedSerialNo}</strong> wurde nicht gefunden.
                    Möchten Sie ein neues Asset anlegen?
                  </p>
                </div>
                
                <div className="form-group">
                  <label>Seriennummer</label>
                  <input
                    type="text"
                    name="serial_no"
                    value={formData.serial_no}
                    onChange={handleInputChange}
                    className="form-input"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Gerätename</label>
                  <input
                    type="text"
                    name="device_name"
                    value={formData.device_name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Gerätename eingeben"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kategorie</label>
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
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Erstelle..." : "Asset erstellen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQrScanner;