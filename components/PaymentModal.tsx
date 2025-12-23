
import React from 'react';
import { X, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
  userId: string;
}

export const PaymentModal: React.FC<Props> = ({ onClose, userId }) => {
  // Integramos o userId como external_id para o webhook processar corretamente
  const checkoutUrl = `https://pay.lojou.app/p/Kgs1c?external_id=${userId}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[360px] rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
               <CreditCard size={28} />
            </div>

            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Quase Pronto!</h3>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed mb-6 px-2">
              Seu currículo profissional foi gerado. Realize o pagamento único de <span className="text-blue-600">97 MT</span> para baixar o CV e a Carta de Apresentação em PDF.
            </p>

            <a 
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mb-6"
            >
              Pagar agora para baixar
              <ArrowRight size={16} />
            </a>

            <div className="flex items-center justify-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-50 pt-4">
              <ShieldCheck size={12} />
              Pagamento Seguro via Lojou
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
