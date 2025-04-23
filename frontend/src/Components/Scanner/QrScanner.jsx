// QrBarcodeScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import './QrScanner.css';

const QrBarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState('qr'); // 'qr' oder 'barcode'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const countdownTimerRef = useRef(null);

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
      BarcodeFormat.QR_CODE
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
    };
  }, []);

  const prepareScanner = async () => {
    setError(null);
    setResult('');
    setPreparing(true);
    setCountdown(3);
    
    try {
      // Kamera aktivieren, unabhängig vom Modus
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // 3-Sekunden Countdown starten
        countdownTimerRef.current = setInterval(() => {
          setCountdown(prevCount => {
            if (prevCount <= 1) {
              clearInterval(countdownTimerRef.current);
              // Nach Countdown den eigentlichen Scan starten
              startActualScanning();
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError('Kamera konnte nicht aktiviert werden: ' + err.message);
      setPreparing(false);
    }
  };

  const startActualScanning = () => {
    setPreparing(false);
    setScanning(true);
    
    if (scanMode === 'barcode' && zxingReaderRef.current) {
      // ZXing Methode für Barcodes
      zxingReaderRef.current.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, error) => {
          if (result) {
            setResult(result.getText());
            stopScanning();
          }
          if (error && !(error instanceof TypeError)) {
            // TypeError ignorieren - sind meist nur Frames ohne Barcode
            console.log(error);
          }
        }
      );
    } else {
      // jsQR Methode für QR-Codes
      requestAnimationFrame(scanQRCode);
    }
  };

  const stopScanning = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    if (scanMode === 'barcode' && zxingReaderRef.current) {
      zxingReaderRef.current.reset();
    }
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanning(false);
    setPreparing(false);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    // Stellen Sie sicher, dass das Video geladen ist
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Größe des Canvas an das Video anpassen
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Bild vom Video auf den Canvas übertragen
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // QR-Code mit jsQR erkennen
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",  // Verbessert die Performance
      });
      
      if (code) {
        setResult(code.data);
        stopScanning();
        return;
      }
    }

    // Nächsten Frame scannen
    requestAnimationFrame(scanQRCode);
  };

  const toggleScanMode = () => {
    if (scanning || preparing) {
      stopScanning();
    }
    setScanMode(prevMode => prevMode === 'qr' ? 'barcode' : 'qr');
  };

  return (
    <div className="qr-scanner-container">
      <h2>QR/Barcode Scanner</h2>
      
      <div className="scanner-mode">
        <button 
          className={`mode-button ${scanMode === 'qr' ? 'active' : ''}`}
          onClick={() => setScanMode('qr')}
          disabled={scanning || preparing}
        >
          QR-Code
        </button>
        <button 
          className={`mode-button ${scanMode === 'barcode' ? 'active' : ''}`}
          onClick={() => setScanMode('barcode')}
          disabled={scanning || preparing}
        >
          Barcode
        </button>
      </div>
      
      <div className="scanner-preview">
        <video ref={videoRef} className="scanner-video" />
        <canvas ref={canvasRef} className="scanner-canvas" />
        
        {(scanning || preparing) && (
          <div className="scanner-overlay">
            <div className="scanner-corner top-left"></div>
            <div className="scanner-corner top-right"></div>
            <div className="scanner-corner bottom-left"></div>
            <div className="scanner-corner bottom-right"></div>
            {scanMode === 'barcode' && scanning && <div className="barcode-line"></div>}
            
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
          {result.startsWith('http') && (
            <a href={result} target="_blank" rel="noopener noreferrer" className="result-link">
              Link öffnen
            </a>
          )}
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="button-container">
        {!scanning && !preparing ? (
          <button className="scan-button" onClick={prepareScanner}>
            {scanMode === 'qr' ? 'QR-Code scannen' : 'Barcode scannen'}
          </button>
        ) : (
          <button className="stop-button" onClick={stopScanning}>
            {preparing ? 'Vorbereitung abbrechen' : 'Scannen stoppen'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QrBarcodeScanner;