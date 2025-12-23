
import React, { useState } from 'react';
import { CheckCircle, Loader2, ImagePlus, ChevronLeft, ChevronRight, AlertTriangle, User } from 'lucide-react';
import { extractPersonalData } from '../services/aiService';
import { uploadUserDocument } from '../services/storageService';
import { PersonalInfo } from '../types';

interface Props {
  onNext: (data: PersonalInfo) => void;
  onBack: () => void;
  userId: string; 
  onLoginClick?: () => void;
}

export const StepUploadID: React.FC<Props> = ({ onNext, onBack, userId, onLoginClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'front') setFrontFile(e.target.files[0]);
      else setBackFile(e.target.files[0]);
      setError('');
    }
  };

  const processFiles = async () => {
    if (!frontFile) {
        setError("Por favor, envie pelo menos a Frente do BI.");
        return;
    }
    setLoading(true);
    setError('');
    
    try {
      const filesToProcess = [frontFile];
      if (backFile) filesToProcess.push(backFile);

      if (userId) {
        uploadUserDocument(frontFile, userId, 'ID_FRONT');
      }

      const data = await extractPersonalData(filesToProcess);
      onNext(data);
    } catch (err: any) {
      console.error(err);
      setError('Falha ao processar BI. Verifique a qualidade da imagem.');
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ label, file, onChange }: { label: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative h-40 ${file ? 'border-blue-600 bg-blue-50' : 'border-slate-400 hover:border-blue-500 hover:bg-slate-50 shadow-sm'}`}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        {file ? (
           <div className="flex flex-col items-center text-blue-800">
              <CheckCircle size={36} className="mb-2" />
              <p className="font-black text-xs truncate max-w-[120px] uppercase">{file.name}</p>
              <p className="text-[11px] text-blue-700 mt-1 uppercase font-black">{label} OK</p>
           </div>
        ) : (
          <>
            <div className="bg-slate-200 p-3 rounded-full mb-2">
               <ImagePlus className="text-slate-800" size={28} />
            </div>
            <p className="font-black text-slate-900 text-sm uppercase">{label}</p>
            <p className="text-[11px] text-slate-700 mt-1 uppercase font-bold tracking-tight">Toque para selecionar</p>
          </>
        )}
      </div>
  );

  return (
    <div className="max-w-md mx-auto relative bg-white p-10 rounded-[40px] shadow-2xl border border-slate-200 mt-12 animate-in fade-in zoom-in duration-300">
      
      {/* Botão de Login Superior Direito */}
      <button 
        onClick={onLoginClick}
        className="absolute -top-4 -right-4 bg-slate-900 text-white p-3 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center gap-2 z-20 group"
      >
        <User size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden w-0 group-hover:w-24 transition-all duration-300 text-left">Fazer Login</span>
      </button>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-slate-950 mb-2 uppercase tracking-tight">Fotos do BI</h2>
        <div className="h-1.5 w-16 bg-blue-600 rounded-full mb-4 mx-auto"></div>
        <p className="text-slate-800 text-sm font-bold">Capture imagens nítidas da frente e do verso do seu documento.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
          <UploadBox 
            label="Frente do BI" 
            file={frontFile} 
            onChange={(e) => handleFileChange(e, 'front')} 
          />
          <UploadBox 
            label="Verso do BI" 
            file={backFile} 
            onChange={(e) => handleFileChange(e, 'back')} 
          />
      </div>

      {error && (
        <div className="mb-6 bg-red-600 text-white p-4 rounded-2xl text-xs font-black flex items-center gap-3 shadow-md">
           <AlertTriangle size={20} className="shrink-0" />
           {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
            onClick={processFiles}
            disabled={!frontFile || loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-3 uppercase tracking-tighter"
        >
            {loading ? (
            <>
                <Loader2 className="animate-spin" size={24} strokeWidth={3} />
                Lendo Documento...
            </>
            ) : (
                <>
                    Analisar Agora
                    <ChevronRight size={24} strokeWidth={3} />
                </>
            )}
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IA processará seus dados com segurança</p>
      </div>
    </div>
  );
};
