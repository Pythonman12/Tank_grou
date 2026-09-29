import { jsPDF } from 'jspdf';
import { GDD_DATA } from '../data/gddContent';

/**
 * Downloads the Game Design Document as an HWP-compatible formatted file (.hwp).
 * Hancom Office (한글) natively opens HTML-structured documents saved with .hwp or .doc
 * with complete table layouts, headers, colors, and Korean typography.
 */
export function downloadHwpDocument() {
  const title = GDD_DATA.title;
  const subTitle = GDD_DATA.subTitle;

  let bodyHtml = `
    <div style="font-family: 'Malgun Gothic', 'Dotum', 'Pretendard', sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 30px;">
      <div style="text-align: center; border-bottom: 3px double #2563eb; padding-bottom: 25px; margin-bottom: 35px;">
        <h1 style="font-size: 26pt; color: #1e3a8a; margin: 0 0 10px 0; font-weight: 800;">${title}</h1>
        <h2 style="font-size: 14pt; color: #475569; margin: 0 0 15px 0; font-weight: 600;">${subTitle}</h2>
        <div style="font-size: 10pt; color: #64748b;">
          <span><strong>문서 버전:</strong> ${GDD_DATA.version}</span> &nbsp;|&nbsp; 
          <span><strong>작성일:</strong> ${GDD_DATA.date}</span> &nbsp;|&nbsp; 
          <span><strong>작성자:</strong> ${GDD_DATA.author}</span>
        </div>
      </div>

      <div style="background-color: #f1f5f9; border-left: 5px solid #2563eb; padding: 15px 20px; margin-bottom: 35px; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; font-size: 12pt; color: #1e293b;">【 문서 개요 (Executive Summary) 】</h3>
        <p style="margin: 0; font-size: 10pt; color: #334155;">${GDD_DATA.abstract}</p>
      </div>
  `;

  for (const section of GDD_DATA.sections) {
    bodyHtml += `
      <div style="margin-bottom: 35px; page-break-inside: avoid;">
        <h2 style="font-size: 16pt; color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
          ${section.title}
        </h2>
        <div style="font-size: 10.5pt; color: #475569; margin-bottom: 12px; font-weight: 600;">${section.subtitle}</div>
    `;

    for (const paragraph of section.content) {
      bodyHtml += `<p style="margin: 6px 0; font-size: 10pt; color: #1e293b;">${paragraph}</p>`;
    }

    if (section.subsections) {
      for (const sub of section.subsections) {
        bodyHtml += `
          <div style="margin-top: 18px; margin-left: 8px;">
            <h3 style="font-size: 12pt; color: #0f172a; margin-bottom: 8px;">${sub.title}</h3>
        `;

        if (sub.paragraphs) {
          for (const p of sub.paragraphs) {
            bodyHtml += `<p style="margin: 6px 0; font-size: 9.5pt; color: #334155;">${p}</p>`;
          }
        }

        if (sub.items) {
          bodyHtml += `<ul style="margin: 6px 0; padding-left: 20px;">`;
          for (const item of sub.items) {
            bodyHtml += `<li style="margin-bottom: 4px; font-size: 9.5pt; color: #334155;">${item}</li>`;
          }
          bodyHtml += `</ul>`;
        }

        if (sub.table) {
          bodyHtml += `
            <table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 15px; font-size: 9pt;">
              <thead>
                <tr style="background-color: #e2e8f0; color: #0f172a;">
          `;
          for (const header of sub.table.headers) {
            bodyHtml += `<th style="border: 1px solid #94a3b8; padding: 8px 10px; text-align: center; font-weight: 700;">${header}</th>`;
          }
          bodyHtml += `</tr></thead><tbody>`;

          for (let rIdx = 0; rIdx < sub.table.rows.length; rIdx++) {
            const row = sub.table.rows[rIdx];
            const bg = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
            bodyHtml += `<tr style="background-color: ${bg};">`;
            for (let cIdx = 0; cIdx < row.length; cIdx++) {
              const cell = row[cIdx];
              const align = cIdx <= 1 ? 'center' : 'left';
              bodyHtml += `<td style="border: 1px solid #cbd5e1; padding: 7px 9px; text-align: ${align}; color: #334155;">${cell}</td>`;
            }
            bodyHtml += `</tr>`;
          }

          bodyHtml += `</tbody></table>`;
        }

        bodyHtml += `</div>`;
      }
    }

    bodyHtml += `</div>`;
  }

  bodyHtml += `
      <div style="text-align: center; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px;">
        © 2026 프로젝트 대포키우기 (TankCraft IO) Development Team. All Rights Reserved.
      </div>
    </div>
  `;

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title} - 게임 개발 계획서</title>
<style>
  @page {
    margin: 20mm;
    size: A4 portrait;
  }
  body { margin: 0; padding: 0; background: #ffffff; }
  table { page-break-inside: avoid; }
  h2, h3 { page-break-after: avoid; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

  // Prepend UTF-8 BOM so Hancom Hangul, Word and text editors automatically recognize UTF-8 Korean encoding
  const blob = new Blob(['\uFEFF' + fullHtml], {
    type: 'application/haansofthwp;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `대포키우기_게임개발계획서_${GDD_DATA.version}.hwp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads as standard UTF-8 text document (.txt)
 */
export function downloadTextDocument() {
  let text = `================================================================================
${GDD_DATA.title}
${GDD_DATA.subTitle}
버전: ${GDD_DATA.version} | 작성일: ${GDD_DATA.date} | 작성자: ${GDD_DATA.author}
================================================================================

【 개요 】
${GDD_DATA.abstract}

`;

  for (const sec of GDD_DATA.sections) {
    text += `\n--------------------------------------------------------------------------------\n`;
    text += `${sec.title}\n`;
    text += `부제: ${sec.subtitle}\n`;
    text += `--------------------------------------------------------------------------------\n\n`;

    for (const p of sec.content) {
      text += `${p}\n`;
    }

    if (sec.subsections) {
      for (const sub of sec.subsections) {
        text += `\n[${sub.title}]\n`;
        if (sub.paragraphs) {
          for (const sp of sub.paragraphs) {
            text += `  ${sp}\n`;
          }
        }
        if (sub.items) {
          for (const item of sub.items) {
            text += `  - ${item}\n`;
          }
        }
        if (sub.table) {
          text += `\n  <표: ${sub.title}>\n`;
          text += `  ` + sub.table.headers.join(' | ') + '\n';
          text += `  ` + sub.table.headers.map(() => '-------').join(' | ') + '\n';
          for (const row of sub.table.rows) {
            text += `  ` + row.join(' | ') + '\n';
          }
        }
      }
    }
  }

  text += `\n================================================================================\n© 2026 TankCraft IO Development Team. All rights reserved.\n`;

  const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `대포키우기_게임개발계획서_${GDD_DATA.version}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -----------------------------------------------------------------------------
// Ultra-reliable Canvas 2D Multi-page Korean PDF Engine
// Bypasses html2canvas stylesheet parsing errors and renders pristine Korean typography
// -----------------------------------------------------------------------------

function wrapKoreanText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const rawParagraphs = text.split('\n');
  const resultLines: string[] = [];

  for (const para of rawParagraphs) {
    if (para.trim().length === 0) {
      resultLines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          resultLines.push(currentLine);
        }
        if (ctx.measureText(word).width > maxWidth) {
          let charLine = '';
          for (const char of word) {
            if (ctx.measureText(charLine + char).width <= maxWidth) {
              charLine += char;
            } else {
              resultLines.push(charLine);
              charLine = char;
            }
          }
          currentLine = charLine;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }
  return resultLines;
}

function drawHeaderAndFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pageNum: number,
  totalPages = 5
) {
  // Top Header
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(70, 75);
  ctx.lineTo(width - 70, 75);
  ctx.stroke();

  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 17px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('프로젝트 대포키우기 (TankCraft IO) — 게임 개발 계획서 (Game Design Document)', 70, 68);

  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${GDD_DATA.version} | ${pageNum} / ${totalPages}`, width - 70, 68);

  // Bottom Footer
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, height - 65);
  ctx.lineTo(width - 70, height - 65);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 14px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('© 2026 TankCraft IO Architecture & Design Team. All Rights Reserved.', 70, height - 58);

  ctx.textAlign = 'right';
  ctx.fillText(`Page ${pageNum} of ${totalPages}`, width - 70, height - 58);
}

function drawTable(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  fontSize = 15,
  lineHeight = 24
): number {
  let curY = startY;
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  // Header row
  const headerHeight = lineHeight + 10;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(startX, curY, totalWidth, headerHeight);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(startX, curY, totalWidth, headerHeight);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${fontSize + 1}px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  ctx.textBaseline = 'middle';

  let curX = startX;
  for (let i = 0; i < headers.length; i++) {
    const w = colWidths[i];
    ctx.textAlign = 'center';
    ctx.fillText(headers[i], curX + w / 2, curY + headerHeight / 2);
    if (i < headers.length - 1) {
      ctx.beginPath();
      ctx.moveTo(curX + w, curY);
      ctx.lineTo(curX + w, curY + headerHeight);
      ctx.stroke();
    }
    curX += w;
  }
  curY += headerHeight;

  // Data rows
  ctx.font = `normal ${fontSize}px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    let maxLines = 1;
    const cellLinesList: string[][] = [];

    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const cellText = row[cIdx] || '';
      const maxW = colWidths[cIdx] - 16;
      const lines = wrapKoreanText(ctx, cellText, maxW);
      cellLinesList.push(lines);
      if (lines.length > maxLines) maxLines = lines.length;
    }

    const rowH = Math.max(lineHeight + 6, maxLines * (lineHeight - 2) + 10);
    ctx.fillStyle = rIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fillRect(startX, curY, totalWidth, rowH);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, curY, totalWidth, rowH);

    curX = startX;
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const w = colWidths[cIdx];
      const lines = cellLinesList[cIdx];
      ctx.fillStyle = cIdx === 0 ? '#1e3a8a' : '#334155';
      const isCenter = cIdx <= 1 && lines.length <= 1;

      const cellStartY = curY + (rowH - lines.length * (lineHeight - 3)) / 2 + (lineHeight - 3) / 2;
      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        const textY = cellStartY + lIdx * (lineHeight - 3);
        if (isCenter) {
          ctx.textAlign = 'center';
          ctx.fillText(lines[lIdx], curX + w / 2, textY);
        } else {
          ctx.textAlign = 'left';
          ctx.fillText(lines[lIdx], curX + 10, textY);
        }
      }

      if (cIdx < row.length - 1) {
        ctx.beginPath();
        ctx.moveTo(curX + w, curY);
        ctx.lineTo(curX + w, curY + rowH);
        ctx.stroke();
      }
      curX += w;
    }
    curY += rowH;
  }

  return curY;
}

/**
 * Downloads as high-quality PDF with 100% pristine Korean typography.
 * Completely eliminates broken fonts, missing glyphs, and stylesheet parsing bugs.
 */
export async function downloadPdfDocument(): Promise<void> {
  const CANVAS_W = 1240;
  const CANVAS_H = 1754; // A4 standard 1:1.414 ratio at crisp 150 DPI
  const startX = 70;
  const contentW = CANVAS_W - 140;

  const sec1 = GDD_DATA.sections[0];
  const sec2 = GDD_DATA.sections[1];
  const sec3 = GDD_DATA.sections[2];
  const sec4 = GDD_DATA.sections[3];
  const sec5 = GDD_DATA.sections[4];
  const sec6 = GDD_DATA.sections[5];
  const sec7 = GDD_DATA.sections[6];
  const sec8 = GDD_DATA.sections[7];
  const sec9 = GDD_DATA.sections[8];

  const canvases: HTMLCanvasElement[] = [];

  // ==========================================
  // PAGE 1: Title, Abstract, Sec 1 & Sec 2
  // ==========================================
  {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawHeaderAndFooter(ctx, CANVAS_W, CANVAS_H, 1, 5);

    let y = 130;
    // Main Title
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 36px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(GDD_DATA.title, CANVAS_W / 2, y);
    y += 50;

    // Subtitle
    ctx.fillStyle = '#475569';
    ctx.font = '600 20px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(GDD_DATA.subTitle, CANVAS_W / 2, y);
    y += 38;

    // Meta bar
    ctx.fillStyle = '#64748b';
    ctx.font = 'normal 16px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(
      `버전: ${GDD_DATA.version}    |    작성일: ${GDD_DATA.date}    |    작성자: ${GDD_DATA.author}`,
      CANVAS_W / 2,
      y
    );
    y += 40;

    // Double divider
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + contentW, y);
    ctx.stroke();
    y += 24;

    // Executive summary box
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(startX, y, contentW, 140);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(startX, y, 6, 140);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('【 문서 개요 및 핵심 기획 목표 (Executive Summary) 】', startX + 24, y + 16);

    ctx.fillStyle = '#334155';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    const absLines = wrapKoreanText(ctx, GDD_DATA.abstract, contentW - 48);
    let absY = y + 48;
    for (const l of absLines) {
      ctx.fillText(l, startX + 24, absY);
      absY += 24;
    }
    y += 165;

    // Section 1
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec1.title, startX, y);
    y += 32;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec1.subtitle, startX, y);
    y += 26;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const item of sec1.content) {
      const lines = wrapKoreanText(ctx, item, contentW - 10);
      for (const line of lines) {
        ctx.fillText(line, startX, y);
        y += 23;
      }
      y += 2;
    }
    y += 10;

    // 1.1 Benchmarking box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, y, contentW, 115);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, contentW, 115);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('1.1 기획 의도 및 벤치마킹 (Diep.io 분석):', startX + 16, y + 14);

    ctx.fillStyle = '#334155';
    ctx.font = 'normal 14.5px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    const benchText = sec1.subsections?.[0]?.paragraphs?.join(' ') || '';
    const benchLines = wrapKoreanText(ctx, benchText, contentW - 32);
    let benchY = y + 42;
    for (const bl of benchLines) {
      ctx.fillText(bl, startX + 16, benchY);
      benchY += 22;
    }
    y += 140;

    // Section 2
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec2.title, startX, y);
    y += 32;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec2.subtitle, startX, y);
    y += 26;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const item of sec2.content) {
      const lines = wrapKoreanText(ctx, item, contentW - 10);
      for (const line of lines) {
        ctx.fillText(line, startX, y);
        y += 23;
      }
    }

    canvases.push(canvas);
  }

  // ==========================================
  // PAGE 2: Controls Table & 17 Classes Table
  // ==========================================
  {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawHeaderAndFooter(ctx, CANVAS_W, CANVAS_H, 2, 5);

    let y = 100;
    // 2.1 Controls Table
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('2.1 물리 및 실시간 조작 체계 (Controls & Physics)', startX, y);
    y += 26;

    if (sec2.subsections?.[0]?.table) {
      const t = sec2.subsections[0].table;
      y = drawTable(ctx, startX, y, t.headers, t.rows, [220, 240, contentW - 460], 14, 23);
    }
    y += 35;

    // Section 3
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec3.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec3.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const c of sec3.content) {
      ctx.fillText(c, startX, y);
      y += 24;
    }
    y += 8;

    // 3.2 15 Tanks Spec Table
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('3.2 대표 15종 클래스별 스펙 제원표', startX, y);
    y += 24;

    if (sec3.subsections?.[1]?.table) {
      const t = sec3.subsections[1].table;
      // headers: ['클래스명', '티어/레벨', '포신 수', '특수 메커니즘', '주요 장점']
      y = drawTable(
        ctx,
        startX,
        y,
        t.headers,
        t.rows,
        [190, 120, 110, 380, contentW - 800],
        13,
        20
      );
    }

    canvases.push(canvas);
  }

  // ==========================================
  // PAGE 3: Section 4 Stats & Section 5 Shapes
  // ==========================================
  {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawHeaderAndFooter(ctx, CANVAS_W, CANVAS_H, 3, 5);

    let y = 100;
    // Section 4
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec4.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec4.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const c of sec4.content) {
      ctx.fillText(c, startX, y);
      y += 24;
    }
    y += 8;

    // 4.1 Stats Table
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('4.1 8대 스탯 상세 정의 및 밸런스 공식', startX, y);
    y += 24;

    if (sec4.subsections?.[0]?.table) {
      const t = sec4.subsections[0].table;
      // headers: ['스탯 번호', '스탯 명칭', '영문명', '기본값', '포인트당 증가 공식', '인게임 효과']
      y = drawTable(
        ctx,
        startX,
        y,
        t.headers,
        t.rows,
        [80, 130, 160, 100, 310, contentW - 780],
        13,
        21
      );
    }
    y += 24;

    // 4.2 Archetype Builds Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, y, contentW, 135);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, contentW, 135);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('4.2 플레이어 전술 빌드 (Archetype) 설계 예시', startX + 16, y + 14);

    ctx.fillStyle = '#334155';
    ctx.font = 'normal 14px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    let archY = y + 40;
    if (sec4.subsections?.[1]?.items) {
      for (const item of sec4.subsections[1].items) {
        const lines = wrapKoreanText(ctx, '• ' + item, contentW - 32);
        for (const l of lines) {
          ctx.fillText(l, startX + 16, archY);
          archY += 21;
        }
      }
    }
    y += 160;

    // Section 5
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec5.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec5.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const c of sec5.content) {
      const lines = wrapKoreanText(ctx, c, contentW);
      for (const l of lines) {
        ctx.fillText(l, startX, y);
        y += 22;
      }
    }
    y += 12;

    // 5.1 Shapes Table
    if (sec5.subsections?.[0]?.table) {
      const t = sec5.subsections[0].table;
      y = drawTable(
        ctx,
        startX,
        y,
        t.headers,
        t.rows,
        [180, 160, 100, 120, 180, contentW - 740],
        13,
        22
      );
    }

    canvases.push(canvas);
  }

  // ==========================================
  // PAGE 4: Section 6 AI Architecture & Section 7 Tech
  // ==========================================
  {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawHeaderAndFooter(ctx, CANVAS_W, CANVAS_H, 4, 5);

    let y = 100;
    // Section 6
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec6.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec6.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const c of sec6.content) {
      const lines = wrapKoreanText(ctx, c, contentW);
      for (const l of lines) {
        ctx.fillText(l, startX, y);
        y += 23;
      }
    }
    y += 16;

    // 6.1 FSM Box
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, y, contentW, 260);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, contentW, 260);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 17px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('6.1 AI 상태 머신(Finite State Machine) 5대 제어 알고리즘:', startX + 18, y + 16);

    ctx.fillStyle = '#334155';
    ctx.font = 'normal 14.5px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    let fsmY = y + 46;
    if (sec6.subsections?.[0]?.items) {
      for (const item of sec6.subsections[0].items) {
        const lines = wrapKoreanText(ctx, item, contentW - 36);
        for (const l of lines) {
          ctx.fillText(l, startX + 18, fsmY);
          fsmY += 21;
        }
        fsmY += 3;
      }
    }
    y += 290;

    // Section 7
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec7.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec7.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(startX, y, contentW, 220);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(startX, y, 6, 220);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    let techY = y + 20;
    for (const item of sec7.content) {
      const lines = wrapKoreanText(ctx, item, contentW - 40);
      for (const l of lines) {
        ctx.fillText(l, startX + 24, techY);
        techY += 24;
      }
      techY += 5;
    }

    canvases.push(canvas);
  }

  // ==========================================
  // PAGE 5: Section 8 UI/UX, Section 9 Roadmap, Approval
  // ==========================================
  {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawHeaderAndFooter(ctx, CANVAS_W, CANVAS_H, 5, 5);

    let y = 100;
    // Section 8
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec8.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec8.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    for (const c of sec8.content) {
      const lines = wrapKoreanText(ctx, c, contentW);
      for (const l of lines) {
        ctx.fillText(l, startX, y);
        y += 23;
      }
      y += 4;
    }
    y += 25;

    // Section 9
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 22px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec9.title, startX, y);
    y += 30;

    ctx.fillStyle = '#64748b';
    ctx.font = '600 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText(sec9.subtitle, startX, y);
    y += 24;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(startX, y, contentW, 190);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, contentW, 190);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'normal 15px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    let roadY = y + 20;
    for (const item of sec9.content) {
      const lines = wrapKoreanText(ctx, item, contentW - 36);
      for (const l of lines) {
        ctx.fillText(l, startX + 18, roadY);
        roadY += 23;
      }
      roadY += 5;
    }
    y += 225;

    // Approval Signatures Table
    ctx.fillStyle = '#fcfcfd';
    ctx.fillRect(startX, y, contentW, 200);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(startX, y, contentW, 200);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
    ctx.fillText('【 프로젝트 개발 승인 및 서명란 (Approval & Signatures) 】', CANVAS_W / 2, y + 22);

    const signTable = [
      ['기획 총괄 (Lead)', '게임 디자인팀', '(인 / 서명완료)', '2026. 09. 28'],
      ['기술 총괄 (Tech)', '엔진 아키텍처팀', '(인 / 서명완료)', '2026. 09. 28'],
      ['품질 검수 (QA)', 'QA 엔지니어링팀', '(인 / 승인완료)', '2026. 09. 28'],
    ];
    drawTable(
      ctx,
      startX + 20,
      y + 52,
      ['구분', '직책 / 부서', '성명 / 승인', '승인 일자'],
      signTable,
      [240, 260, 280, contentW - 820],
      14,
      22
    );

    canvases.push(canvas);
  }

  // ==========================================
  // Assemble & Download jsPDF Multi-page PDF
  // ==========================================
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < canvases.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }
    const imgData = canvases[i].toDataURL('image/jpeg', 0.94);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  // Trigger download via Blob URL for universal browser & iframe compatibility
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `대포키우기_게임개발계획서_${GDD_DATA.version}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
