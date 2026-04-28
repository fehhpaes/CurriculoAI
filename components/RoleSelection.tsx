'use client';

import { useState } from 'react';
import styles from './RoleSelection.module.css';

interface RoleSelectionProps {
  suggestedRoles: string[];
  onSelectRole: (role: string) => void;
  isProcessing: boolean;
}

export default function RoleSelection({ suggestedRoles, onSelectRole, isProcessing }: RoleSelectionProps) {
  const [customRole, setCustomRole] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRole.trim()) {
      onSelectRole(customRole.trim());
    }
  };

  return (
    <div className={styles.container} id="role-selection" aria-label="Seleção de Vaga Alvo">
      <div className={styles.header}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>Escolha seu Próximo Passo</h2>
          <p className={styles.subtitle}>
            A IA analisou sua trajetória e encontrou esses caminhos promissores. Para qual vaga devemos focar o seu currículo?
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {suggestedRoles.map((role, idx) => (
          <button
            key={idx}
            className={styles.roleCard}
            onClick={() => onSelectRole(role)}
            disabled={isProcessing}
            aria-label={`Selecionar vaga: ${role}`}
          >
            <span className={styles.roleText}>{role}</span>
            <div className={styles.arrow} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.divider}>
        <span>OU</span>
      </div>

      <form className={styles.customForm} onSubmit={handleCustomSubmit}>
        <label htmlFor="customRole" className={styles.customLabel}>
          Tem outra vaga em mente? Digite abaixo:
        </label>
        <div className={styles.inputGroup}>
          <input
            id="customRole"
            type="text"
            className={styles.input}
            placeholder="Ex: Gerente de Projetos"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            disabled={isProcessing}
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!customRole.trim() || isProcessing}
          >
            {isProcessing ? 'Processando...' : 'Otimizar'}
          </button>
        </div>
      </form>
    </div>
  );
}
