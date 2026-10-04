import { useState, useRef, useEffect, useCallback } from 'react';
import { LineChart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface GraphConfig {
  function?: 'sin' | 'quadratic' | 'exponential' | 'linear';
  x_min?: number;
  x_max?: number;
}

type Fn = 'linear' | 'quadratic' | 'sin' | 'exponential';

const FNS: Record<Fn, string> = {
  linear: 'y = mx + c',
  quadratic: 'y = ax² + bx + c',
  sin: 'y = A sin(Bx + C) + D',
  exponential: 'y = A·e^(kx) + D',
};

export function GraphExplorer({ config }: InteractiveProps) {
  const cfg = config as GraphConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [fn, setFn] = useState<Fn>(cfg.function ?? 'quadratic');
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [shadeArea, setShadeArea] = useState(false);
  const [xProbe, setXProbe] = useState(1);

  const xMin = cfg.x_min ?? -5;
  const xMax = cfg.x_max ?? 5;

  const yAt = useCallback(
    (x: number) => {
      switch (fn) {
        case 'linear':
          return a * x + c;
        case 'quadratic':
          return a * x * x + b * x + c;
        case 'sin':
          return a * Math.sin(b * x + c);
        case 'exponential':
          return a * Math.exp(b * x) + c;
        default:
          return 0;
      }
    },
    [fn, a, b, c]
  );

  const reset = useCallback(() => {
    setA(1);
    setB(0);
    setC(0);
    setXProbe(1);
    setShadeArea(false);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'hsl(220, 30%, 99%)';
    ctx.fillRect(0, 0, w, h);

    const padL = 40;
    const padB = 28;
    const plotW = w - padL - 12;
    const plotH = h - padB - 12;

    const yMin = -10;
    const yMax = 10;
    const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
    const sy = (y: number) => 12 + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Grid and axes.
    ctx.strokeStyle = 'hsl(220, 20%, 90%)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ctx.beginPath();
      ctx.moveTo(sx(x), 12);
      ctx.lineTo(sx(x), 12 + plotH);
      ctx.stroke();
    }
    for (let y = yMin; y <= yMax; y += 2) {
      ctx.beginPath();
      ctx.moveTo(padL, sy(y));
      ctx.lineTo(padL + plotW, sy(y));
      ctx.stroke();
    }

    ctx.strokeStyle = 'hsl(0, 0%, 35%)';
    ctx.beginPath();
    ctx.moveTo(padL, sy(0));
    ctx.lineTo(padL + plotW, sy(0));
    ctx.moveTo(sx(0), 12);
    ctx.lineTo(sx(0), 12 + plotH);
    ctx.stroke();

    ctx.fillStyle = 'hsl(0, 0%, 40%)';
    ctx.font = '10px monospace';
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ctx.fillText(String(x), sx(x) - 3, h - 12);
    }

    if (shadeArea) {
      ctx.fillStyle = 'hsl(150, 60%, 45%)';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(sx(xMin), sy(0));
      for (let px = 0; px <= plotW; px += 2) {
        const x = xMin + (px / plotW) * (xMax - xMin);
        ctx.lineTo(sx(x), sy(Math.max(yMin, Math.min(yMax, yAt(x)))));
      }
      ctx.lineTo(sx(xMax), sy(0));
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = 'hsl(210, 80%, 50%)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= plotW; px += 1) {
      const x = xMin + (px / plotW) * (xMax - xMin);
      const y = yAt(x);
      if (!Number.isFinite(y)) continue;
      const clamped = Math.max(yMin - 20, Math.min(yMax + 20, y));
      if (!started) {
        ctx.moveTo(sx(x), sy(clamped));
        started = true;
      } else {
        ctx.lineTo(sx(x), sy(clamped));
      }
    }
    ctx.stroke();

    // Probe point.
    const py = yAt(xProbe);
    if (Number.isFinite(py)) {
      const clamped = Math.max(yMin, Math.min(yMax, py));
      ctx.fillStyle = 'hsl(0, 70%, 50%)';
      ctx.beginPath();
      ctx.arc(sx(xProbe), sy(clamped), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'hsl(0, 0%, 20%)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`(${xProbe.toFixed(1)}, ${py.toFixed(2)})`, sx(xProbe) + 6, sy(clamped) - 6);
    }

    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(FNS[fn], padL + 6, 20);
  }, [fn, xProbe, shadeArea, xMin, xMax, yAt]);

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
        <LineChart className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Graph Explorer</h4>
        <div className="ml-auto flex flex-wrap gap-1">
          {(Object.keys(FNS) as Fn[]).map((f) => (
            <Button key={f} size="sm" variant={fn === f ? 'default' : 'outline'} onClick={() => setFn(f)}>
              {f}
            </Button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ height: 260 }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            a: <span className="text-foreground">{a.toFixed(2)}</span>
          </label>
          <Slider value={[a]} onValueChange={([v]) => setA(v)} min={-3} max={3} step={0.25} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            b: <span className="text-foreground">{b.toFixed(2)}</span>
          </label>
          <Slider value={[b]} onValueChange={([v]) => setB(v)} min={-4} max={4} step={0.25} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            c: <span className="text-foreground">{c.toFixed(2)}</span>
          </label>
          <Slider value={[c]} onValueChange={([v]) => setC(v)} min={-5} max={5} step={0.25} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            probe x: <span className="text-foreground">{xProbe.toFixed(1)}</span>
          </label>
          <Slider value={[xProbe]} onValueChange={([v]) => setXProbe(v)} min={xMin} max={xMax} step={0.1} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={shadeArea ? 'secondary' : 'outline'} onClick={() => setShadeArea(!shadeArea)}>
          {shadeArea ? 'Hide' : 'Show'} area under curve
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Flip <strong>a</strong> negative and watch the parabola flip upside down — a is the rate of change of
          gradient.
        </p>
        {fn === 'quadratic' && (
          <p>
            Slide <strong>b</strong> to zero and the curve becomes symmetric about the y-axis: the vertex moves to
            x = 0. A large <strong>b</strong> tilts it sideways, which is why the turning point sits at
            x = −b/2a.
          </p>
        )}
        {fn === 'linear' && (
          <p>
            With <strong>c</strong> = 0 the line runs through the origin, and the area under it from 0 to x is a
            triangle of base x and height ax — not a rectangle.
          </p>
        )}
        {fn === 'sin' && (
          <p>
            <strong>a</strong> is the amplitude: the curve swings between −a and +a around the value of c, whatever
            b does to the spacing of the waves.
          </p>
        )}
        {fn === 'exponential' && (
          <p>
            <strong>b</strong> is the growth rate, so it changes the curve from gently rising to almost vertical.
            A negative b makes it decay towards the horizontal asymptote at y = c.
          </p>
        )}
        <p>
          Shade the area under the curve, then change one coefficient at a time and watch the shaded region grow or
          shrink.
        </p>
      </div>
    </div>
  );
}
