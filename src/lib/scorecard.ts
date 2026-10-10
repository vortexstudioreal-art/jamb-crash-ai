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

// Fallback open-book mark (brand colors) until public/logo.png is added.
const drawBookMark = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const w = 150;
  const h = 105;
  const x = cx - w / 2;
  const y = cy - h / 2;
  // Cover
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = '#1f2937';
  ctx.fill();
  // Pages
  roundRect(ctx, x + 14, y + 12, w / 2 - 20, h - 24, 6);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  roundRect(ctx, cx + 6, y + 12, w / 2 - 20, h - 24, 6);
  ctx.fillStyle = '#4ade80';
  ctx.fill();
  // Spine
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(cx - 3, y + 8, 6, h - 16);
};

// Real logo from public/logo.png (cached after first success only — a
// failed load (offline/slow) must not stick, or the logo never appears).
// Null means "no logo": draw the fallback mark instead.
let logoCache: Promise<CanvasImageSource | null> | null = null;
export const loadScorecardLogo = (): Promise<CanvasImageSource | null> => {
  if (!logoCache) {
    logoCache = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        logoCache = null; // allow retry next time
        resolve(null);
      };
      img.src = '/logo.png';
    });
  }
  return logoCache;
};

export const renderScorecardCanvas = (
  data: ScorecardData,
  logo?: CanvasImageSource | null
): HTMLCanvasElement => {
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

  // Brand header: real logo (public/logo.png) when available,
  // otherwise a drawn open-book mark in brand colors.
  // Square badge: fits square transparent artwork and contain-fits anything
  // else, so neither dark nor light logos clash with the gradient.
  if (logo) {
    const badge = 240;
    const pad = 28;
    const dx = W / 2 - badge / 2;
    const dy = 28;
    try {
      roundRect(ctx, dx, dy, badge, badge, 48);
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.fill();
      // Contain-fit: never stretch the artwork
      const el = logo as HTMLImageElement;
      const iw = el.naturalWidth || badge;
      const ih = el.naturalHeight || badge;
      const s = Math.min((badge - pad * 2) / iw, (badge - pad * 2) / ih);
      const dw = iw * s;
      const dh = ih * s;
      ctx.drawImage(logo, dx + (badge - dw) / 2, dy + (badge - dh) / 2, dw, dh);
    } catch {
      drawBookMark(ctx, W / 2, 100);
    }
  } else {
    drawBookMark(ctx, W / 2, 100);
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('JAMB CRASH AI', W / 2, 230);
  }

  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(data.title, W / 2, 292);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 34px Arial, sans-serif';
  const userName = clampText(ctx, data.userName, W - PAD * 2);
  ctx.fillText(userName, W / 2, 360);

  ctx.font = '800 170px Arial, sans-serif';
  ctx.fillText(String(data.score), W / 2, 575);

  ctx.font = '500 40px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(`out of ${data.maxScore}`, W / 2, 645);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 40px Arial, sans-serif';
  ctx.fillText(data.bandLabel, W / 2, 725);

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + 60, 785);
  ctx.lineTo(W - PAD - 60, 785);
  ctx.stroke();

  const barW = W - PAD * 2 - 80;
  const barH = 26;
  const startY = 845;
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
  ctx.fillText('jambcrash.ai', W / 2, H - 100);

  return canvas;
};

export const scorecardToPng = async (data: ScorecardData): Promise<string> => {
  const logo = await loadScorecardLogo().catch(() => null);
  return renderScorecardCanvas(data, logo).toDataURL('image/png');
};

export const downloadScorecard = async (data: ScorecardData): Promise<void> => {
  const link = document.createElement('a');
  link.download = `jamb-crash-score-${data.score}.png`;
  link.href = await scorecardToPng(data);
  link.click();
};

export const shareScorecard = async (data: ScorecardData, text: string): Promise<'downloaded' | 'shared' | 'whatsapp'> => {
  try {
    const logo = await loadScorecardLogo().catch(() => null);
    const canvas = renderScorecardCanvas(data, logo);
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
