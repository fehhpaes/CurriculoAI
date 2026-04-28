'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import UploadZone from '@/components/UploadZone';
import FeatureCards from '@/components/FeatureCards';
import RoleSelection from '@/components/RoleSelection';
import ProgressSteps from '@/components/ProgressSteps';
import ResumeComparison from '@/components/ResumeComparison';
import DownloadButton from '@/components/DownloadButton';
import { optimizeResume, analyzeRoles, type OptimizedResume } from '@/lib/gemini';
import { extractTextFromPDF } from '@/lib/pdfParser';
import styles from './page.module.css';

export default function Home() {
  const [step, setStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [originalFileName, setOriginalFileName] = useState('curriculo');
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setOptimizedResume(null);
    setSuggestedRoles([]);
    setOriginalFileName(file.name);

    try {
      // Step 1: Parse PDF
      setStep(1);
      const text = await extractTextFromPDF(file);
      setOriginalText(text);

      if (!text || text.trim().length < 50) {
        throw new Error(
          'Não foi possível extrair texto do PDF. Certifique-se de que o arquivo não é uma imagem digitalizada.'
        );
      }

      // Step 2: Analyze Roles
      setStep(2);
      const roles = await analyzeRoles(text);
      if (!roles || roles.length === 0) {
        throw new Error('Não foi possível identificar possíveis vagas para o currículo.');
      }
      setSuggestedRoles(roles);
      // Stays on step 2 waiting for user input
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.';
      setError(message);
      setStep(0);
    }
  }, []);

  const handleRoleSelect = async (role: string) => {
    setError(null);
    try {
      // Step 3: AI Optimization
      setStep(3);
      const result = await optimizeResume(originalText, role);
      setOptimizedResume(result);

      // Step 4: Done!
      setStep(4);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao otimizar.';
      setError(message);
      setStep(2); // Go back to role selection on error
    }
  };

  const handleReset = () => {
    setStep(0);
    setError(null);
    setOriginalText('');
    setOptimizedResume(null);
    setSuggestedRoles([]);
  };

  return (
    <>
      <Navbar />

      <div className={styles.page}>
        {/* ─── HERO SECTION ─── */}
        <section className={styles.hero} id="hero-section" aria-labelledby="hero-title">
          <div className={`container ${styles.heroInner}`}>
            {/* Tag */}
            <div className={styles.heroTag} aria-label="Tag de destaque">
              <span className={styles.tagDot} aria-hidden="true" />
              Powered by Google Gemini AI
            </div>

            {/* Heading */}
            <h1 id="hero-title" className={styles.heroTitle}>
              Seu currículo,{' '}
              <span className="gradient-text">irresistível</span>{' '}
              para recrutadores
            </h1>

            <p className={styles.heroSubtitle}>
              Faça upload do seu PDF e nossa IA reescreve, otimiza e estrutura seu currículo
              profissionalmente em segundos. Passe pelos filtros ATS e chame a atenção dos
              recrutadores.
            </p>

            {/* Stats */}
            <div className={styles.stats} role="list" aria-label="Estatísticas">
              {[
                { value: '3x', label: 'Mais visualizações' },
                { value: '< 30s', label: 'Otimização completa' },
                { value: '100%', label: 'Gratuito' },
              ].map((stat, i) => (
                <div key={i} className={styles.stat} role="listitem" id={`stat-${i}`}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTENT ─── */}
        <div className="container">
          <div className={styles.main}>

            {/* Upload Zone & Role Selection */}
            {step < 4 && (
              <div className={styles.uploadSection} id="upload-section">
                
                {step === 0 && (
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    isProcessing={false}
                  />
                )}

                {(step === 2 || step === 3) && suggestedRoles.length > 0 && (
                  <RoleSelection
                    suggestedRoles={suggestedRoles}
                    onSelectRole={handleRoleSelect}
                    isProcessing={step === 3}
                  />
                )}

                {/* Progress steps */}
                {step > 0 && (
                  <div className={styles.progressWrapper}>
                    <ProgressSteps currentStep={step} />
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className={styles.errorBox} role="alert" id="error-message">
                    <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
                    <div>
                      <p className={styles.errorTitle}>Ocorreu um erro</p>
                      <p className={styles.errorText}>{error}</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className={styles.errorBtn}
                      id="retry-button"
                      aria-label="Tentar novamente"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {step === 4 && optimizedResume && (
              <div className={styles.results} id="results-section">
                {/* Success banner */}
                <div className={styles.successBanner} role="status">
                  <div className={styles.successIcon} aria-hidden="true">🎉</div>
                  <div>
                    <h2 className={styles.successTitle}>Currículo otimizado com sucesso!</h2>
                    <p className={styles.successText}>
                      A IA analisou e melhorou seu currículo. Confira as melhorias abaixo.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className={styles.newFileBtn}
                    id="new-file-button"
                    aria-label="Otimizar outro currículo"
                  >
                    + Novo currículo
                  </button>
                </div>

                {/* Download CTA */}
                <div className={styles.downloadSection}>
                  <DownloadButton resume={optimizedResume} originalFileName={originalFileName} />
                </div>

                {/* Comparison */}
                <ResumeComparison 
                  original={originalText} 
                  optimized={optimizedResume} 
                  onUpdate={setOptimizedResume}
                />
              </div>
            )}

          </div>
        </div>

        {/* ─── FEATURES (only on initial screen) ─── */}
        {step === 0 && <FeatureCards />}

        {/* ─── FOOTER ─── */}
        <footer className={styles.footer} role="contentinfo">
          <div className="container">
            <p className={styles.footerText}>
              <span className="gradient-text" style={{ fontWeight: 700 }}>Currículo++</span>
              {' '}· Feito com ❤️ e Inteligência Artificial
            </p>
            <p className={styles.footerSub}>
              Suas informações são processadas com segurança e não são armazenadas.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
