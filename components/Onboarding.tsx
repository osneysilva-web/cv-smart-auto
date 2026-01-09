import React, { useState } from 'react';
import { FileText, Wand2, Globe, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const Onboarding: React.FC<Props> = ({ onStart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <FileText size={64} />,
      color: "text-blue-600",
      bg: "bg-blue-100",
      title: "Upload de Documentos",
      desc: "Envie apenas uma foto do seu Bilhete de Identidade (BI) e dos seus certificados. Nós cuidamos do resto."
    },
    {
      icon: <Wand2 size={64} />,
      color: "text-purple-600",
      bg: "bg-purple-100",
      title: "IA Extrai Tudo",
      desc: "Nossa Inteligência Artificial lê seus documentos, extrai seus dados e organiza as informações profissionalmente."
    },
    {
      icon: <Globe size={64} />,
      color: "text-green-600",
      bg: "bg-green-100",
      title: "CV Automático (PT & EN)",
      desc: "Receba seu currículo pronto, formatado e traduzido para Português e Inglês automaticamente."
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      onStart();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-6">
      
      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <div className="text-center transition-all duration-300 transform">
            <div className={`mx-auto w-32 h-32 rounded-full flex items-center justify-center mb-8 ${slides[currentSlide].bg} ${slides[currentSlide].color}`}>
                {slides[currentSlide].icon}
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-4 px-4 tracking-tight">
                {slides[currentSlide].title}
            </h1>
            
            <p className="text-slate-600 text-lg font-medium leading-relaxed px-4">
                {slides[currentSlide].desc}
            </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="w-full max-w-md mb-8">
         {/* Indicators */}
         <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-10 bg-slate-900' : 'w-2.5 bg-slate-200'}`}
                />
            ))}
         </div>

         <div className="flex gap-4">
            {currentSlide > 0 && (
                <button 
                    onClick={handleBack}
                    className="flex-1 bg-slate-100 border-2 border-slate-200 text-slate-900 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                    Voltar
                </button>
            )}
            
            <button 
                onClick={handleNext}
                className="flex-[2] bg-brand-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
                {currentSlide === slides.length - 1 ? "Começar Agora" : "Próximo"}
                {currentSlide < slides.length - 1 && <ChevronRight size={24} strokeWidth={3} />}
            </button>
         </div>
      </div>
    </div>
  );
};