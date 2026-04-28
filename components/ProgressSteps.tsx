'use client';

import styles from './ProgressSteps.module.css';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, icon: '📄', label: 'Lendo PDF', sublabel: 'Extraindo texto...' },
  { id: 2, icon: '🔍', label: 'Buscando Vagas', sublabel: 'Mapeando perfil...' },
  { id: 3, icon: '🤖', label: 'Otimizando', sublabel: 'Gemini reescrevendo...' },
  { id: 4, icon: '✨', label: 'Pronto!', sublabel: 'Currículo gerado' },
];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  if (currentStep === 0) return null;

  return (
    <div className={styles.wrapper} role="status" aria-label="Progresso da otimização">
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;

          return (
            <div key={step.id} className={styles.stepGroup}>
              <div
                className={`${styles.step} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
                id={`progress-step-${stepNum}`}
              >
                <div className={styles.stepIcon}>
                  {isDone ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10l5 5 7-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span aria-hidden="true">{step.icon}</span>
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepLabel}>{step.label}</span>
                  {isActive && <span className={styles.stepSublabel}>{step.sublabel}</span>}
                </div>
                {isActive && <div className={styles.pulse} aria-hidden="true" />}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
