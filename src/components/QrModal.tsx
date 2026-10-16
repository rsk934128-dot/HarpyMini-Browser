import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, Upload, X, Copy, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onNavigate: (url: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [scannedUrl, setScannedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, currentUrl]);

  // Start Camera Scanning
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Camera access unavailable or blocked. Please upload an image instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCameraActive(false);
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScannedUrl(code.data);
            stopCamera();
            return;
          }
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Scan from Uploaded Image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setScannedUrl(code.data);
          } else {
            alert('No valid QR code detected in this image.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">QR Code Tool</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Generate vs Scan */}
        <div className="flex border-b border-slate-800 p-1 bg-slate-850">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('generate');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'generate' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Share Page via QR
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'scan' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scan QR Code
          </button>
        </div>

        {/* Generate QR Code View */}
        {activeTab === 'generate' && (
          <div className="p-6 text-center space-y-4">
            <p className="text-xs text-slate-400">
              Scan this QR code with your mobile camera to open this webpage on your phone.
            </p>

            {qrDataUrl && (
              <div className="p-4 bg-white rounded-2xl w-fit mx-auto shadow-xl">
                <img src={qrDataUrl} alt="Page QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 truncate max-w-xs mx-auto font-mono">
              {currentUrl}
            </div>

            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 mx-auto ${
                copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        )}

        {/* Scan QR Code View */}
        {activeTab === 'scan' && (
          <div className="p-6 text-center space-y-4">
            {!cameraActive && !scannedUrl && (
              <div className="space-y-4 py-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={startCamera}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold"
                  >
                    <Camera className="w-6 h-6 text-cyan-400" />
                    <span>Open Camera</span>
                  </button>

                  <label className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold cursor-pointer">
                    <Upload className="w-6 h-6 text-indigo-400" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {cameraError && <p className="text-xs text-amber-400">{cameraError}</p>}
              </div>
            )}

            {cameraActive && (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 mx-auto">
                  <video ref={videoRef} className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-cyan-400/60 m-8 rounded-xl pointer-events-none animate-pulse" />
                </div>
                <button
                  onClick={stopCamera}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Stop Camera
                </button>
              </div>
            )}

            {scannedUrl && (
              <div className="p-4 rounded-2xl bg-slate-800 border border-emerald-500/50 space-y-3 text-left">
                <div className="text-xs font-bold text-emerald-400">QR Code Detected!</div>
                <div className="text-xs text-slate-200 font-mono break-all">{scannedUrl}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onNavigate(scannedUrl);
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Navigate to Link</span>
                  </button>
                  <button
                    onClick={() => {
                      setScannedUrl('');
                      startCamera();
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
