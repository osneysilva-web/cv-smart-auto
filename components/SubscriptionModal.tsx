import React, { useState } from 'react';
import { Check, Star, X, Loader2, ShieldCheck } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface Props {
  onClose: () => void;
  onUpgrade: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ onClose, onUpgrade }) => {
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
        onUpgrade();
        setProcessing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        <div className="relative bg-slate-900 text-white p-8 text-center overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
               <Star size={150} />
           </div>
           
           <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
               <X size={24} />
           </button>

           <div className="inline-flex items-center justify-center bg-amber-400 text-amber-900 p-3 rounded-full mb-4 shadow-lg">
                <Star size={24} fill="currentColor" />
           </div>
           <h2 className="text-3xl font-bold mb-2">Seja Premium</h2>
           <p className="text-slate-300">Desbloqueie todo o potencial do seu CV</p>
        </div>

        <div className="p-8">
            <div className="space-y-4 mb-8">
                {[
                    "Templates Exclusivos (Moderno, Minimalista)",
                    "Downloads de PDF Ilimitados",
                    "Geração de Cartas de Apresentação Ilimitadas",
                    "Exportação em Inglês e Português",
                    "Sem Marca d'água"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700">
                        <div className="bg-green-100 text-green-600 rounded-full p-1">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="font-medium text-sm">{item}</span>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-center">
                <span className="text-slate-500 text-sm block mb-1">Plano Mensal</span>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-900">199 MT</span>
                    <span className="text-slate-400">/mês</span>
                </div>
            </div>

            <button 
                onClick={handlePay}
                disabled={processing}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
            >
                {processing ? <Loader2 className="animate-spin" /> : (
                    <>
                        Atualizar Agora
                        <ShieldCheck size={20} className="text-white/80" />
                    </>
                )}
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
                Pagamento seguro. Cancele quando quiser.
            </p>
        </div>
      </div>
    </div>
  );
};