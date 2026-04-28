import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { OptimizedResume } from './gemini';

export async function generateOptimizedWord(resume: OptimizedResume, originalName: string): Promise<void> {
  const sections: any[] = [];

  // ─── HELPER FUNCTIONS ───
  const addHeading = (text: string) => {
    sections.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
        border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } }
      })
    );
  };

  const addBody = (text: string) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        spacing: { before: 60, after: 120 },
      })
    );
  };

  const addBoldItem = (text: string) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22 })],
        spacing: { before: 120, after: 40 },
      })
    );
  };

  const addItalicItem = (text: string) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text, italics: true, size: 20, color: "555555" })],
        spacing: { before: 0, after: 60 },
      })
    );
  };

  const addBullet = (text: string) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      })
    );
  };

  // ─── HEADER ───
  sections.push(
    new Paragraph({
      text: resume.nome || 'Candidato',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    })
  );

  if (resume.cargo) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: resume.cargo, bold: true, size: 24, color: "444444" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
      })
    );
  }

  const contacts: string[] = [];
  if (resume.contato?.email) contacts.push(resume.contato.email);
  if (resume.contato?.telefone) contacts.push(resume.contato.telefone);
  if (resume.contato?.cidade) contacts.push(resume.contato.cidade);
  if (resume.contato?.linkedin) contacts.push(resume.contato.linkedin);

  if (contacts.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contacts.join(' | '), size: 20, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // ─── RESUMO ───
  if (resume.resumoProfissional) {
    addHeading("Resumo Profissional");
    addBody(resume.resumoProfissional);
  }

  // ─── EXPERIÊNCIA ───
  if (resume.experiencias && resume.experiencias.length > 0) {
    addHeading("Experiência Profissional");
    for (const exp of resume.experiencias) {
      addBoldItem(`${exp.cargo} — ${exp.empresa}`);
      if (exp.periodo) addItalicItem(exp.periodo);
      if (exp.descricao) addBody(exp.descricao);
    }
  }

  // ─── EDUCAÇÃO ───
  if (resume.educacao && resume.educacao.length > 0) {
    addHeading("Formação Acadêmica");
    for (const edu of resume.educacao) {
      addBoldItem(`${edu.curso} — ${edu.instituicao}`);
      if (edu.periodo) addItalicItem(edu.periodo);
    }
  }

  // ─── HABILIDADES ───
  if (resume.habilidades && resume.habilidades.length > 0) {
    addHeading("Habilidades");
    addBody(resume.habilidades.join(' • '));
  }

  // ─── IDIOMAS ───
  if (resume.idiomas && resume.idiomas.length > 0) {
    addHeading("Idiomas");
    for (const idioma of resume.idiomas) {
      addBullet(`${idioma.idioma}: ${idioma.nivel}`);
    }
  }

  // ─── CERTIFICAÇÕES ───
  if (resume.certificacoes && resume.certificacoes.length > 0) {
    addHeading("Certificações");
    for (const cert of resume.certificacoes) {
      addBullet(cert);
    }
  }

  // Build document
  const doc = new Document({
    sections: [{ children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  
  // Download logic
  const safeName = originalName.replace('.pdf', '').replace(/[^a-zA-Z0-9\-_]/g, '');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_otimizado.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
