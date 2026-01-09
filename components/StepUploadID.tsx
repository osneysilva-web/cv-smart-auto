import React, { useState } from 'react';
import { CheckCircle, Loader2, ImagePlus, AlertTriangle, User } from 'lucide-react';
import { uploadUserDocument } from '../services/storageService';
import { PersonalInfo } from '../types';
import imageCompression from 'browser-image-compression';

interface Props {
  onNext: (data: PersonalInfo) => void;
  onBack: () => void;
  userId: string;
  onLoginClick?: () => void;
  isAnalyzing?: boolean; // opcional, se quiser mostrar loading externo
}

export const StepUploadID: React.FC<Props> = ({ onNext, onBack, userId, onLoginClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const compressAndSetFile = async (originalFile: File, type: 'front' | 'back') => {
    console.log(`Tamanho original (${type}):`, (originalFile.size / 1024 / 1024).toFixed(2) + ' MB');

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
    };

    try {
      const compressedFile = await imageCompression(originalFile, options);
      console.log(`Tamanho comprimido (${type}):`, (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB');

      if (type === 'front') setFrontFile(compressedFile);
      else setBackFile(compressedFile);
      setError('');
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
      if (type === 'front') setFrontFile(originalFile);
      else setBackFile(originalFile);
      setError('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await compressAndSetFile(file, type);
    }
  };

  const processFiles = async () => {
    if (!frontFile) {
      setError("Por favor, envie pelo menos a Frente do BI.");
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append("front", frontFile);
    if (backFile) formData.append("back", backFile);

    try {
      // Upload opcional para storage (frente e verso)
      if (userId && frontFile) {
        await uploadUserDocument(frontFile, userId, 'ID_FRONT');
      }
      if (userId && backFile) {
        await uploadUserDocument(backFile, userId, 'ID_BACK');
      }

      // MUDANÇA PRINCIPAL: rota corrigida (ajuste se o nome da pasta em app/api for diferente)
      const response = await fetch("/api/analyze", {  // <-- mudou de "/api/analyze-bi" para "/api/analyze"
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao analisar o BI");
      }

      // Mapeamento correto para o seu PersonalInfo
      const extracted: PersonalInfo = {
        fullName: result.data.nome_completo || '',
        address: '', // não vem do BI, deixa vazio
        phone: '',   // não vem do BI, deixa vazio
        email: '',   // não vem do BI, deixa vazio
        nationality: result.data.nacionalidade || '',
        idNumber: result.data.numero_bi || '',
        birthDate: result.data.data_nascimento || '',
        // linkedin é opcional, não precisa definir
      };

      onNext(extracted);
    } catch (err: any) {
      console.error('Erro ao processar BI:', err);
      setError(err.message || 'Falha ao processar BI. Verifique a qualidade da imagem.');
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({ label, file, onChange }: { label: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative h-40 ${file ? 'border-blue-600 bg-blue-50' : 'border-slate-400 hover:border-blue-500 hover:bg-slate-50 shadow-sm'}`}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
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

      <div className="grid grid-cols-1 gap-4 mb-6">
        <UploadBox label="Frente do BI" file={frontFile} onChange={(e) => handleFileChange(e, 'front')} />
        <UploadBox label="Verso do BI" file={backFile} onChange={(e) => handleFileChange(e, 'back')} />
      </div>

      <p className="text-xs text-slate-500 text-center mb-6">
        Dica: Use boa iluminação e segure firme. A imagem será otimizada automaticamente.
      </p>

      {error && (
        <div className="mb-6 bg-red-600 text-white p-4 rounded-2xl text-xs font-black flex items-center gap-3 shadow-md">
          <AlertTriangle size={20} className="shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={processFiles}
        disabled={!frontFile || loading}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-3 uppercase tracking-tighter"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={24} strokeWidth={3} />
            Analisando com IA...
          </>
        ) : (
          <>
            Analisar Agora
          </>
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">IA processará seus dados com segurança</p>
      </div>
    </div>
  );
};