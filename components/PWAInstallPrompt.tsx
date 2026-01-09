
import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download, Share } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Evento para Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });

    // Mostrar para iOS se não estiver em modo standalone
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setShowPrompt(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] p-3 animate-in slide-in-from-top duration-500">
      <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between p-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-tighter leading-none mb-1">Instalar CV Smart</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Aceda mais rápido no menu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isIOS ? (
            <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter">
              Tap <Share size={12} className="inline mx-1" /> then "Add to Home Screen"
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Instalar
            </button>
          )}
          <button onClick={() => setShowPrompt(false)} className="p-2 text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
