import { useState, useRef, useEffect, useCallback } from 'react';
import { Magnet, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface FieldConfig {
  charge?: number;
  field_lines?: number;
}

const K = 9e9;

/**
 * Electric field-line viewer. Field lines are traced numerically from a seed
 * point, which is what makes the rules visible: lines start on + charges and
 * end on − charges, never cross, and get denser where the field is stronger.
 */
export function FieldLineViewer({ config }: InteractiveProps) {
  const cfg = config as FieldConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [strength, setStrength] = useState(cfg.charge ?? 2);
  const [lineCount, setLineCount] = useState(cfg.field_lines ?? 12);
  const [polarity, setPolarity] = useState<'opposite' | 'like'>('opposite');
  const [separation, setSeparation] = useState(140);
  const [showVectors, setShowVectors] = useState(true);

  const reset = useCallback(() => {
    setStrength(cfg.charge ?? 2);
    setSeparation(140);
  }, [cfg.charge]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'hsl(220, 30%, 98%)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const sep = Math.min(separation, w / 2 - 40);
    const pts = [
      { x: cx - sep / 2, y: cy, s: strength },
      { x: cx + sep / 2, y: cy, s: polarity === 'like' ? strength : -strength },
    ];

    const fieldAt = (x: number, y: number) => {
      let fx = 0;
      let fy = 0;
      for (const p of pts) {
        const dx = x - p.x;
        const dy = y - p.y;
        const r2 = dx * dx + dy * dy + 400;
        const r = Math.sqrt(r2);
        const mag = (K / 100) * p.s / r2;
        fx += (dx / r) * mag;
        fy += (dy / r) * mag;
      }
      return { fx, fy };
    };

    // Trace field lines outwards from each positive pole.
    ctx.lineWidth = 1.4;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      let x = pts[0].x + Math.cos(angle) * 18;
      let y = pts[0].y + Math.sin(angle) * 18;

      ctx.strokeStyle = 'hsl(210, 70%, 45%)';
      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let step = 0; step < 400; step++) {
        const { fx, fy } = fieldAt(x, y);
        const mag = Math.hypot(fx, fy);
        if (mag < 1e-6) break;
        x += (fx / mag) * 2.5;
        y += (fy / mag) * 2.5;

        if (x < 2 || x > w - 2 || y < 2 || y > h - 2) break;

        // Stop once we land close to the opposite-sign pole.
        for (const p of pts) {
          if (Math.sign(p.s) !== Math.sign(strength) && Math.hypot(x - p.x, y - p.y) < 18) {
            step = 400;
          }
        }
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Arrowhead in the direction of travel.
      const { fx, fy } = fieldAt(x, y);
      const mag = Math.hypot(fx, fy);
      if (mag > 1e-6 && x > 4 && x < w - 4 && y > 4 && y < h - 4) {
        const a = Math.atan2(fy, fx);
        ctx.fillStyle = 'hsl(210, 70%, 40%)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6 * Math.cos(a - 0.4), y - 6 * Math.sin(a - 0.4));
        ctx.lineTo(x - 6 * Math.cos(a + 0.4), y - 6 * Math.sin(a + 0.4));
        ctx.closePath();
        ctx.fill();
      }
    }

    if (showVectors) {
      ctx.strokeStyle = 'hsl(150, 60%, 40%)';
      ctx.lineWidth = 1;
      for (let gx = 20; gx < w; gx += 40) {
        for (let gy = 20; gy < h; gy += 40) {
          const { fx, fy } = fieldAt(gx, gy);
          const len = Math.hypot(fx, fy);
          if (len < 1e-5) continue;
          const scale = 900 / (1 + strength);
          const ex = gx + (fx / len) * Math.min(14, len * scale);
          const ey = gy + (fy / len) * Math.min(14, len * scale);
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }
    }

    for (const p of pts) {
      const positive = p.s >= 0;
      ctx.fillStyle = positive ? 'hsl(0, 70%, 50%)' : 'hsl(210, 80%, 45%)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(positive ? '+' : '−', p.x, p.y);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    ctx.fillStyle = 'hsl(0, 0%, 15%)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Charge magnitude: ${strength.toFixed(1)} C`, 10, 16);
    ctx.font = '11px sans-serif';
    ctx.fillText(
      polarity === 'opposite'
        ? 'Opposite charges: field lines run from + to −'
        : 'Like charges: a neutral point sits between them',
      10,
      h - 10
    );
  }, [strength, lineCount, polarity, separation, showVectors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 260;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Magnet className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Field Line Viewer</h4>
        <div className="ml-auto flex gap-1">
          {(['opposite', 'like'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={polarity === p ? 'default' : 'outline'}
              onClick={() => setPolarity(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ height: 260 }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Charge magnitude: <span className="text-foreground">{strength.toFixed(1)} C</span>
          </label>
          <Slider value={[strength]} onValueChange={([v]) => setStrength(v)} min={0.5} max={6} step={0.5} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Field lines: <span className="text-foreground">{lineCount}</span>
          </label>
          <Slider value={[lineCount]} onValueChange={([v]) => setLineCount(v)} min={4} max={28} step={2} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Separation: <span className="text-foreground">{separation.toFixed(0)} px</span>
          </label>
          <Slider value={[separation]} onValueChange={([v]) => setSeparation(v)} min={60} max={260} step={10} />
        </div>
        <div className="flex items-end">
          <Button size="sm" variant={showVectors ? 'secondary' : 'outline'} onClick={() => setShowVectors(!showVectors)}>
            {showVectors ? 'Hide' : 'Show'} field vectors
          </Button>
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Rules of field lines: they start on + and finish on −, never cross, and the density shows strength.</p>
        <p>Bring the like charges closer — watch the neutral point appear, where the field is exactly zero.</p>
      </div>
    </div>
  );
}
