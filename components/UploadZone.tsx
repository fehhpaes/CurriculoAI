'use client';

import { useState, useCallback } from 'react';
import styles from './UploadZone.module.css';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo deve ter menos de 10MB.');
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''} ${selectedFile ? styles.hasFile : ''} ${isProcessing ? styles.processing : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      id="upload-zone"
      role="region"
      aria-label="Área de upload de currículo PDF"
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className={styles.fileInput}
        id="file-input"
        disabled={isProcessing}
        aria-label="Selecionar arquivo PDF"
      />
      <label htmlFor="file-input" className={styles.uploadLabel}>
        {isProcessing ? (
          <div className={styles.processingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p className={styles.processingText}>Processando seu currículo...</p>
          </div>
        ) : selectedFile ? (
          <div className={styles.fileSelected}>
            <div className={styles.fileIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#fileGrad)" fillOpacity="0.2" />
                <path d="M14 10h8l8 8v14a2 2 0 01-2 2H14a2 2 0 01-2-2V12a2 2 0 012-2z" stroke="url(#fileGrad)" strokeWidth="1.5" />
                <path d="M22 10v8h8" stroke="url(#fileGrad)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M17 25l2.5 2.5L28 20" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="fileGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#6c63ff" />
                    <stop offset="1" stopColor="#3ecfcf" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className={styles.fileName}>{selectedFile.name}</p>
            <p className={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} KB</p>
            <span className={styles.changeFile}>Clique para trocar o arquivo</span>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.uploadIcon} aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect width="56" height="56" rx="16" fill="url(#uploadGrad)" fillOpacity="0.12" />
                <path d="M20 36h16M28 20v12M28 20l-4 4M28 20l4 4" stroke="url(#uploadGrad2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="14" y="38" width="28" height="4" rx="2" fill="url(#uploadGrad2)" fillOpacity="0.3" />
                <defs>
                  <linearGradient id="uploadGrad" x1="0" y1="0" x2="56" y2="56">
                    <stop stopColor="#6c63ff" />
                    <stop offset="1" stopColor="#3ecfcf" />
                  </linearGradient>
                  <linearGradient id="uploadGrad2" x1="14" y1="20" x2="42" y2="42">
                    <stop stopColor="#6c63ff" />
                    <stop offset="1" stopColor="#3ecfcf" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className={styles.uploadTitle}>
              {isDragging ? 'Solte o PDF aqui!' : 'Arraste e solte seu currículo'}
            </p>
            <p className={styles.uploadSubtitle}>ou clique para selecionar o arquivo</p>
            <div className={styles.uploadMeta}>
              <span>📄 Apenas PDF</span>
              <span>•</span>
              <span>Máximo 10MB</span>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
