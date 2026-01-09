
import React from 'react';
import { CVData, Language, TemplateType, LocalizedContent } from '../types';

interface Props {
  data: CVData;
  language: Language;
  template: TemplateType;
  id?: string;
  isCoverLetter?: boolean;
  coverLetterContent?: string;
}

export const TemplateRenderer: React.FC<Props> = ({ data, language, template, id, isCoverLetter, coverLetterContent }) => {
  const content: LocalizedContent = language === Language.PT ? data.pt : data.en;
  
  const labels = {
    skills: language === Language.PT ? 'COMPETÊNCIAS' : 'SKILLS',
    education: language === Language.PT ? 'FORMAÇÃO ACADÉMICA' : 'EDUCATION',
    experience: language === Language.PT ? 'EXPERIÊNCIA PROFISSIONAL' : 'PROFESSIONAL EXPERIENCE',
    certifications: language === Language.PT ? 'CERTIFICAÇÕES' : 'CERTIFICATIONS',
    objective: language === Language.PT ? 'PERFIL PROFISSIONAL' : 'PROFESSIONAL PROFILE',
  };

  // Usamos pixels para garantir consistência total na captura do html2canvas
  // 794px = 210mm a 96dpi
  const PAGE_STYLE: React.CSSProperties = {
    width: '794px',
    minHeight: '1123px',
    padding: '60px 50px', // Margens profissionais de aprox 1.5cm a 2cm
    backgroundColor: 'white',
    color: 'black',
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '11pt',
    lineHeight: '1.4',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    position: 'relative',
    WebkitFontSmoothing: 'antialiased',
    letterSpacing: 'normal'
  };

  const SectionTitle = ({ title, showLine = true }: { title: string, showLine?: boolean }) => {
    const isModern = template === TemplateType.MODERN;
    return (
      <div style={{ width: '100%', marginTop: '20px', marginBottom: '10px' }}>
        <h2 style={{ 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          fontSize: '12pt', 
          margin: '0',
          paddingBottom: '4px',
          color: isModern ? '#0369a1' : 'black'
        }}>
          {title}
        </h2>
        {showLine && <div style={{ width: '100%', height: '1.5px', backgroundColor: isModern ? '#0369a1' : 'black' }}></div>}
      </div>
    );
  };

  if (isCoverLetter) {
    return (
      <div id={id} style={PAGE_STYLE}>
         <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '24pt', marginBottom: '8px' }}>
            {data.personal.fullName}
          </h1>
          <div style={{ fontSize: '10pt', color: 'black', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>{data.personal.address}</span>
            <span>|</span>
            <span style={{ fontWeight: 'bold' }}>{data.personal.phone}</span>
            <span>|</span>
            <span style={{ fontWeight: 'bold' }}>{data.personal.email}</span>
          </div>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', lineHeight: '1.6', fontSize: '11.5pt' }}>
          {coverLetterContent}
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    switch(template) {
      case TemplateType.MODERN:
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderBottom: '3px solid #0369a1', paddingBottom: '15px', marginBottom: '25px' }}>
            <div style={{ maxWidth: '70%' }}>
              <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '24pt', margin: '0 0 5px 0', color: '#0369a1' }}>{data.personal.fullName}</h1>
              <p style={{ fontSize: '10.5pt', margin: '0' }}>{data.personal.address}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10.5pt', fontWeight: 'bold' }}>
              <p style={{ margin: '0' }}>{data.personal.email}</p>
              <p style={{ margin: '0' }}>{data.personal.phone}</p>
            </div>
          </div>
        );
      case TemplateType.MINIMALIST:
        return (
          <div style={{ marginBottom: '35px', borderLeft: '12px solid black', paddingLeft: '25px' }}>
            <h1 style={{ fontWeight: 'bold', fontSize: '30pt', margin: '0 0 10px 0', letterSpacing: '-1.5px' }}>{data.personal.fullName}</h1>
            <div style={{ fontSize: '9.5pt', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', gap: '20px' }}>
              <span>{data.personal.email}</span>
              <span>•</span>
              <span>{data.personal.phone}</span>
            </div>
          </div>
        );
      case TemplateType.EXECUTIVE:
      default:
        return (
          <div style={{ textAlign: 'center', marginBottom: '25px', paddingBottom: '10px' }}>
            <h1 style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '26pt', margin: '0 0 10px 0', letterSpacing: '1px' }}>
              {data.personal.fullName}
            </h1>
            <div style={{ 
              fontSize: '11pt', 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '12px',
              textTransform: 'uppercase'
            }}>
              <span>{data.personal.address}</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span style={{ fontWeight: 'bold' }}>{data.personal.phone}</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span style={{ fontWeight: 'bold' }}>{data.personal.email}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div id={id} style={PAGE_STYLE}>
      {renderHeader()}

      <div style={{ flex: '1' }}>
        {content.objective && (
          <section style={{ marginBottom: '15px' }}>
            <SectionTitle title={labels.objective} showLine={template !== TemplateType.MINIMALIST} />
            <p style={{ textAlign: 'justify', margin: '0', fontSize: '11pt' }}>{content.objective}</p>
          </section>
        )}

        {content.experience && content.experience.length > 0 && (
          <section style={{ marginBottom: '15px' }}>
            <SectionTitle title={labels.experience} showLine={template !== TemplateType.MINIMALIST} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {content.experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                    <h3 style={{ 
                      fontWeight: 'bold', 
                      textTransform: 'uppercase', 
                      fontSize: '11.5pt', 
                      margin: '0', 
                      color: template === TemplateType.MODERN ? '#0369a1' : 'black'
                    }}>{exp.company}</h3>
                    <span style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '10.5pt' }}>{exp.period}</span>
                  </div>
                  <div style={{ fontStyle: 'italic', fontWeight: 'bold', marginBottom: '8px', fontSize: '11pt' }}>{exp.role}</div>
                  <p style={{ textAlign: 'justify', margin: '0', fontSize: '11pt' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.education && content.education.length > 0 && (
          <section style={{ marginBottom: '15px' }}>
            <SectionTitle title={labels.education} showLine={template !== TemplateType.MINIMALIST} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {content.education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ flex: '1' }}>
                    <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{edu.institution}</span>
                    <span style={{ margin: '0 8px', opacity: 0.6 }}>—</span>
                    <span style={{ fontStyle: 'italic' }}>{edu.course}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', marginLeft: '15px' }}>{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.skills && content.skills.length > 0 && (
          <section style={{ marginBottom: '15px' }}>
            <SectionTitle title={labels.skills} showLine={template !== TemplateType.MINIMALIST} />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              columnGap: '40px', 
              rowGap: '6px',
              paddingLeft: '15px'
            }}>
               {content.skills.map((skill, i) => (
                 <div key={i} style={{ position: 'relative', fontSize: '11pt' }}>
                    <span style={{ position: 'absolute', left: '-15px', fontWeight: 'bold' }}>•</span>
                    {skill}
                 </div>
               ))}
            </div>
          </section>
        )}

        {content.certifications && content.certifications.length > 0 && (
           <section style={{ marginBottom: '15px' }}>
              <SectionTitle title={labels.certifications} showLine={template !== TemplateType.MINIMALIST} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {content.certifications.map((cert, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11pt' }}>
                    <span><span style={{ fontWeight: 'bold' }}>{cert.institution}:</span> {cert.course}</span>
                    <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>{cert.year}</span>
                  </div>
                ))}
              </div>
           </section>
        )}
      </div>
    </div>
  );
};
