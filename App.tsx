import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { StepUploadID } from './components/StepUploadID';
import { StepUploadCerts } from './components/StepUploadCerts';
import { StepReview } from './components/StepReview';
import { TemplateRenderer } from './components/TemplateRenderer';
import { EditCVModal } from './components/EditCVModal';
import { PaymentModal } from './components/PaymentModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AuthLogin } from './components/AuthLogin';
import { AuthRegister } from './components/AuthRegister';
import { AdminDashboard } from './components/AdminDashboard';
import { AppStep, PersonalInfo, EducationItem, ExperienceItem, CVData, Language, TemplateType } from './types';
import { Download, Loader2, Pencil, LayoutTemplate, LogOut, Share2, Wand2, Sparkles, FileText, User, Globe, Layout, CheckCircle } from 'lucide-react';
import { generateCoverLetter } from './services/aiService';
import { getCurrentUser, signOut, ADMIN_EMAIL } from './services/authService';
import { saveCV, getUserCV, registerMember, checkPaymentStatus } from './services/databaseService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App = () => {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [guestId] = useState(() => {
    const stored = localStorage.getItem('cv_guest_id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('cv_guest_id', newId);
    return newId;
  });

  const activeUserId = user?.id || guestId;
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_ID);
  
  const [personalData, setPersonalData] = useState<PersonalInfo | null>(null);
  const [certData, setCertData] = useState<EducationItem[]>([]);
  const [expData, setExpData] = useState<ExperienceItem[]>([]); 
  const [cvData, setCvData] = useState<CVData | null>(null);
  
  const [currentLang, setCurrentLang] = useState<Language>(Language.PT);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>(TemplateType.EXECUTIVE);
  const [showEditCVModal, setShowEditCVModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [generatedCoverLetterText, setGeneratedCoverLetterText] = useState('');
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);

  // Estado para loading visual (opcional)
  const [isAnalyzingBI, setIsAnalyzingBI] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email === ADMIN_EMAIL) {
          setStep(AppStep.ADMIN_DASHBOARD);
        } else {
          try {
            const existingCV = await getUserCV(currentUser.id);
            if (existingCV) {
              setCvData(existingCV);
              setPersonalData(existingCV.personal);
              setStep(AppStep.DASHBOARD);
            }
          } catch(e) {}
        }
      }
      setSessionLoading(false);
    };
    checkSession();
  }, []);

  const handleAuthSuccess = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    setUser(currentUser);
    setIsAuthOpen(false);
    if (currentUser.email === ADMIN_EMAIL) {
      setStep(AppStep.ADMIN_DASHBOARD);
    } else {
      const existingCV = await getUserCV(currentUser.id);
      if (existingCV) {
        setCvData(existingCV);
        setPersonalData(existingCV.personal);
        setStep(AppStep.DASHBOARD);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setStep(AppStep.UPLOAD_ID);
  };

  // VERSÃO CORRIGIDA E SIMPLIFICADA: pula análise automática por enquanto
  const handleIDUploaded = async (frontFile: File, backFile: File) => {
    setIsAnalyzingBI(true);

    // Simula um pequeno delay para dar feedback visual
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mensagem amigável informando que a análise automática será adicionada em breve
    alert("✅ Imagens do Bilhete de Identidade recebidas e comprimidas com sucesso!\n\nA análise automática com IA está em fase final de desenvolvimento.\nProsseguindo para a próxima etapa: upload de certificados e experiências.");

    // Prossegue direto para upload de certificados (sem tentar análise)
    setStep(AppStep.UPLOAD_CERTS);
    setIsAnalyzingBI(false);
  };

  const handleCVGenerated = (data: CVData) => {
    setCvData(data);
    setStep(AppStep.DASHBOARD);
    saveCV(data, activeUserId).catch(err => console.error("Erro ao salvar CV:", err));
  };

  const handleDownloadClick = async (elementId: string, fileName: string) => {
    const hasPaid = await checkPaymentStatus(activeUserId);
    if (hasPaid) {
      downloadPDF(elementId, fileName);
    } else {
      setShowPaymentModal(true);
    }
  };

  const downloadPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    setIsDownloading(true);
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (sessionLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (step === AppStep.ADMIN_DASHBOARD) return <AdminDashboard onLogout={handleLogout} />;
  if (isAuthOpen) {
    return authView === 'login' ? (
      <AuthLogin onLoginSuccess={handleAuthSuccess} onGoToRegister={() => setAuthView('register')} onCancel={() => setIsAuthOpen(false)} />
    ) : (
      <AuthRegister onRegisterSuccess={handleAuthSuccess} onGoToLogin={() => setAuthView('login')} onCancel={() => setIsAuthOpen(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PWAInstallPrompt />
      
      <header className="bg-white border-b sticky top-0 z-50 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-black text-xl text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
            <Wand2 className="text-blue-600" /> CV SMART
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-[10px] font-black uppercase text-slate-400">{user.email}</span>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Sair"><LogOut size={20}/></button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                <User size={14} /> Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20">
        {step === AppStep.UPLOAD_ID && (
          <StepUploadID 
            userId={activeUserId} 
            onNext={handleIDUploaded}
            onBack={() => {}}
            onLoginClick={() => setIsAuthOpen(true)}
            isAnalyzing={isAnalyzingBI}
          />
        )}
        {step === AppStep.UPLOAD_CERTS && <StepUploadCerts userId={activeUserId} onNext={(d) => {setCertData(d.education); setExpData(d.experience); setStep(AppStep.REVIEW_DATA)}} onSkip={() => setStep(AppStep.REVIEW_DATA)} onBack={() => setStep(AppStep.UPLOAD_ID)} />}
        {step === AppStep.REVIEW_DATA && personalData && <StepReview initialPersonal={personalData} initialCerts={certData} initialExp={expData} onComplete={handleCVGenerated} onBack={() => setStep(AppStep.UPLOAD_CERTS)} />}
        
        {step === AppStep.DASHBOARD && cvData && (
          <div className="max-w-7xl mx-auto space-y-12 mt-4 animate-in fade-in duration-500">
            <div className="fixed -left-[10000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
              <TemplateRenderer id="cv-capture" data={cvData} language={currentLang} template={currentTemplate} />
              {generatedCoverLetterText && (
                <TemplateRenderer id="cl-capture" data={cvData} language={currentLang} template={currentTemplate} isCoverLetter={true} coverLetterContent={generatedCoverLetterText} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tighter flex items-center gap-2 mb-6 border-b pb-4">
                    <LayoutTemplate className="text-blue-600" size={24}/> Personalizar
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Idioma do Currículo</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl">
                        <button onClick={() => setCurrentLang(Language.PT)} className={`py-3 rounded-xl font-black text-xs uppercase transition-all ${currentLang === Language.PT ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Português</button>
                        <button onClick={() => setCurrentLang(Language.EN)} className={`py-3 rounded-xl font-black text-xs uppercase transition-all ${currentLang === Language.EN ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>English</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Estilo Visual</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: TemplateType.EXECUTIVE, label: 'Executivo' },
                          { id: TemplateType.MODERN, label: 'Moderno' },
                          { id: TemplateType.MINIMALIST, label: 'Minimal' },
                          { id: TemplateType.JUNIOR, label: 'Júnior' }
                        ].map(t => (
                          <button key={t.id} onClick={() => setCurrentTemplate(t.id)} className={`py-3 px-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all text-center ${currentTemplate === t.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>{t.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 space-y-3">
                      <button onClick={() => setShowEditCVModal(true)} className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-sm">
                        <Pencil size={16}/> Editar Informações
                      </button>
                      <button 
                        onClick={() => handleDownloadClick('cv-capture', `CV_${cvData.personal.fullName.replace(/\s/g, '_')}`)} 
                        disabled={isDownloading}
                        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="animate-spin" size={20}/> : <Download size={20}/>}
                        {isDownloading ? 'Processando...' : 'Baixar PDF Agora'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-slate-200 p-4 md:p-12 rounded-[48px] overflow-auto flex justify-center shadow-inner border-4 border-white min-h-[700px]">
                  <div className="origin-top transform scale-[0.4] sm:scale-[0.55] md:scale-[0.75] lg:scale-[1] shadow-2xl transition-all duration-300">
                    <TemplateRenderer data={cvData} language={currentLang} template={currentTemplate} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-16 rounded-[48px] shadow-2xl border border-slate-100">
              <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center bg-blue-50 text-blue-600 p-4 rounded-3xl mb-6"><Sparkles size={40} /></div>
                <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter mb-4">Carta de Apresentação</h2>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">IA gera uma carta personalizada para a empresa que você deseja</p>
              </div>
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nome da Empresa</label>
                    <input className="w-full border-2 border-slate-200 p-5 rounded-3xl bg-slate-50 outline-none font-bold text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: Google, Banco ABC..." value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Cargo Pretendido</label>
                    <input className="w-full border-2 border-slate-200 p-5 rounded-3xl bg-slate-50 outline-none font-bold text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white transition-all shadow-sm" placeholder="Ex: Gestor de RH, Motorista..." value={targetPosition} onChange={e => setTargetPosition(e.target.value)} />
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if(!companyName || !targetPosition) return alert("Preencha a empresa e o cargo.");
                    setIsGeneratingCL(true);
                    const text = await generateCoverLetter(cvData, companyName, targetPosition, currentLang);
                    setGeneratedCoverLetterText(text);
                    setIsGeneratingCL(false);
                  }}
                  disabled={isGeneratingCL || !companyName || !targetPosition}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-black disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-tighter transition-all active:scale-95"
                >
                  {isGeneratingCL ? <Loader2 className="animate-spin" size={28}/> : <Wand2 size={28}/>}
                  {isGeneratingCL ? 'Gerando com IA...' : 'Criar Carta Personalizada'}
                </button>
                {generatedCoverLetterText && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700">
                    <div className="bg-slate-50 p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-inner relative">
                      <p className="whitespace-pre-wrap text-black leading-relaxed text-lg text-justify" style={{ fontFamily: '"Times New Roman", Times, serif' }}>{generatedCoverLetterText}</p>
                      <div className="absolute top-6 right-6 opacity-10"><FileText size={80} /></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleDownloadClick('cl-capture', `Carta_${cvData.personal.fullName.replace(/\s/g, '_')}`)} 
                        disabled={isDownloading}
                        className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="animate-spin" size={20}/> : <Download size={20}/>}
                        {isDownloading ? 'Processando...' : 'Baixar Carta (PDF)'}
                      </button>
                      <button onClick={() => setGeneratedCoverLetterText('')} className="bg-slate-200 text-slate-600 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all">Limpar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-8 text-center border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desenvolvido por osneysilvamkt@gmail.com</p>
      </footer>

      {showEditCVModal && cvData && <EditCVModal data={cvData} language={currentLang} onSave={(d) => {setCvData(d); setShowEditCVModal(false)}} onClose={() => setShowEditCVModal(false)} />}
      {showPaymentModal && <PaymentModal userId={activeUserId} onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
};

export default App;