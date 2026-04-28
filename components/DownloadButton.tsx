'use client';

import { useState } from 'react';
import type { OptimizedResume } from '@/lib/gemini';
import styles from './DownloadButton.module.css';

interface DownloadButtonProps {
  resume: OptimizedResume;
  originalFileName: string;
}

export default function DownloadButton({ resume, originalFileName }: DownloadButtonProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { generateOptimizedPDF } = await import('@/lib/pdfGenerator');
      await generateOptimizedPDF(resume, originalFileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadWord = async () => {
    setIsGeneratingWord(true);
    try {
      const { generateOptimizedWord } = await import('@/lib/wordGenerator');
      await generateOptimizedWord(resume, originalFileName);
    } catch (error) {
      console.error('Word generation error:', error);
      alert('Erro ao gerar o documento Word. Tente novamente.');
    } finally {
      setIsGeneratingWord(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonGroup}>
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf || isGeneratingWord}
          className={styles.button}
          id="download-pdf-button"
          aria-label="Baixar currículo otimizado em PDF"
        >
          {isGeneratingPdf ? (
            <div className={styles.spinner} aria-hidden="true" />
          ) : (
            <span>📄 PDF</span>
          )}
        </button>
        
        <button
          onClick={handleDownloadWord}
          disabled={isGeneratingPdf || isGeneratingWord}
          className={`${styles.button} ${styles.buttonWord}`}
          id="download-word-button"
          aria-label="Baixar currículo otimizado em Word"
        >
          {isGeneratingWord ? (
            <div className={styles.spinner} aria-hidden="true" />
          ) : (
            <span>📝 Word (.docx)</span>
          )}
        </button>
      </div>
      <p className={styles.hint}>
        Escolha o formato ideal. O PDF é ótimo para enviar, e o Word permite edições manuais.
      </p>
    </div>
  );
}
