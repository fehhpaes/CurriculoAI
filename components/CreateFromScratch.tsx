'use client';

import { useState } from 'react';
import styles from './CreateFromScratch.module.css';

interface CreateFromScratchProps {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function CreateFromScratch({ onComplete, onCancel }: CreateFromScratchProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedText = `
      Nome: ${formData.fullName}
      Email: ${formData.email}
      Telefone: ${formData.phone}
      Localização: ${formData.location}
      Resumo Profissional: ${formData.summary}
      Experiência Profissional: ${formData.experience}
      Formação Acadêmica: ${formData.education}
      Habilidades: ${formData.skills}
    `;
    onComplete(formattedText);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Crie seu currículo do zero</h2>
        <p>Preencha as informações abaixo e nossa IA cuidará da otimização.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Nome Completo</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Ex: João Silva" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="joao@email.com" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Telefone</label>
            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="location">Localização</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="São Paulo, SP" />
          </div>
        </div>

        <div className={styles.inputGroup fullWidth}>
          <label htmlFor="summary">Resumo Profissional</label>
          <textarea id="summary" name="summary" rows={3} value={formData.summary} onChange={handleChange} placeholder="Conte brevemente sobre sua trajetória..." />
        </div>

        <div className={styles.inputGroup fullWidth}>
          <label htmlFor="experience">Experiência Profissional</label>
          <textarea id="experience" name="experience" rows={5} value={formData.experience} onChange={handleChange} placeholder="Liste seus cargos, empresas e principais conquistas..." />
        </div>

        <div className={styles.inputGroup fullWidth}>
          <label htmlFor="education">Formação Acadêmica</label>
          <textarea id="education" name="education" rows={3} value={formData.education} onChange={handleChange} placeholder="Cursos, graduações e certificações..." />
        </div>

        <div className={styles.inputGroup fullWidth}>
          <label htmlFor="skills">Habilidades e Competências</label>
          <textarea id="skills" name="skills" rows={3} value={formData.skills} onChange={handleChange} placeholder="Ex: JavaScript, Python, Gestão de Projetos, Inglês Fluente..." />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn}>
            Gerar com IA
          </button>
        </div>
      </form>
    </div>
  );
}
