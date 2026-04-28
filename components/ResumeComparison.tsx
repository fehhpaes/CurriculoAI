'use client';

import { useState } from 'react';
import type { OptimizedResume } from '@/lib/gemini';
import styles from './ResumeComparison.module.css';

interface ResumeComparisonProps {
  original: string;
  optimized: OptimizedResume;
  onUpdate?: (resume: OptimizedResume) => void;
}

type Tab = 'resumo' | 'experiencias' | 'habilidades' | 'educacao' | 'melhorias';

export default function ResumeComparison({ original, optimized, onUpdate }: ResumeComparisonProps) {
  const [activeTab, setActiveTab] = useState<Tab>('resumo');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<OptimizedResume>(optimized);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(draft);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(optimized);
    setIsEditing(false);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'resumo', label: 'Resumo', icon: '👤' },
    { id: 'experiencias', label: 'Experiências', icon: '💼' },
    { id: 'habilidades', label: 'Habilidades', icon: '⚡' },
    { id: 'educacao', label: 'Educação', icon: '🎓' },
    { id: 'melhorias', label: 'Melhorias', icon: '✅' },
  ];

  return (
    <section className={styles.section} id="resume-comparison" aria-label="Comparação de currículo">
      {/* Header info */}
      <div className={styles.header}>
        <div className={styles.nameBlock}>
          {isEditing ? (
            <div className={styles.editGroup}>
              <input 
                className={styles.inputTitle} 
                value={draft.nome} 
                onChange={(e) => setDraft({...draft, nome: e.target.value})}
                placeholder="Nome completo"
              />
              <input 
                className={styles.inputSub} 
                value={draft.cargo} 
                onChange={(e) => setDraft({...draft, cargo: e.target.value})}
                placeholder="Cargo"
              />
            </div>
          ) : (
            <>
              <h2 className={styles.name}>{optimized.nome}</h2>
              {optimized.cargo && <p className={styles.role}>{optimized.cargo}</p>}
            </>
          )}

          <div className={styles.contacts}>
            {isEditing ? (
              <>
                <input className={styles.inputSmall} value={draft.contato?.email || ''} onChange={(e) => setDraft({...draft, contato: {...draft.contato, email: e.target.value}})} placeholder="Email" />
                <input className={styles.inputSmall} value={draft.contato?.telefone || ''} onChange={(e) => setDraft({...draft, contato: {...draft.contato, telefone: e.target.value}})} placeholder="Telefone" />
                <input className={styles.inputSmall} value={draft.contato?.cidade || ''} onChange={(e) => setDraft({...draft, contato: {...draft.contato, cidade: e.target.value}})} placeholder="Cidade" />
                <input className={styles.inputSmall} value={draft.contato?.linkedin || ''} onChange={(e) => setDraft({...draft, contato: {...draft.contato, linkedin: e.target.value}})} placeholder="LinkedIn" />
              </>
            ) : (
              <>
                {optimized.contato?.email && <span className={styles.contact}>✉ {optimized.contato.email}</span>}
                {optimized.contato?.telefone && <span className={styles.contact}>📞 {optimized.contato.telefone}</span>}
                {optimized.contato?.cidade && <span className={styles.contact}>📍 {optimized.contato.cidade}</span>}
                {optimized.contato?.linkedin && <span className={styles.contact}>in {optimized.contato.linkedin}</span>}
              </>
            )}
          </div>
        </div>
        <div className={styles.actionBlock}>
          {isEditing ? (
            <div className={styles.editActions}>
              <button onClick={handleCancel} className={styles.btnCancel}>Cancelar</button>
              <button onClick={handleSave} className={styles.btnSave}>Salvar Edições</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>
              ✏️ Modo Edição
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Seções do currículo">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {/* RESUMO */}
        {activeTab === 'resumo' && (
          <div id="tab-panel-resumo" role="tabpanel" aria-labelledby="tab-resumo" className={styles.panel}>
            <div className={styles.twoCol}>
              <div className={styles.colOriginal}>
                <div className={styles.colHeader}>
                  <span className={styles.colBadgeOriginal}>Original</span>
                </div>
                <div className={styles.textBlock}>
                  <pre className={styles.originalText}>{original.substring(0, 800)}...</pre>
                </div>
              </div>

              <div className={styles.colOptimized}>
                <div className={styles.colHeader}>
                  <span className={styles.colBadgeOptimized}>✨ Otimizado</span>
                </div>
                <div className={styles.textBlock}>
                  {isEditing ? (
                    <textarea 
                      className={styles.textareaFull} 
                      value={draft.resumoProfissional} 
                      onChange={(e) => setDraft({...draft, resumoProfissional: e.target.value})}
                      rows={8}
                    />
                  ) : (
                    <p className={styles.optimizedText}>{optimized.resumoProfissional}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIÊNCIAS */}
        {activeTab === 'experiencias' && (
          <div id="tab-panel-experiencias" role="tabpanel" aria-labelledby="tab-experiencias" className={styles.panel}>
            {draft.experiencias && draft.experiencias.length > 0 ? (
              <div className={styles.experienceList}>
                {draft.experiencias.map((exp, i) => (
                  <div key={i} className={styles.expCard} id={`experience-${i}`}>
                    {isEditing ? (
                      <div className={styles.editForm}>
                        <input className={styles.inputMedium} value={exp.cargo} onChange={(e) => {
                          const newExp = [...draft.experiencias];
                          newExp[i].cargo = e.target.value;
                          setDraft({...draft, experiencias: newExp});
                        }} placeholder="Cargo" />
                        <input className={styles.inputMedium} value={exp.empresa} onChange={(e) => {
                          const newExp = [...draft.experiencias];
                          newExp[i].empresa = e.target.value;
                          setDraft({...draft, experiencias: newExp});
                        }} placeholder="Empresa" />
                        <input className={styles.inputSmall} value={exp.periodo} onChange={(e) => {
                          const newExp = [...draft.experiencias];
                          newExp[i].periodo = e.target.value;
                          setDraft({...draft, experiencias: newExp});
                        }} placeholder="Período" />
                        <textarea className={styles.textareaSmall} value={exp.descricao} onChange={(e) => {
                          const newExp = [...draft.experiencias];
                          newExp[i].descricao = e.target.value;
                          setDraft({...draft, experiencias: newExp});
                        }} placeholder="Descrição" rows={4} />
                      </div>
                    ) : (
                      <>
                        <div className={styles.expHeader}>
                          <div>
                            <h3 className={styles.expCargo}>{exp.cargo}</h3>
                            <p className={styles.expEmpresa}>{exp.empresa}</p>
                          </div>
                          {exp.periodo && <span className={styles.expPeriodo}>{exp.periodo}</span>}
                        </div>
                        <p className={styles.expDesc}>{exp.descricao}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMsg}>Nenhuma experiência identificada no currículo.</p>
            )}
          </div>
        )}

        {/* HABILIDADES */}
        {activeTab === 'habilidades' && (
          <div id="tab-panel-habilidades" role="tabpanel" aria-labelledby="tab-habilidades" className={styles.panel}>
            {isEditing ? (
              <div className={styles.editSection}>
                <p className={styles.editHint}>Edite as habilidades separadas por vírgula:</p>
                <textarea 
                  className={styles.textareaFull} 
                  value={draft.habilidades.join(', ')} 
                  onChange={(e) => setDraft({...draft, habilidades: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  rows={4}
                />
              </div>
            ) : (
              draft.habilidades && draft.habilidades.length > 0 ? (
                <div className={styles.skillsGrid}>
                  {draft.habilidades.map((skill, i) => (
                    <span key={i} className={styles.skillBadge} id={`skill-${i}`}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMsg}>Nenhuma habilidade identificada.</p>
              )
            )}
          </div>
        )}

        {/* EDUCAÇÃO */}
        {activeTab === 'educacao' && (
          <div id="tab-panel-educacao" role="tabpanel" aria-labelledby="tab-educacao" className={styles.panel}>
            {draft.educacao && draft.educacao.length > 0 ? (
              <div className={styles.educacaoList}>
                {draft.educacao.map((edu, i) => (
                  <div key={i} className={styles.eduCard} id={`educacao-${i}`}>
                    <div className={styles.eduIcon} aria-hidden="true">🎓</div>
                    {isEditing ? (
                      <div className={styles.editForm}>
                        <input className={styles.inputMedium} value={edu.curso} onChange={(e) => {
                          const newEdu = [...draft.educacao];
                          newEdu[i].curso = e.target.value;
                          setDraft({...draft, educacao: newEdu});
                        }} placeholder="Curso" />
                        <input className={styles.inputMedium} value={edu.instituicao} onChange={(e) => {
                          const newEdu = [...draft.educacao];
                          newEdu[i].instituicao = e.target.value;
                          setDraft({...draft, educacao: newEdu});
                        }} placeholder="Instituição" />
                        <input className={styles.inputSmall} value={edu.periodo} onChange={(e) => {
                          const newEdu = [...draft.educacao];
                          newEdu[i].periodo = e.target.value;
                          setDraft({...draft, educacao: newEdu});
                        }} placeholder="Período" />
                      </div>
                    ) : (
                      <div>
                        <h3 className={styles.eduCurso}>{edu.curso}</h3>
                        <p className={styles.eduInst}>{edu.instituicao}</p>
                        {edu.periodo && <span className={styles.eduPeriodo}>{edu.periodo}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMsg}>Nenhuma formação identificada.</p>
            )}
          </div>
        )}

        {/* MELHORIAS */}
        {activeTab === 'melhorias' && (
          <div id="tab-panel-melhorias" role="tabpanel" aria-labelledby="tab-melhorias" className={styles.panel}>
            <div className={styles.melhoriasList}>
              <h3 className={styles.melhoriaTitle}>Melhorias aplicadas pela IA</h3>
              <p className={styles.melhoriaSubtitle}>Veja o que foi otimizado no seu currículo para torná-lo mais atraente:</p>
              {optimized.melhorias && optimized.melhorias.map((melhoria, i) => (
                <div key={i} className={styles.melhoriaItem} id={`melhoria-${i}`}>
                  <div className={styles.melhoriaCheck} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p>{melhoria}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
