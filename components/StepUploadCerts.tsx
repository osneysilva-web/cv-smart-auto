
import React, { useState } from 'react';
import { Plus, FileBadge, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { extractDocumentsData } from '../services/aiService';
import { uploadUserDocument } from '../services/storageService';
import { EducationItem, ExperienceItem } from '../types';

interface Props {
  onNext: (data: { education: EducationItem[], experience: ExperienceItem[] }) => void;
  onSkip: () => void;
  onBack: () => void;
  userId: string;
}

export const StepUploadCerts: React.FC<Props> = ({ onNext, onSkip, onBack, userId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const processFiles = async () => {
    setLoading(true);
    try {
      if (userId && files.length > 0) {
        files.forEach(f => uploadUserDocument(f, userId, 'CERTIFICATE'));
      }

      const data = await extractDocumentsData(files);
      onNext(data);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao processar documentos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-slate-200 mt-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Diplomas</h2>
        <div className="h-1.5 w-16 bg-blue-600 rounded-full mb-4 mx-auto"></div>
        <p className="text-slate-600 text-sm font-medium">Adicione certificados para enriquecer seu currículo.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
         {files.map((file, i) => (
           <div key={i} className="relative bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-[10px] font-black text-slate-900 flex flex-col items-center gap-2">
              <FileBadge size={24} className="text-blue-600 mb-1" />
              <span className="truncate w-full text-center uppercase">{file.name}</span>
              <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-2 shadow-lg text-white hover:bg-red-600 transition-colors">
                <X size={14} strokeWidth={3} />
              </button>
           </div>
         ))}
         
         <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer min-h-[100px] transition-all group">
            <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
            <Plus className="text-slate-800 mb-1 group-hover:scale-110 transition-transform" size={32} strokeWidth={3} />
            <span className="text-xs font-black uppercase text-slate-900">Adicionar</span>
         </label>
      </div>

      <div className="space-y-4">
        <button
            onClick={processFiles}
            disabled={files.length === 0 || loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-3 uppercase tracking-tighter"
        >
            {loading ? (
                <>
                <Loader2 className="animate-spin" size={24} />
                Lendo Diplomas...
                </>
            ) : (
                <>
                Processar Tudo
                <ChevronRight size={24} strokeWidth={3} />
                </>
            )}
        </button>

        <button 
            onClick={onBack}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all flex justify-center items-center gap-2 text-sm uppercase tracking-widest shadow-md"
        >
            <ChevronLeft size={20} strokeWidth={3} />
            Voltar
        </button>
        
        <button 
            onClick={onSkip}
            className="w-full text-slate-900 text-xs font-black hover:text-blue-700 py-3 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-8"
        >
            Pular / Continuar sem documentos
        </button>
      </div>
    </div>
  );
};
