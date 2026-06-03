import type { SprintBacklogGenerado } from './aiService';

// ============================================================
// HELPERS
// ============================================================

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function getPriorityEmoji(prioridad: string): string {
  switch (prioridad) {
    case 'Alta':
      return '🔴';
    case 'Media':
      return '🟡';
    case 'Baja':
      return '🟢';
    default:
      return '⚪';
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50);
}

// ============================================================
// MARKDOWN EXPORT
// ============================================================

export function exportToMarkdown(data: SprintBacklogGenerado): void {
  const totalPuntos = data.historias.reduce((sum, h) => sum + (h.puntos || 0), 0);
  const alta = data.historias.filter((h) => h.prioridad === 'Alta').length;
  const media = data.historias.filter((h) => h.prioridad === 'Media').length;
  const baja = data.historias.filter((h) => h.prioridad === 'Baja').length;

  const lines: string[] = [
    `# 📋 Sprint Backlog — ${data.nombreProyecto}`,
    ``,
    `> **Generado con IA el:** ${formatDate(data.generadoEn)}`,
    ``,
    `---`,
    ``,
    `## 📊 Resumen del Sprint`,
    ``,
    `| Métrica | Valor |`,
    `|---|---|`,
    `| Total de historias | ${data.historias.length} |`,
    `| Puntos estimados totales | ${totalPuntos} |`,
    `| 🔴 Prioridad Alta | ${alta} historia${alta !== 1 ? 's' : ''} |`,
    `| 🟡 Prioridad Media | ${media} historia${media !== 1 ? 's' : ''} |`,
    `| 🟢 Prioridad Baja | ${baja} historia${baja !== 1 ? 's' : ''} |`,
    ``,
    `---`,
    ``,
    `## 📝 Historias de Usuario`,
    ``,
  ];

  data.historias.forEach((historia, index) => {
    const emoji = getPriorityEmoji(historia.prioridad);
    const num = String(index + 1).padStart(3, '0');

    lines.push(`### ${emoji} ${historia.id || `HU-${num}`}: ${historia.titulo}`);
    lines.push(``);
    lines.push(`**Prioridad:** \`${historia.prioridad}\` &nbsp;|&nbsp; **Story Points:** \`${historia.puntos}\``);
    lines.push(``);
    lines.push(`> Como **${historia.comoUsuario}**,`);
    lines.push(`> quiero **${historia.quiero}**,`);
    lines.push(`> para **${historia.para}**`);
    lines.push(``);

    if (historia.criteriosAceptacion && historia.criteriosAceptacion.length > 0) {
      lines.push(`#### ✅ Criterios de Aceptación`);
      lines.push(``);
      historia.criteriosAceptacion
        .filter((c) => c.trim())
        .forEach((criterio) => {
          lines.push(`- [ ] ${criterio}`);
        });
      lines.push(``);
    }

    if (historia.tareasTecnicas && historia.tareasTecnicas.length > 0) {
      lines.push(`#### 🛠️ Tareas Técnicas`);
      lines.push(``);
      lines.push(`| ID | Descripción | Story Points |`);
      lines.push(`|---|---|:---:|`);
      historia.tareasTecnicas.forEach((tarea) => {
        lines.push(`| \`${tarea.id}\` | ${tarea.descripcion} | ${tarea.estimacion} |`);
      });
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  });

  lines.push(
    `*Generado automáticamente por Usability Test Dashboard con Google Gemini AI · ${formatDate(data.generadoEn)}*`
  );

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sprint-backlog-${slugify(data.nombreProyecto)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// PDF EXPORT (via print window — no extra dependency needed)
// ============================================================

function priorityColor(prioridad: string): string {
  switch (prioridad) {
    case 'Alta':
      return '#dc2626';
    case 'Media':
      return '#d97706';
    case 'Baja':
      return '#16a34a';
    default:
      return '#6b7280';
  }
}

function priorityBg(prioridad: string): string {
  switch (prioridad) {
    case 'Alta':
      return '#fee2e2';
    case 'Media':
      return '#fef3c7';
    case 'Baja':
      return '#dcfce7';
    default:
      return '#f3f4f6';
  }
}

function generatePrintHtml(data: SprintBacklogGenerado): string {
  const totalPuntos = data.historias.reduce((sum, h) => sum + (h.puntos || 0), 0);
  const alta = data.historias.filter((h) => h.prioridad === 'Alta').length;
  const media = data.historias.filter((h) => h.prioridad === 'Media').length;
  const baja = data.historias.filter((h) => h.prioridad === 'Baja').length;

  const historiasHtml = data.historias
    .map(
      (historia, index) => `
    <div class="story-card">
      <div class="story-header">
        <div class="story-id">${historia.id || `HU-${String(index + 1).padStart(3, '0')}`}</div>
        <h3 class="story-title">${historia.titulo}</h3>
        <span class="priority-badge" style="background:${priorityBg(historia.prioridad)};color:${priorityColor(historia.prioridad)}">
          ${historia.prioridad}
        </span>
        <span class="points-badge">${historia.puntos} pts</span>
      </div>

      <div class="user-story-format">
        <p><span class="label">Como</span> ${historia.comoUsuario},</p>
        <p><span class="label">quiero</span> ${historia.quiero},</p>
        <p><span class="label">para</span> ${historia.para}</p>
      </div>

      ${
        historia.criteriosAceptacion && historia.criteriosAceptacion.filter((c) => c.trim()).length > 0
          ? `<div class="section">
          <h4 class="section-title">Criterios de Aceptación</h4>
          <ul>
            ${historia.criteriosAceptacion
              .filter((c) => c.trim())
              .map((c) => `<li>${c}</li>`)
              .join('')}
          </ul>
        </div>`
          : ''
      }

      ${
        historia.tareasTecnicas && historia.tareasTecnicas.length > 0
          ? `<div class="section">
          <h4 class="section-title">Tareas Técnicas</h4>
          <table class="tasks-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              ${historia.tareasTecnicas
                .map(
                  (t) => `<tr>
                <td><code>${t.id}</code></td>
                <td>${t.descripcion}</td>
                <td style="text-align:center;font-weight:700">${t.estimacion}</td>
              </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`
          : ''
      }
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sprint Backlog — ${data.nombreProyecto}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #0f172a;
      background: #fff;
      padding: 32px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #1e3a5f;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    h1 { font-size: 22px; font-weight: 800; color: #1e3a5f; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #64748b; line-height: 1.6; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 28px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .summary-item { text-align: center; }
    .summary-number { font-size: 26px; font-weight: 800; color: #1e3a5f; }
    .summary-label { font-size: 11px; color: #64748b; margin-top: 2px; }
    .stories-title { font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 16px; }
    .story-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px;
      margin-bottom: 20px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .story-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .story-id {
      background: #1e3a5f;
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .story-title { font-size: 14px; font-weight: 700; flex: 1; min-width: 200px; }
    .priority-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .points-badge {
      background: #e8f0fb;
      color: #1e3a5f;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: 20px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .user-story-format {
      background: #f8fafc;
      border-left: 3px solid #2d5a9e;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 14px;
      line-height: 1.9;
    }
    .label { font-weight: 700; color: #2d5a9e; }
    .section { margin-top: 14px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
    ul { padding-left: 18px; }
    li { margin-bottom: 5px; line-height: 1.5; }
    .tasks-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
    .tasks-table th {
      background: #f1f5f9;
      padding: 7px 10px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    .tasks-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .tasks-table tr:last-child td { border-bottom: none; }
    code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 11px; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 16px; }
      .story-card { break-inside: avoid; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <div>
        <h1>Sprint Backlog</h1>
        <div class="meta">
          <strong>Proyecto:</strong> ${data.nombreProyecto}<br>
          <strong>Generado:</strong> ${formatDate(data.generadoEn)}
        </div>
      </div>
      <div class="meta" style="text-align:right;flex-shrink:0">
        Usability Test Dashboard<br>
        IA: Google Gemini
      </div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-item">
      <div class="summary-number">${data.historias.length}</div>
      <div class="summary-label">Historias</div>
    </div>
    <div class="summary-item">
      <div class="summary-number">${totalPuntos}</div>
      <div class="summary-label">Puntos totales</div>
    </div>
    <div class="summary-item">
      <div class="summary-number" style="color:#dc2626">${alta}</div>
      <div class="summary-label">Prioridad Alta</div>
    </div>
    <div class="summary-item">
      <div class="summary-number" style="color:#d97706">${media}</div>
      <div class="summary-label">Prioridad Media</div>
    </div>
    <div class="summary-item">
      <div class="summary-number" style="color:#16a34a">${baja}</div>
      <div class="summary-label">Prioridad Baja</div>
    </div>
  </div>

  <div class="stories-title">Historias de Usuario (${data.historias.length})</div>

  ${historiasHtml}

  <div class="footer">
    Generado automáticamente por Usability Test Dashboard con IA (Google Gemini) &middot; ${formatDate(data.generadoEn)}
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 400);
    });
  </script>
</body>
</html>`;
}

export function exportToPdf(data: SprintBacklogGenerado): void {
  const html = generatePrintHtml(data);
  const printWindow = window.open('', '_blank', 'width=960,height=850');
  if (!printWindow) {
    throw new Error(
      'No se pudo abrir la ventana de impresión. Por favor, permite las ventanas emergentes en este sitio y vuelve a intentarlo.'
    );
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
}
