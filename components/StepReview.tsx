
import React, { useState } from 'react';
import { PersonalInfo, EducationItem, CVData, ExperienceItem } from '../types';
import { generateFullCV } from '../services/aiService';
import { Loader2, Wand2, Plus, AlertCircle, ChevronLeft } from 'lucide-react';

interface Props {
  initialPersonal: PersonalInfo;
  initialCerts: EducationItem[];
  initialExp: ExperienceItem[];
  onComplete: (data: CVData) => void;
  onBack: () => void;
}

export const StepReview: React.FC<Props> = ({ initialPersonal, initialCerts, initialExp, onComplete, onBack }) => {
  // Garantir que email e telefone começam vazios se não preenchidos explicitamente
  const [personal, setPersonal] = useState<PersonalInfo>({
    ...initialPersonal,
    email: initialPersonal.email || "", 
    phone: initialPersonal.phone || ""
  });
  const [education, setEducation] = useState<EducationItem[]>(initialCerts);
  const [experience, setExperience] = useState<ExperienceItem[]>(initialExp); 
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePersonalChange = (f: keyof PersonalInfo, v: string) => {
    setPersonal(prev => ({ ...prev, [f]: v }));
  };

  const addEducation = () => {
    setEducation([...education, { course: '', institution: '', year: '' }]);
  };

  const updateEducation = (idx: number, f: keyof EducationItem, v: string) => {
    const newEd = [...education];
    newEd[idx] = { ...newEd[idx], [f]: v };
    setEducation(newEd);
  };

  const addExperience = () => {
      setExperience([...experience, { role: '', company: '', period: '', description: '' }]);
  };

  const updateExperience = (idx: number, f: keyof ExperienceItem, v: string) => {
      const newExp = [...experience];
      newExp[idx] = { ...newExp[idx], [f]: v };
      setExperience(newExp);
  };

  const handleGenerate = async () => {
    if (!personal.email || !personal.phone) {
      alert("⚠️ E-mail e Telefone são campos obrigatórios para o currículo.");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Iniciando geração de CV com IA...");
      const result = await generateFullCV(personal, initialCerts, education, experience);
      
      if (!result || !result.pt || !result.en) {
          throw new Error("Erro na resposta da IA. A resposta veio incompleta.");
      }

      const finalData: CVData = {
        personal,
        pt: result.pt,
        en: result.en
      };
      
      console.log("CV Gerado com sucesso, redirecionando...");
      onComplete(finalData);
    } catch (e: any) {
      console.error("Erro no processo de geração:", e);
      alert(e.message || "Falha ao gerar o currículo. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isContactMissing = !personal.email || !personal.phone;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-[40px] shadow-2xl border border-slate-200 mb-20 mt-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-950 mb-2 uppercase tracking-tight">Revisão e Contacto</h2>
        <div className="h-2 w-16 bg-blue-600 rounded-full mb-4 mx-auto"></div>
        <p className="text-slate-800 font-bold uppercase text-xs">Preencha seus dados de contacto para finalizar.</p>
      </div>

      {isContactMissing && (
        <div className="mb-8 bg-amber-600 text-white p-5 rounded-2xl flex items-center gap-3 shadow-lg animate-pulse">
          <AlertCircle size={28} className="shrink-0" />
          <span className="font-black text-sm uppercase tracking-tight">E-mail e Telefone são obrigatórios para o currículo!</span>
        </div>
      )}

      <div className="space-y-10">
          <section>
            <h3 className="text-sm font-black uppercase text-blue-800 mb-4 tracking-widest flex items-center gap-2">
                <div className="h-2.5 w-2.5 bg-blue-700 rounded-full"></div>
                Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase ml-2">Nome Completo</label>
                  <input 
                      className="border-2 border-slate-200 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm" 
                      value={personal.fullName}
                      onChange={e => handlePersonalChange('fullName', e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-blue-900 uppercase ml-2">E-mail (Obrigatório)</label>
                  <input 
                      className={`border-2 p-4 rounded-2xl outline-none transition-all font-bold text-slate-900 shadow-sm ${!personal.email ? 'border-amber-400 bg-amber-50 placeholder-slate-400' : 'border-slate-200 bg-white focus:border-blue-500'}`} 
                      placeholder="seu@email.com"
                      value={personal.email}
                      onChange={e => handlePersonalChange('email', e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-blue-900 uppercase ml-2">Contacto (Obrigatório)</label>
                  <input 
                      className={`border-2 p-4 rounded-2xl outline-none transition-all font-bold text-slate-900 shadow-sm ${!personal.phone ? 'border-amber-400 bg-amber-50 placeholder-slate-400' : 'border-slate-200 bg-white focus:border-blue-500'}`} 
                      placeholder="+258 ..."
                      value={personal.phone}
                      onChange={e => handlePersonalChange('phone', e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase ml-2">Endereço</label>
                  <input 
                      className="border-2 border-slate-200 p-4 rounded-2xl bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm" 
                      value={personal.address}
                      onChange={e => handlePersonalChange('address', e.target.value)}
                  />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase text-blue-800 mb-4 tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 bg-blue-700 rounded-full"></div>
                    Formação Académica
                </span>
                <button onClick={addEducation} className="bg-blue-700 text-white p-2.5 rounded-xl shadow-md hover:bg-blue-800 transition-colors"><Plus size={20} strokeWidth={3} /></button>
            </h3>
            <div className="space-y-4">
                {education.map((edu, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <input className="bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Curso" value={edu.course} onChange={e => updateEducation(i, 'course', e.target.value)} />
                        <input className="bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Instituição" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                        <input className="bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 text-center outline-none focus:border-blue-500" placeholder="Ano" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} />
                    </div>
                ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase text-blue-800 mb-4 tracking-widest flex justify-between items-center">
                <span className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 bg-blue-700 rounded-full"></div>
                    Experiência Profissional
                </span>
                <button onClick={addExperience} className="bg-blue-700 text-white p-2.5 rounded-xl shadow-md hover:bg-blue-800 transition-colors"><Plus size={20} strokeWidth={3} /></button>
            </h3>
            <div className="space-y-4">
                {experience.map((exp, i) => (
                    <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input className="bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-black text-slate-900 uppercase outline-none focus:border-blue-500" placeholder="Cargo" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} />
                            <input className="bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Empresa" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                        </div>
                        <input className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500" placeholder="Período" value={exp.period} onChange={e => updateExperience(i, 'period', e.target.value)} />
                        <textarea className="w-full bg-white border-2 border-slate-200 p-3 rounded-xl text-sm font-medium text-slate-900 h-24 resize-none outline-none focus:border-blue-500" placeholder="Descrição das responsabilidades..." value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                    </div>
                ))}
            </div>
          </section>
      </div>
      
      <div className="mt-14 space-y-4 border-t border-slate-100 pt-10">
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-4 uppercase tracking-tighter"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="animate-spin" size={32} strokeWidth={3} />
                    Finalizando CV...
                </>
            ) : (
                <>
                    Gerar Meu Currículo
                    <Wand2 size={32} />
                </>
            )}
        </button>
        <button 
            onClick={onBack} 
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors"
        >
            Voltar
        </button>
      </div>
    </div>
  );
};
