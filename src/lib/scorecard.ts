export interface ScorecardData {
  userName: string;
  title: string;
  score: number;
  maxScore: number;
  bandLabel: string;
  sections: { name: string; score: number; correct: number; total: number }[];
}

const W = 1080;
const H = 1620;
const PAD = 64;

const clampText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const renderScorecardCanvas = (data: ScorecardData): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(0.5, '#7c3aed');
  gradient.addColorStop(1, '#db2777');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc((i * 337) % W, (i * 491) % H, 190 + i * 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.fillText('JAMB CRASH AI', W / 2, 150);

  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(data.title, W / 2, 212);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 34px Arial, sans-serif';
  const userName = clampText(ctx, data.userName, W - PAD * 2);
  ctx.fillText(userName, W / 2, 300);

  ctx.font = '800 170px Arial, sans-serif';
  ctx.fillText(String(data.score), W / 2, 520);

  ctx.font = '500 40px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(`out of ${data.maxScore}`, W / 2, 590);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillText(data.bandLabel, W / 2, 680);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + 60, 740);
  ctx.lineTo(W - PAD - 60, 740);
  ctx.stroke();

  const barW = W - PAD * 2 - 80;
  const barH = 26;
  const startY = 800;
  const gap = 150;

  data.sections.forEach((s, i) => {
    const y = startY + i * gap;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial, sans-serif';
    const name = clampText(ctx, s.name, barW * 0.45);
    ctx.fillText(name, PAD + 40, y + 30);

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, PAD + 40, y + 52, barW, barH, 13);
    ctx.fill();

    const pct = Math.max(0.04, s.score / 100);
    const fillGrad = ctx.createLinearGradient(PAD + 40, 0, PAD + 40 + barW, 0);
    fillGrad.addColorStop(0, '#34d399');
    fillGrad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = fillGrad;
    roundRect(ctx, PAD + 40, y + 52, barW * pct, barH, 13);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 30px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${s.correct}/${s.total}`, W - PAD - 40, y + 38);

    ctx.font = '500 26px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(`${Math.round(s.score)}%`, W - PAD - 40, y + 96);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '500 30px Arial, sans-serif';
  ctx.fillText('Study smarter, score higher.', W / 2, H - 170);

  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('jambcrashai.com', W / 2, H - 100);

  return canvas;
};

export const scorecardToPng = (data: ScorecardData): string => {
  return renderScorecardCanvas(data).toDataURL('image/png');
};

export const downloadScorecard = (data: ScorecardData): void => {
  const link = document.createElement('a');
  link.download = `jamb-crash-score-${data.score}.png`;
  link.href = scorecardToPng(data);
  link.click();
};

export const shareScorecard = async (data: ScorecardData, text: string): Promise<'downloaded' | 'shared' | 'whatsapp'> => {
  try {
    const canvas = renderScorecardCanvas(data);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    });
    const file = new File([blob], `jamb-crash-score-${data.score}.png`, { type: 'image/png' });

    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], text });
      return 'shared';
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'downloaded';
  } catch {
    const url = encodeURIComponent(`https://wa.me/?text=${text}`);
    window.open(url, '_blank');
    return 'whatsapp';
  }
};
