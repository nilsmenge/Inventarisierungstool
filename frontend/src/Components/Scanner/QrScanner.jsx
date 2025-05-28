// EnhancedQrScanner.jsx
// Hauptkomponente für das Scannen von QR-Codes und Barcodes zur Asset-Verwaltung
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr"; // Bibliothek für QR-Code Erkennung
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library"; // Bibliothek für Barcode Erkennung
import "./QrScanner.css";
import {
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react"; // Icon-Bibliothek

const QrBarcodeScanner = () => {
  // Navigation Hook für das Wechseln zwischen Seiten
  const navigate = useNavigate();
  
  // ===== STATE MANAGEMENT =====
  // Scanner-Status States
  const [scanning, setScanning] = useState(false); // Ob gerade gescannt wird
  const [preparing, setPreparing] = useState(false); // Ob Scanner vorbereitet wird
  const [countdown, setCountdown] = useState(3); // Countdown vor dem Scannen
  const [result, setResult] = useState(""); // Scan-Ergebnis
  const [error, setError] = useState(null); // Fehlermeldungen
  const [scanMode, setScanMode] = useState("qr"); // "qr" oder "barcode" Modus
  
  // Modal States - für verschiedene Popup-Fenster
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false); // Asset-Details anzeigen
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Neues Asset erstellen
  const [assetData, setAssetData] = useState(null); // Gefundene Asset-Daten
  const [scannedSerialNo, setScannedSerialNo] = useState(""); // Gescannte Seriennummer
  const [isLoading, setIsLoading] = useState(false); // Lade-Status für API-Calls
  
  // Formulardaten für das Erstellen neuer Assets
  const [formData, setFormData] = useState({
    serial_no: "",
    device_name: "",
    category: "Laptop",
    device_status: "Aktiv",
  });

  // ===== REF HOOKS =====
  // Refs für direkte DOM-Manipulation und Zugriff auf Browser-APIs
  const videoRef = useRef(null); // Video-Element für Kamera-Stream
  const canvasRef = useRef(null); // Canvas für Bildverarbeitung
  const streamRef = useRef(null); // MediaStream-Referenz
  const zxingReaderRef = useRef(null); // ZXing Barcode-Reader Instanz
  const countdownTimerRef = useRef(null); // Timer für Countdown
  const scanIntervalRef = useRef(null); // Interval für kontinuierliches Scannen

  // ===== INITIALIZATION EFFECTS =====
  
  // ZXing Barcode Reader initialisieren
  useEffect(() => {
    const hints = new Map();
    // Unterstützte Barcode-Formate definieren
    const formats = [
      BarcodeFormat.CODE_128,    // Häufig in Industrie verwendet
      BarcodeFormat.CODE_39,     // Alphanumerischer Barcode
      BarcodeFormat.EAN_13,      // Europäische Artikelnummer (13-stellig)
      BarcodeFormat.EAN_8,       // Europäische Artikelnummer (8-stellig)
      BarcodeFormat.UPC_A,       // Universal Product Code
      BarcodeFormat.UPC_E,       // Kompakte Version von UPC-A
      BarcodeFormat.QR_CODE,     // QR-Codes
    ];

    // Hints für bessere Erkennung setzen
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    zxingReaderRef.current = new BrowserMultiFormatReader(hints);

    // Cleanup-Funktion: Reader zurücksetzen beim Unmount
    return () => {
      if (zxingReaderRef.current) {
        zxingReaderRef.current.reset();
      }
    };
  }, []);

  // Cleanup beim Verlassen der Komponente
  useEffect(() => {
    return () => {
      stopScanning(); // Scanner stoppen
      // Alle Timer löschen
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, []);

  // ===== API FUNCTIONS =====
  
  // Asset anhand der Seriennummer von der API abrufen
  const fetchAssetBySerial = async (serialNumber) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/${serialNumber}/`);
      
      if (response.ok) {
        // Asset gefunden - Daten anzeigen
        const data = await response.json();
        setAssetData(data);
        setIsAssetModalOpen(true);
      } else if (response.status === 404) {
        // Asset nicht gefunden - Modal zum Erstellen anzeigen
        setScannedSerialNo(serialNumber);
        setFormData(prev => ({ ...prev, serial_no: serialNumber }));
        setIsCreateModalOpen(true);
      } else {
        // Anderer HTTP-Fehler
        setError(`Fehler beim Abrufen des Assets: ${response.status}`);
      }
    } catch (err) {
      // Netzwerk- oder andere Fehler
      setError("Netzwerkfehler beim Abrufen des Assets");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SCAN HANDLING =====
  
  // Verarbeitung des Scan-Ergebnisses
  const handleScanResult = (scanResult) => {
    console.log("Scan-Ergebnis:", scanResult);
    setResult(scanResult);
    
    // Scan-Ergebnis als Seriennummer behandeln und Asset suchen
    fetchAssetBySerial(scanResult);
  };

  // Scanner vorbereiten - Kamera aktivieren und Countdown starten
  const prepareScanner = async () => {
    // Fehler und Ergebnisse zurücksetzen
    setError(null);
    setResult("");
    setPreparing(true);
    setCountdown(3);

    try {
      // Kamera-Zugriff anfordern (bevorzugt rückseitige Kamera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        // Video-Stream an Video-Element binden
        videoRef.current.srcObject = stream;

        // Warten bis Video-Metadaten geladen sind
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playback started");

              // 3-Sekunden Countdown starten
              countdownTimerRef.current = setInterval(() => {
                setCountdown((prevCount) => {
                  if (prevCount <= 1) {
                    // Countdown beendet - echtes Scannen starten
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
      // Kamera-Zugriff fehlgeschlagen
      setError("Kamera konnte nicht aktiviert werden: " + err.message);
      setPreparing(false);
    }
  };

  // Das eigentliche Scannen starten
  const startActualScanning = () => {
    console.log("Starte das eigentliche Scannen im Modus:", scanMode);
    setPreparing(false);
    setScanning(true);

    if (scanMode === "barcode" && zxingReaderRef.current) {
      // BARCODE-MODUS: ZXing Library verwenden
      try {
        zxingReaderRef.current.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result, error) => {
            if (result) {
              // Barcode erfolgreich erkannt
              console.log("Barcode gefunden:", result.getText());
              handleScanResult(result.getText());
              stopScanning();
            }
            // Fehler ignorieren die nicht kritisch sind (TypeError ist normal)
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
      // QR-CODE-MODUS: jsQR Library mit Canvas verwenden
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        // Prüfen ob genug Video-Daten verfügbar sind
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Canvas-Größe an Video anpassen
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          try {
            // Video-Frame auf Canvas zeichnen
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Bilddaten für QR-Code Analyse extrahieren
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            console.log("Verarbeite Bild:", imageData.width, "x", imageData.height);

            try {
              // QR-Code im Bild suchen
              const code = jsQR(
                imageData.data,
                imageData.width,
                imageData.height,
                {
                  inversionAttempts: "dontInvert", // Performance-Optimierung
                }
              );

              if (code) {
                // QR-Code gefunden
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
      }, 500); // Alle 500ms ein Frame analysieren
    }
  };

  // Scanner komplett stoppen und alle Ressourcen freigeben
  const stopScanning = () => {
    console.log("Scanning wird gestoppt");

    // Alle Timer stoppen
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    // ZXing Reader zurücksetzen
    if (scanMode === "barcode" && zxingReaderRef.current) {
      zxingReaderRef.current.reset();
    }

    // Kamera-Stream stoppen
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Video-Element zurücksetzen
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // States zurücksetzen
    setScanning(false);
    setPreparing(false);
  };

  // ===== FORM HANDLING =====
  
  // Eingabefelder im Formular verwalten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Neues Asset in der Datenbank erstellen
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://inventarisierungstool-9a0bf864c2b7.herokuapp.com/api/assets/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Asset erfolgreich erstellt
        const newAsset = await response.json();
        console.log("Asset erfolgreich erstellt:", newAsset);
        
        // Erfolg anzeigen und Modal schließen
        setIsCreateModalOpen(false);
        setAssetData(newAsset);
        setIsAssetModalOpen(true);
        
        // Formular zurücksetzen
        setFormData({
          serial_no: "",
          device_name: "",
          category: "Laptop",
          device_status: "Aktiv",
        });
      } else {
        // API-Fehler beim Erstellen
        const errorData = await response.json();
        console.error("Fehler beim Erstellen des Assets:", errorData);
        setError("Fehler beim Erstellen des Assets");
      }
    } catch (error) {
      // Netzwerkfehler
      console.error("Netzwerkfehler:", error);
      setError("Netzwerkfehler beim Erstellen des Assets");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== MODAL MANAGEMENT =====
  
  // Asset-Details Modal schließen
  const closeAssetModal = () => {
    setIsAssetModalOpen(false);
    setAssetData(null);
  };

  // Asset-Erstellungs Modal schließen
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setScannedSerialNo("");
    setFormData({
      serial_no: "",
      device_name: "",
      category: "Laptop",
      device_status: "Aktiv",
    });
  };

  // ===== RENDER =====
  return (
    <div className="enhanced-scanner-container">
      <div className="enhanced-scanner-content">
        {/* Header mit Zurück-Button und Titel */}
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

        {/* Scanner-Modus Auswahl (QR-Code oder Barcode) */}
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

        {/* Scanner-Vorschau mit Video und Canvas */}
        <div className="scanner-preview">
          {/* Video-Element für Kamera-Stream */}
          <video ref={videoRef} className="scanner-video" playsInline />
          {/* Canvas für Bildverarbeitung (versteckt) */}
          <canvas ref={canvasRef} className="scanner-canvas" />

          {/* Overlay während des Scannens */}
          {(scanning || preparing) && (
            <div className="scanner-overlay">
              {/* Scanner-Rahmen in den Ecken */}
              <div className="scanner-corner top-left"></div>
              <div className="scanner-corner top-right"></div>
              <div className="scanner-corner bottom-left"></div>
              <div className="scanner-corner bottom-right"></div>
              
              {/* Animierte Linie für Barcode-Modus */}
              {scanMode === "barcode" && scanning && (
                <div className="barcode-line"></div>
              )}

              {/* Countdown-Anzeige während der Vorbereitung */}
              {preparing && (
                <div className="countdown-overlay">
                  <div className="countdown-number">{countdown}</div>
                </div>
              )}
            </div>
          )}

          {/* Lade-Overlay während API-Calls */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Lade Asset-Daten...</p>
            </div>
          )}
        </div>

        {/* Scan-Ergebnis anzeigen (wenn kein Modal offen) */}
        {result && !isAssetModalOpen && !isCreateModalOpen && (
          <div className="result-container">
            <h3>Gescannte Seriennummer:</h3>
            <p className="result-text">{result}</p>
          </div>
        )}

        {/* Fehlermeldungen anzeigen */}
        {error && <p className="error-message">{error}</p>}

        {/* Haupt-Aktionsbuttons */}
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

      {/* ===== MODAL: ASSET DETAILS ===== */}
      {/* Modal zur Anzeige von Asset-Details */}
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
              {/* Asset-Informationen anzeigen */}
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
              <div className="asset-detail">
                <label>Status:</label>
                <span>{assetData.device_status}</span>
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

      {/* ===== MODAL: NEUES ASSET ERSTELLEN ===== */}
      {/* Modal für das Erstellen eines neuen Assets */}
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
                {/* Hinweis-Nachricht */}
                <div className="info-message">
                  <AlertCircle size={20} />
                  <p>
                    Die Seriennummer <strong>{scannedSerialNo}</strong> wurde nicht gefunden.
                    Möchten Sie ein neues Asset anlegen?
                  </p>
                </div>
                
                {/* Formularfelder */}
                <div className="form-group">
                  <label>Seriennummer</label>
                  <input
                    type="text"
                    name="serial_no"
                    value={formData.serial_no}
                    onChange={handleInputChange}
                    className="form-input"
                    readOnly // Nur lesbar, da von Scan übernommen
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

                <div className="form-group">
                  <label>Status</label>
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
              </div>
              
              {/* Modal Aktionsbuttons */}
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

export default QrBarcodeScanner;