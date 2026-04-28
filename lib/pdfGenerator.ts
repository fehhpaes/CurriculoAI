// lib/pdfGenerator.ts
// Gera PDF profissional com o currículo otimizado usando jsPDF

import type { OptimizedResume } from './gemini';

export async function generateOptimizedPDF(resume: OptimizedResume, originalName: string): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Helper: add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ─── HEADER BLOCK ────────────────────────────────────────────
  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  const name = resume.nome || 'Candidato';
  doc.text(name, pageW / 2, y, { align: 'center' });
  y += 8;

  // Title / Role
  if (resume.cargo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(resume.cargo.toUpperCase(), pageW / 2, y, { align: 'center' });
    y += 6;
  }

  // Contact info inline
  const contacts: string[] = [];
  if (resume.contato?.email) contacts.push(resume.contato.email);
  if (resume.contato?.telefone) contacts.push(resume.contato.telefone);
  if (resume.contato?.cidade) contacts.push(resume.contato.cidade);
  if (resume.contato?.linkedin) contacts.push(resume.contato.linkedin);

  if (contacts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(contacts.join('  •  '), pageW / 2, y, { align: 'center' });
    y += 8;
  }

  // Separator Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ─── SECTION HELPER ──────────────────────────────────────────
  const addSection = (title: string) => {
    if (!title) return;
    checkPageBreak(16);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    // Section underline
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  const addBodyText = (text: string, indent = 0) => {
    if (!text) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(String(text), contentW - indent);
    const blockHeight = lines.length * 5;
    checkPageBreak(blockHeight + 2);
    doc.text(lines, margin + indent, y);
    y += blockHeight + 2;
  };

  const addBoldText = (text: string, rightText?: string) => {
    if (!text) return;
    
    let rightTextWidth = 0;
    if (rightText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      rightTextWidth = doc.getTextWidth(String(rightText)) + 5; // 5mm de margem segura
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    
    // Prevent long bold text from overflowing right side text dynamically
    const lines = doc.splitTextToSize(String(text), contentW - rightTextWidth);
    const blockHeight = lines.length * 5;
    checkPageBreak(blockHeight + 3);
    
    doc.text(lines, margin, y);
    
    if (rightText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(String(rightText), pageW - margin, y, { align: 'right' });
    }
    y += blockHeight;
  };

  // ─── RESUMO PROFISSIONAL ─────────────────────────────────────
  if (resume.resumoProfissional) {
    addSection('Resumo Profissional');
    addBodyText(resume.resumoProfissional);
  }

  // ─── EXPERIÊNCIAS ────────────────────────────────────────────
  if (resume.experiencias && resume.experiencias.length > 0) {
    addSection('Experiência Profissional');
    for (const exp of resume.experiencias) {
      checkPageBreak(15);
      const titleText = [exp.cargo, exp.empresa].filter(Boolean).join(' — ');
      addBoldText(titleText, exp.periodo);
      if (exp.descricao) {
        y += 1;
        addBodyText(exp.descricao);
      }
      y += 3;
    }
  }

  // ─── EDUCAÇÃO ────────────────────────────────────────────────
  if (resume.educacao && resume.educacao.length > 0) {
    addSection('Formação Acadêmica');
    for (const edu of resume.educacao) {
      checkPageBreak(15);
      addBoldText(edu.curso || 'Formação', edu.periodo);
      if (edu.instituicao) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const instLines = doc.splitTextToSize(String(edu.instituicao), contentW);
        checkPageBreak(instLines.length * 5 + 2);
        doc.text(instLines, margin, y);
        y += instLines.length * 5 + 1;
      }
      y += 3;
    }
  }

  // ─── HABILIDADES ─────────────────────────────────────────────
  if (resume.habilidades && resume.habilidades.length > 0) {
    addSection('Habilidades');
    const skills = resume.habilidades.join('  •  ');
    addBodyText(skills);
  }

  // ─── IDIOMAS ─────────────────────────────────────────────────
  if (resume.idiomas && resume.idiomas.length > 0) {
    addSection('Idiomas');
    for (const idioma of resume.idiomas) {
      if (idioma.idioma) {
        addBodyText(`• ${idioma.idioma}${idioma.nivel ? `: ${idioma.nivel}` : ''}`);
      }
    }
  }

  // ─── CERTIFICAÇÕES ───────────────────────────────────────────
  if (resume.certificacoes && resume.certificacoes.length > 0) {
    addSection('Certificações');
    for (const cert of resume.certificacoes) {
      if (cert) addBodyText(`• ${cert}`);
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text(
      `${i}/${totalPages}`,
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );
  }

  // Download
  const safeName = originalName.replace('.pdf', '').replace(/[^a-zA-Z0-9\-_\s]/g, '');
  doc.save(`${safeName}_otimizado.pdf`);
}
