import { useState, useRef, useEffect, useCallback } from 'react';
import { Atom, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface ChargeConfig {
  charge?: number;
  potential?: number;
}

interface Source {
  x: number;
  y: number;
  q: number;
}

const K = 9e9;

/**
 * Equipotential map. Click to add a charge, drag to move the test charge, and
 * read off V and F = qE. The point of the widget is that V falls off as 1/r
 * while the force on a test charge depends on both V and where the test charge
 * sits — a distinction JAMB questions love.
 */
export function ChargeExplorer({ config }: InteractiveProps) {
  const cfg = config as ChargeConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [sources, setSources] = useState<Source[]>([
    { x: 0.35, y: 0.4, q: cfg.charge ?? 2 },
    { x: 0.65, y: 0.6, q: -(cfg.charge ?? 2) },
  ]);
  const [probe, setProbe] = useState({ x: 0.5, y: 0.28 });
  const [probeQ, setProbeQ] = useState(1);
  const [showContours, setShowContours] = useState(true);

  const reset = useCallback(() => {
    setSources([
      { x: 0.35, y: 0.4, q: cfg.charge ?? 2 },
      { x: 0.65, y: 0.6, q: -(cfg.charge ?? 2) },
    ]);
    setProbe({ x: 0.5, y: 0.28 });
    setProbeQ(1);
  }, [cfg.charge]);

  const potentialAt = useCallback(
    (nx: number, ny: number, w: number, h: number) => {
      let v = 0;
      let fx = 0;
      let fy = 0;
      for (const s of sources) {
        const dx = nx * w - s.x * w;
        const dy = ny * h - s.y * h;
        const r2 = dx * dx + dy * dy + 900;
        v += (K / 100) * s.q / Math.sqrt(r2);
        const r = Math.sqrt(r2);
        fx += ((K / 100) * s.q * dx) / (r2 * r);
        fy += ((K / 100) * s.q * dy) / (r2 * r);
      }
      return { v, fx, fy };
    },
    [sources]
  );

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

    if (showContours) {
      const levels = [-8, -4, -2, -1, 0, 1, 2, 4, 8];
      const cell = 10;

      for (const level of levels) {
        ctx.strokeStyle = level === 0 ? 'hsl(0, 0%, 45%)' : 'hsl(210, 55%, 62%)';
        ctx.lineWidth = level === 0 ? 1.3 : 0.7;
        ctx.beginPath();

        for (let gy = 0; gy < h - cell; gy += cell) {
          for (let gx = 0; gx < w - cell; gx += cell) {
            const xs = [gx, gx + cell, gx + cell, gx];
            const ys = [gy, gy, gy + cell, gy + cell];
            const vals = xs.map((x, i) => potentialAt(x, ys[i], w, h).v - level);

            const crossings: Array<[number, number]> = [];
            for (let e = 0; e < 4; e++) {
              const next = (e + 1) % 4;
              const a = vals[e];
              const b = vals[next];
              if (a === b) continue;
              if (a > 0 === b > 0) continue;
              const t = a / (a - b);
              crossings.push([xs[e] + (xs[next] - xs[e]) * t, ys[e] + (ys[next] - ys[e]) * t]);
            }
            // Marching squares: pair the crossings and join them.
            for (let c = 0; c + 1 < crossings.length; c += 2) {
              ctx.moveTo(crossings[c][0], crossings[c][1]);
              ctx.lineTo(crossings[c + 1][0], crossings[c + 1][1]);
            }
          }
        }
        ctx.stroke();
      }
    }

    for (const s of sources) {
      const x = s.x * w;
      const y = s.y * h;
      const positive = s.q >= 0;
      ctx.fillStyle = positive ? 'hsl(0, 70%, 50%)' : 'hsl(210, 80%, 45%)';
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(positive ? '+' : '−', x, y);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Test charge and the force it feels.
    const px = probe.x * w;
    const py = probe.y * h;
    const { v, fx, fy } = potentialAt(probe.x, probe.y, w, h);
    const mag = Math.hypot(fx, fy);

    ctx.strokeStyle = 'hsl(150, 65%, 35%)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (fx / (mag || 1)) * 34, py + (fy / (mag || 1)) * 34);
    ctx.stroke();

    ctx.fillStyle = 'hsl(45, 90%, 50%)';
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 0%, 30%)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'hsl(0, 0%, 15%)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`V = ${(v / 1e5).toFixed(2)} × 10⁵ V`, 10, 16);
    ctx.font = '11px sans-serif';
    ctx.fillText(`F = qE = ${(probeQ * mag).toExponential(2)} N   |E| = ${mag.toExponential(2)} N/C`, 10, h - 10);
  }, [potentialAt, sources, probe, probeQ, showContours]);

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

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    // Near an existing source → cycle its sign; otherwise move the probe.
    for (let i = 0; i < sources.length; i++) {
      if (Math.hypot(nx - sources[i].x, ny - sources[i].y) < 0.06) {
        setSources((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, q: -s.q || cfg.charge || 1 } : s))
        );
        return;
      }
    }
    setProbe({ x: nx, y: ny });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Atom className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Charge Explorer</h4>
      </div>

      <canvas
        ref={canvasRef}
        onClick={onClick}
        className="w-full rounded-lg border border-border cursor-crosshair"
        style={{ height: 260 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Test charge q: <span className="text-foreground">{probeQ.toFixed(1)} C</span>
          </label>
          <Slider value={[probeQ]} onValueChange={([v]) => setProbeQ(v)} min={0.5} max={5} step={0.5} />
        </div>
        <div className="flex items-end">
          <Button size="sm" variant={showContours ? 'secondary' : 'outline'} onClick={() => setShowContours(!showContours)}>
            {showContours ? 'Hide' : 'Show'} equipotentials
          </Button>
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Click empty space to move the test charge; click a source to flip its sign.</p>
        <p>
          <strong>V = kQ/r</strong> — equipotential lines are close together where the field is strong, and
          V ≠ 0 everywhere except infinity for a net charge.
        </p>
      </div>
    </div>
  );
}
