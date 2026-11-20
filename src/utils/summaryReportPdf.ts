import { jsPDF } from 'jspdf';
import {
  CLINICAL_DISCLAIMER,
  FRIENDLY_CATEGORY_LABELS,
  ScaleResult,
  getGentleStatus,
} from '../data/dass21Data';
import { KINDNESS_ACTIVITIES, KindnessActivity } from '../components/KindnessActivityModal';

interface SummaryReportParams {
  participantName: string;
  participantAge: string;
  results: ScaleResult[];
  completedActivities: KindnessActivity['id'][];
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | [number, number, number, number]
) {
  const [tl, tr, br, bl] = typeof r === 'number' ? [r, r, r, r] : r;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx + size * 0.16, cy - size * 0.16, cx + size, cy);
  ctx.quadraticCurveTo(cx + size * 0.16, cy + size * 0.16, cx, cy + size);
  ctx.quadraticCurveTo(cx - size * 0.16, cy + size * 0.16, cx - size, cy);
  ctx.quadraticCurveTo(cx - size * 0.16, cy - size * 0.16, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMiniCompanionFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  variant: 'yellow' | 'pink' | 'blue'
) {
  const fillMap = {
    yellow: '#FFF4B8',
    pink: '#FFE4F0',
    blue: '#DCF2FF',
  };
  const strokeMap = {
    yellow: '#D9AE1C',
    pink: '#D86C99',
    blue: '#3A9CE0',
  };

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fillMap[variant];
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = strokeMap[variant];
  ctx.stroke();

  // Happy eyes
  ctx.fillStyle = '#11131D';
  ctx.beginPath();
  ctx.arc(cx - r * 0.28, cy - r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.28, cy - r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.strokeStyle = '#11131D';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.arc(cx, cy + r * 0.08, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawCelebrationOlieAndBuddies(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  baseY: number
) {
  ctx.save();

  // Left Sky Blue buddy
  ctx.fillStyle = '#7FD0FF';
  ctx.beginPath();
  ctx.moveTo(centerX - 165, baseY + 12);
  ctx.bezierCurveTo(centerX - 170, baseY - 38, centerX - 140, baseY - 68, centerX - 112, baseY - 68);
  ctx.bezierCurveTo(centerX - 84, baseY - 68, centerX - 60, baseY - 38, centerX - 64, baseY + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#11131D';
  ctx.beginPath();
  ctx.arc(centerX - 125, baseY - 26, 3.8, 0, Math.PI * 2);
  ctx.arc(centerX - 101, baseY - 26, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#11131D';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX - 113, baseY - 17, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Right Coral Pink buddy
  ctx.fillStyle = '#FFAEC9';
  ctx.beginPath();
  ctx.moveTo(centerX + 64, baseY + 12);
  ctx.bezierCurveTo(centerX + 60, baseY - 38, centerX + 84, baseY - 68, centerX + 112, baseY - 68);
  ctx.bezierCurveTo(centerX + 140, baseY - 68, centerX + 170, baseY - 38, centerX + 165, baseY + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#11131D';
  ctx.beginPath();
  ctx.arc(centerX + 101, baseY - 26, 3.8, 0, Math.PI * 2);
  ctx.arc(centerX + 125, baseY - 26, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#11131D';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(centerX + 113, baseY - 17, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Center Sunny Yellow Olie
  ctx.fillStyle = '#F7DF4E';
  ctx.strokeStyle = '#E5BE1A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 66, baseY + 16);
  ctx.bezierCurveTo(centerX - 72, baseY - 52, centerX - 38, baseY - 96, centerX - 10, baseY - 96);
  // Little tuft
  ctx.lineTo(centerX, baseY - 112);
  ctx.lineTo(centerX + 10, baseY - 96);
  ctx.bezierCurveTo(centerX + 38, baseY - 96, centerX + 72, baseY - 52, centerX + 66, baseY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Raised happy arms
  ctx.strokeStyle = '#F7DF4E';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - 56, baseY - 26);
  ctx.quadraticCurveTo(centerX - 84, baseY - 52, centerX - 74, baseY - 78);
  ctx.moveTo(centerX + 56, baseY - 26);
  ctx.quadraticCurveTo(centerX + 84, baseY - 52, centerX + 74, baseY - 78);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = '#FF93B3';
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.ellipse(centerX - 34, baseY - 26, 11, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + 34, baseY - 26, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Olie eyes & happy open smile
  ctx.fillStyle = '#11131D';
  ctx.beginPath();
  ctx.arc(centerX - 20, baseY - 46, 5.2, 0, Math.PI * 2);
  ctx.arc(centerX + 20, baseY - 46, 5.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX - 18.5, baseY - 47.8, 1.8, 0, Math.PI * 2);
  ctx.arc(centerX + 21.5, baseY - 47.8, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#11131D';
  ctx.beginPath();
  ctx.arc(centerX, baseY - 26, 15, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Sparkles
  drawSparkle(ctx, centerX - 155, baseY - 92, 11, '#B8F23B');
  drawSparkle(ctx, centerX + 152, baseY - 88, 12, '#FFE56E');
  drawSparkle(ctx, centerX - 92, baseY - 108, 7, '#FFFFFF');
  drawSparkle(ctx, centerX + 94, baseY - 110, 8, '#B8F23B');

  ctx.restore();
}

export async function downloadColorfulSummaryPdf({
  participantName,
  participantAge,
  results,
  completedActivities,
}: SummaryReportParams): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready;
  }

  const width = 1240;
  const height = 1660;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize canvas for PDF summary.');
  }

  const fontSans = '"Plus Jakarta Sans", "DM Sans", system-ui, sans-serif';
  const who = participantName.trim() || 'Friend';
  const ageText = participantAge.trim() ? `Age ${participantAge.trim()}` : '';
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 1. Soft Colorful Wellbeing Aura Background
  ctx.fillStyle = '#EAEDF7';
  ctx.fillRect(0, 0, width, height);

  const glowLeft = ctx.createRadialGradient(160, 180, 20, 160, 180, 480);
  glowLeft.addColorStop(0, 'rgba(127, 208, 255, 0.36)');
  glowLeft.addColorStop(1, 'rgba(127, 208, 255, 0)');
  ctx.fillStyle = glowLeft;
  ctx.fillRect(0, 0, width, height);

  const glowRight = ctx.createRadialGradient(1080, 320, 20, 1080, 320, 440);
  glowRight.addColorStop(0, 'rgba(255, 224, 102, 0.34)');
  glowRight.addColorStop(1, 'rgba(255, 224, 102, 0)');
  ctx.fillStyle = glowRight;
  ctx.fillRect(0, 0, width, height);

  const glowBottom = ctx.createRadialGradient(840, 1460, 20, 840, 1460, 480);
  glowBottom.addColorStop(0, 'rgba(255, 174, 201, 0.3)');
  glowBottom.addColorStop(1, 'rgba(255, 174, 201, 0)');
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, width, height);

  // 2. Main Outer White Report Card
  const cardX = 56;
  const cardY = 54;
  const cardW = width - 112;
  const cardH = height - 108;

  ctx.save();
  ctx.shadowColor = 'rgba(30, 32, 40, 0.14)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#D8DCEB';
  ctx.stroke();

  // 3. Indigo Celebration Hero Header
  const heroH = 385;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, heroH, [40, 40, 0, 0]);
  ctx.clip();

  const heroGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + heroH);
  heroGrad.addColorStop(0, '#231073');
  heroGrad.addColorStop(0.52, '#4528B8');
  heroGrad.addColorStop(1, '#6B4EFF');
  ctx.fillStyle = heroGrad;
  ctx.fillRect(cardX, cardY, cardW, heroH);

  drawCelebrationOlieAndBuddies(ctx, width / 2, cardY + 184);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 44px ${fontSans}`;
  ctx.fillText(`Congratulations, ${who}!`, width / 2, cardY + 258, cardW - 96);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.font = `500 22px ${fontSans}`;
  ctx.fillText(
    'Olie and friends are proud of you for taking a gentle pause for yourself.',
    width / 2,
    cardY + 300
  );

  // Participant Metadata Line (zero dashes)
  const metaParts = [who, ...(ageText ? [ageText] : []), dateStr];
  ctx.fillStyle = '#B8F23B';
  ctx.font = `700 18px ${fontSans}`;
  ctx.fillText(metaParts.join('  ·  '), width / 2, cardY + 344);
  ctx.restore();

  // 4. Three Colorful Mood Insight Cards
  const padX = cardX + 52;
  const innerW = cardW - 104;
  const cardsY = cardY + heroH + 46;
  const cardGap = 24;
  const miniCardW = (innerW - cardGap * 2) / 3;
  const miniCardH = 264;

  const palette: {
    bg: string;
    border: string;
    variant: 'yellow' | 'pink' | 'blue';
  }[] = [
    { bg: '#FFE56E', border: '#ECC732', variant: 'yellow' },
    { bg: '#FFB9D5', border: '#EE8CB4', variant: 'pink' },
    { bg: '#96D8FF', border: '#5BB7F2', variant: 'blue' },
  ];

  results.forEach((res, idx) => {
    const cx = padX + idx * (miniCardW + cardGap);
    const theme = palette[idx % palette.length];

    drawRoundedRect(ctx, cx, cardsY, miniCardW, miniCardH, 28);
    ctx.fillStyle = theme.bg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.border;
    ctx.stroke();

    drawMiniCompanionFace(ctx, cx + miniCardW - 46, cardsY + 46, 23, theme.variant);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#11131D';
    ctx.font = `700 23px ${fontSans}`;
    ctx.fillText(FRIENDLY_CATEGORY_LABELS[res.category], cx + 26, cardsY + 52);

    ctx.font = `700 30px ${fontSans}`;
    ctx.fillText(getGentleStatus(res.severity), cx + 26, cardsY + 132);

    ctx.fillStyle = '#2B3040';
    ctx.font = `500 17px ${fontSans}`;
    const descLines = wrapText(ctx, res.description, miniCardW - 52);
    descLines.slice(0, 3).forEach((line, lineIdx) => {
      ctx.fillText(line, cx + 26, cardsY + 178 + lineIdx * 24);
    });
  });

  // 5. Small Kindnesses with Olie Section
  const kindY = cardsY + miniCardH + 34;
  const kindH = 340;
  drawRoundedRect(ctx, padX, kindY, innerW, kindH, 28);
  ctx.fillStyle = '#F2F4FB';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#CFD5E6';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#11131D';
  ctx.font = `700 24px ${fontSans}`;
  ctx.fillText('Small Kindnesses with Olie', padX + 32, kindY + 48);

  const badgeColors: Record<KindnessActivity['id'], string> = {
    water: '#1D74D8',
    shoulders: '#5938EE',
    window: '#E08A00',
    hello: '#D63672',
  };

  const actGap = 18;
  const actW = (innerW - 64 - actGap) / 2;
  const actH = 108;

  KINDNESS_ACTIVITIES.forEach((act, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const ax = padX + 32 + col * (actW + actGap);
    const ay = kindY + 76 + row * (actH + 16);
    const done = completedActivities.includes(act.id);

    drawRoundedRect(ctx, ax, ay, actW, actH, 20);
    ctx.fillStyle = done ? '#D7F7B2' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = done ? '#82CF38' : '#CFD5E6';
    ctx.stroke();

    // Colored icon tile
    drawRoundedRect(ctx, ax + 18, ay + 27, 54, 54, 15);
    ctx.fillStyle = badgeColors[act.id];
    ctx.fill();

    // Simple crisp glyph inside badge
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ax + 45, ay + 54, 10, 0, Math.PI * 2);
    ctx.fill();

    // Activity text
    ctx.fillStyle = '#11131D';
    ctx.font = `700 18px ${fontSans}`;
    const titleLines = wrapText(ctx, act.title, actW - 140);
    const startTextY = titleLines.length > 1 ? ay + 46 : ay + 60;
    titleLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, ax + 88, startTextY + i * 24);
    });

    // Completion indicator circle
    ctx.beginPath();
    ctx.arc(ax + actW - 28, ay + actH / 2, 13, 0, Math.PI * 2);
    if (done) {
      ctx.fillStyle = '#11131D';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax + actW - 34, ay + actH / 2);
      ctx.lineTo(ax + actW - 29, ay + actH / 2 + 5);
      ctx.lineTo(ax + actW - 21, ay + actH / 2 - 5);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#B8BFD4';
      ctx.stroke();
    }
  });

  // 6. Supportive Remember Banner
  const remY = kindY + kindH + 34;
  const remH = 216;
  drawRoundedRect(ctx, padX, remY, innerW, remH, 28);
  ctx.fillStyle = '#EAE6FF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#C6BCF8';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#11131D';
  ctx.font = `700 22px ${fontSans}`;
  ctx.fillText('Remember', padX + 34, remY + 48);

  ctx.fillStyle = '#2B3040';
  ctx.font = `500 20px ${fontSans}`;
  const remLines = wrapText(ctx, CLINICAL_DISCLAIMER, innerW - 68);
  remLines.forEach((line, idx) => {
    ctx.fillText(line, padX + 34, remY + 86 + idx * 32);
  });

  // 7. Quiet Footer Inside Card
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2B3040';
  ctx.font = `600 17px ${fontSans}`;
  ctx.fillText(
    'Private Weekly Check In with Olie  ·  Personal Reflection Summary',
    width / 2,
    cardY + cardH - 34
  );

  // Convert crisp canvas directly into a full-bleed PDF
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling'],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'FAST');
  pdf.save(`my_checkin_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}
