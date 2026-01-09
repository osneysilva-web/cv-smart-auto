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

  // Novo state para loading da análise do BI
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

  // NOVA FUNÇÃO: análise do BI via API route segura
  const handleIDUploaded = async (frontFile: File, backFile: File) => {
    setIsAnalyzingBI(true);

    const formData = new FormData();
    formData.append("front", frontFile);
    formData.append("back", backFile);

    try {
      // MUDANÇA AQUI: rota corrigida (ajuste se o nome da pasta em app/api for diferente)
      const response = await fetch("/api/analyze", {  // <-- mudou de "/api/analyze-bi" para "/api/analyze"
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const extracted: PersonalInfo = {
          fullName: result.data.nome_completo || '',
          number: result.data.numero_bi || '',
          birthDate: result.data.data_nascimento || '',
          validityDate: result.data.data_validade || '',
          emissionPlace: result.data.local_emissao || '',
          nationality: result.data.nacionalidade || '',
        };

        setPersonalData(extracted);
        setStep(AppStep.UPLOAD_CERTS);
      } else {
        alert("Erro ao analisar o BI: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao analisar o BI. Tente novamente.");
    } finally {
      setIsAnalyzingBI(false);
    }
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
            onNext={handleIDUploaded}  // Agora recebe frontFile e backFile
            onBack={() => {}}
            onLoginClick={() => setIsAuthOpen(true)}
            isAnalyzing={isAnalyzingBI}  // opcional: passe loading para o componente
          />
        )}
        {step === AppStep.UPLOAD_CERTS && <StepUploadCerts userId={activeUserId} onNext={(d) => {setCertData(d.education); setExpData(d.experience); setStep(AppStep.REVIEW_DATA)}} onSkip={() => setStep(AppStep.REVIEW_DATA)} onBack={() => setStep(AppStep.UPLOAD_ID)} />}
        {step === AppStep.REVIEW_DATA && personalData && <StepReview initialPersonal={personalData} initialCerts={certData} initialExp={expData} onComplete={handleCVGenerated} onBack={() => setStep(AppStep.UPLOAD_CERTS)} />}
        
        {/* O resto do código (dashboard, carta, etc.) permanece igual */}
        {step === AppStep.DASHBOARD && cvData && (
          // ... todo o código do dashboard que você já tinha (não mudei nada aqui)
          <div className="max-w-7xl mx-auto space-y-12 mt-4 animate-in fade-in duration-500">
            {/* ... o resto exatamente como estava ... */}
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