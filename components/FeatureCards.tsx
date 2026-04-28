'use client';

import styles from './FeatureCards.module.css';

const features = [
  {
    icon: '🎯',
    title: 'Resumo Profissional',
    description:
      'A IA reescreve seu resumo para ser mais impactante, destacando seus pontos fortes com linguagem assertiva.',
  },
  {
    icon: '📊',
    title: 'Resultados Quantificáveis',
    description:
      'Suas experiências ganham métricas e verbos de ação poderosos que mostram seu real impacto profissional.',
  },
  {
    icon: '🤖',
    title: 'Otimizado para ATS',
    description:
      'Palavras-chave estratégicas são inseridas para garantir que seu currículo passe pelos filtros automáticos.',
  },
  {
    icon: '✍️',
    title: 'Linguagem Profissional',
    description:
      'Eliminamos clichês e reescrevemos tudo com linguagem clara, objetiva e de alto impacto.',
  },
  {
    icon: '🏆',
    title: 'Habilidades em Destaque',
    description:
      'Suas habilidades são reorganizadas e expandidas com ferramentas e tecnologias relevantes para o mercado.',
  },
  {
    icon: '⚡',
    title: 'Em Segundos',
    description:
      'O processo completo leva menos de 30 segundos. Seu currículo otimizado fica disponível para download imediato.',
  },
];

export default function FeatureCards() {
  return (
    <section className={styles.section} id="features-section" aria-labelledby="features-title">
      <div className="container">
        <div className={styles.header}>
          <h2 id="features-title">
            O que a IA <span className="gradient-text">melhora</span> no seu currículo
          </h2>
          <p>
            Nosso sistema analisa cada seção do seu currículo e aplica técnicas comprovadas
            de otimização usadas por especialistas em RH.
          </p>
        </div>

        <div className={styles.grid} role="list">
          {features.map((feature, index) => (
            <div
              key={index}
              className={styles.card}
              role="listitem"
              id={`feature-card-${index}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className={styles.cardIcon} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
