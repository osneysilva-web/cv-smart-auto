import React, { useState, useEffect } from 'react';
import { CVData, Language, LocalizedContent } from '../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Props {
  data: CVData;
  language: Language;
  onSave: (updatedData: CVData) => void;
  onClose: () => void;
}

export const EditCVModal: React.FC<Props> = ({ data, language, onSave, onClose }) => {
  // Deep copy to avoid mutating props directly
  const [formData, setFormData] = useState<CVData>(JSON.parse(JSON.stringify(data)));
  
  // Helper to get current content based on language
  const getContent = () => language === Language.PT ? formData.pt : formData.en;
  
  const updateContent = (updater: (content: LocalizedContent) => void) => {
    setFormData(prev => {
      // Deep clone to ensure immutability and trigger re-renders
      const newData = JSON.parse(JSON.stringify(prev));
      const target = language === Language.PT ? newData.pt : newData.en;
      updater(target);
      return newData;
    });
  };

  const updatePersonal = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-xl text-slate-800">
              Editar CV ({language})
            </h3>
            <p className="text-sm text-slate-500">Faça ajustes finos no texto antes de baixar.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Personal Info */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-2">Dados Pessoais (Comum)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="border p-2 rounded focus:ring-2 ring-brand-200 outline-none" 
                value={formData.personal.fullName} 
                onChange={e => updatePersonal('fullName', e.target.value)} 
                placeholder="Nome Completo"
              />
              <input 
                className="border p-2 rounded focus:ring-2 ring-brand-200 outline-none" 
                value={formData.personal.email} 
                onChange={e => updatePersonal('email', e.target.value)} 
                placeholder="Email"
              />
              <input 
                className="border p-2 rounded focus:ring-2 ring-brand-200 outline-none" 
                value={formData.personal.phone} 
                onChange={e => updatePersonal('phone', e.target.value)} 
                placeholder="Telefone"
              />
              <input 
                className="border p-2 rounded focus:ring-2 ring-brand-200 outline-none" 
                value={formData.personal.address} 
                onChange={e => updatePersonal('address', e.target.value)} 
                placeholder="Endereço"
              />
            </div>
          </section>

          {/* Objective */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-2">
              {language === Language.PT ? 'Objetivo Profissional' : 'Professional Objective'}
            </h4>
            <textarea 
              className="w-full border p-3 rounded-lg h-32 text-sm leading-relaxed focus:ring-2 ring-brand-200 outline-none"
              value={content.objective}
              onChange={e => updateContent(c => c.objective = e.target.value)}
            />
          </section>

          {/* Skills */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b pb-2">
              {language === Language.PT ? 'Competências' : 'Skills'}
            </h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {content.skills.map((skill, idx) => (
                <span key={idx} className="bg-slate-100 px-2 py-1 rounded text-sm flex items-center gap-1 group">
                  {skill}
                  <button 
                    onClick={() => updateContent(c => c.skills.splice(idx, 1))}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={12}/>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
                <input 
                    id="newSkillInput"
                    className="border p-2 rounded text-sm flex-1 focus:ring-2 ring-brand-200 outline-none" 
                    placeholder="Adicionar nova competência..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                                updateContent(c => c.skills.push(val));
                                e.currentTarget.value = '';
                            }
                        }
                    }}
                />
                <button 
                    onClick={() => {
                        const input = document.getElementById('newSkillInput') as HTMLInputElement;
                        if (input.value.trim()) {
                            updateContent(c => c.skills.push(input.value.trim()));
                            input.value = '';
                        }
                    }}
                    className="bg-slate-900 text-white px-4 rounded hover:bg-slate-700"
                >
                    <Plus size={16} />
                </button>
            </div>
          </section>

          {/* Experience */}
          <section>
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === Language.PT ? 'Experiência' : 'Experience'}
                </h4>
                <button 
                    onClick={() => updateContent(c => c.experience.push({ role: 'Cargo', company: 'Empresa', period: 'Ano', description: 'Descrição...' }))}
                    className="text-brand-600 text-xs font-bold flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded"
                >
                    <Plus size={14} /> Add
                </button>
             </div>
             <div className="space-y-6">
                {content.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg relative group border border-slate-200">
                        <button 
                            onClick={() => updateContent(c => c.experience.splice(idx, 1))}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input 
                                className="border p-2 rounded text-sm font-bold" 
                                value={exp.role} 
                                onChange={e => updateContent(c => c.experience[idx].role = e.target.value)}
                                placeholder="Cargo"
                            />
                            <input 
                                className="border p-2 rounded text-sm" 
                                value={exp.company} 
                                onChange={e => updateContent(c => c.experience[idx].company = e.target.value)}
                                placeholder="Empresa"
                            />
                             <input 
                                className="border p-2 rounded text-sm col-span-2" 
                                value={exp.period} 
                                onChange={e => updateContent(c => c.experience[idx].period = e.target.value)}
                                placeholder="Período"
                            />
                        </div>
                        <textarea 
                            className="w-full border p-2 rounded text-sm h-24 resize-y"
                            value={exp.description}
                            onChange={e => updateContent(c => c.experience[idx].description = e.target.value)}
                            placeholder="Descrição das atividades"
                        />
                    </div>
                ))}
             </div>
          </section>
          
           {/* Education */}
           <section>
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === Language.PT ? 'Educação' : 'Education'}
                </h4>
                <button 
                    onClick={() => updateContent(c => c.education.push({ course: 'Curso', institution: 'Escola', year: 'Ano' }))}
                    className="text-brand-600 text-xs font-bold flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded"
                >
                    <Plus size={14} /> Add
                </button>
             </div>
             <div className="space-y-3">
                {content.education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg relative group border border-slate-200 grid grid-cols-12 gap-2 items-center">
                        <input 
                            className="col-span-5 border p-2 rounded text-sm font-medium" 
                            value={edu.course} 
                            onChange={e => updateContent(c => c.education[idx].course = e.target.value)}
                        />
                        <input 
                            className="col-span-4 border p-2 rounded text-sm" 
                            value={edu.institution} 
                            onChange={e => updateContent(c => c.education[idx].institution = e.target.value)}
                        />
                        <input 
                            className="col-span-2 border p-2 rounded text-sm" 
                            value={edu.year} 
                            onChange={e => updateContent(c => c.education[idx].year = e.target.value)}
                        />
                        <button 
                            onClick={() => updateContent(c => c.education.splice(idx, 1))}
                            className="col-span-1 flex justify-center text-slate-400 hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 flex items-center gap-2">
                <Save size={18} />
                Salvar Alterações
            </button>
        </div>

      </div>
    </div>
  );
};