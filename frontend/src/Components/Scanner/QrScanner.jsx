// QrBarcodeScanner.jsx
import React, { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import "./QrScanner.css";
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

const QrBarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState("qr"); // 'qr' oder 'barcode'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const scanIntervalRef = useRef(null); // Neuer Ref für das Scan-Intervall
  const handleNavigate = () => {
    navigate('/navigator')
  }

  // ZXing Barcode Reader initialisieren
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

  // Aufräumen beim Komponenten-Unmount
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

  const prepareScanner = async () => {
    setError(null);
    setResult("");
    setPreparing(true);
    setCountdown(3);

    try {
      // Kamera aktivieren, unabhängig vom Modus
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Warten, bis das Video vollständig geladen ist
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playback started");

              // 3-Sekunden Countdown starten
              countdownTimerRef.current = setInterval(() => {
                setCountdown((prevCount) => {
                  if (prevCount <= 1) {
                    clearInterval(countdownTimerRef.current);
                    // Nach Countdown den eigentlichen Scan starten
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
      // ZXing Methode für Barcodes
      try {
        zxingReaderRef.current.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result, error) => {
            if (result) {
              console.log("Barcode gefunden:", result.getText());
              setResult(result.getText());
              stopScanning();
            }
            if (error && !(error instanceof TypeError)) {
              // TypeError ignorieren - sind meist nur Frames ohne Barcode
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
      // jsQR Methode für QR-Codes
      // Anstatt requestAnimationFrame verwenden wir ein Intervall
      // Dies gibt mehr Kontrolle über die Scan-Frequenz
      scanIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });

        // Stellen Sie sicher, dass das Video geladen ist
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Größe des Canvas an das Video anpassen
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;

          // Bild vom Video auf den Canvas übertragen
          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // QR-Code mit jsQR erkennen
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            // Debugging: Log die Größe der Image-Daten
            console.log(
              "Verarbeite Bild:",
              imageData.width,
              "x",
              imageData.height
            );

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
                setResult(code.data);
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
      }, 500); // Scan alle 500ms durchführen - bessere Balance zwischen Performance und Zuverlässigkeit
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

  const toggleScanMode = () => {
    if (scanning || preparing) {
      stopScanning();
    }
    setScanMode((prevMode) => (prevMode === "qr" ? "barcode" : "qr"));
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-content">
        <div className="qr-scanner-card">
          <h2>QR/Barcode Scanner</h2>

          <div className="scanner-mode">
            <button
              className={`mode-button ${scanMode === "qr" ? "active" : ""}`}
              onClick={() => setScanMode("qr")}
              disabled={scanning || preparing}
            >
              QR-Code
            </button>
            <button
              className={`mode-button ${
                scanMode === "barcode" ? "active" : ""
              }`}
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
          </div>

          {result && (
            <div className="result-container">
              <h3>Ergebnis:</h3>
              <p className="result-text">{result}</p>
              {result.startsWith("http") && (
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-link"
                >
                  Link öffnen
                </a>
              )}
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
      </div>
    </div>
  );
};

export default QrBarcodeScanner;
