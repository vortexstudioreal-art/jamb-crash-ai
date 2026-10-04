import { useState, useRef, useEffect, useCallback } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface CircuitConfig {
  voltage?: number;
  resistors?: number;
}

type Mode = 'series' | 'parallel';

/**
 * Resistor network builder. Series/parallel are the only two arrangements in
 * the JAMB syllabus, and the whole point of the widget is that the student
 * sees the equivalent resistance change as resistors are added or removed.
 */
export function CircuitSimulator({ config }: InteractiveProps) {
  const cfg = config as CircuitConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<Mode>('series');
  const [voltage, setVoltage] = useState(cfg.voltage ?? 12);
  const [count, setCount] = useState(cfg.resistors ?? 3);
  const [eachOhms, setEachOhms] = useState(10);
  const [flow, setFlow] = useState(0);

  const totalResistance = mode === 'series' ? count * eachOhms : eachOhms / count;
  const current = totalResistance > 0 ? voltage / totalResistance : 0;
  const power = current * current * totalResistance;
  const perResistor = mode === 'series' ? current : current / count;

  const reset = useCallback(() => setFlow(0), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'hsl(45, 30%, 96%)';
    ctx.fillRect(0, 0, w, h);

    const pad = 30;
    const top = 50;
    const bottom = h - 40;

    // Battery on the left rail.
    ctx.strokeStyle = 'hsl(30, 40%, 25%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, top);
    ctx.lineTo(pad, bottom);
    ctx.stroke();

    const plateY = (top + bottom) / 2;
    ctx.strokeStyle = 'hsl(0, 0%, 20%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pad - 12, plateY - 8);
    ctx.lineTo(pad + 12, plateY - 8);
    ctx.moveTo(pad - 7, plateY + 8);
    ctx.lineTo(pad + 7, plateY + 8);
    ctx.stroke();
    ctx.fillStyle = 'hsl(0, 0%, 15%)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`+ ${voltage.toFixed(0)} V`, pad - 22, plateY - 14);
    ctx.fillText('−', pad + 18, plateY + 12);

    // Resistors: series along the top rail, parallel as stacked branches.
    const right = w - pad;
    const drawResistor = (x: number, y: number) => {
      ctx.strokeStyle = 'hsl(15, 70%, 40%)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - 26, y);
      ctx.lineTo(x - 16, y);
      ctx.lineTo(x - 16, y - 12);
      ctx.lineTo(x - 6, y + 12);
      ctx.lineTo(x + 6, y - 12);
      ctx.lineTo(x + 16, y + 12);
      ctx.lineTo(x + 16, y);
      ctx.lineTo(x + 26, y);
      ctx.stroke();
      ctx.fillStyle = 'hsl(15, 70%, 30%)';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${eachOhms}Ω`, x - 12, y - 18);
    };

    ctx.strokeStyle = 'hsl(30, 40%, 25%)';
    ctx.lineWidth = 2;

    if (mode === 'series') {
      ctx.beginPath();
      ctx.moveTo(pad, plateY);
      ctx.lineTo(pad, top);
      ctx.lineTo(right, top);
      ctx.moveTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(pad, bottom);
      ctx.stroke();

      const span = right - pad;
      for (let i = 0; i < count; i++) {
        const x = pad + (span * (i + 0.5)) / count;
        drawResistor(x, top);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(pad, plateY);
      ctx.lineTo(pad, top);
      ctx.lineTo(pad + 30, top);
      ctx.stroke();

      const span = right - pad - 60;
      for (let i = 0; i < count; i++) {
        const y = top + (i * (bottom - top)) / (count - 1 || 1);
        ctx.strokeStyle = 'hsl(30, 40%, 25%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad + 30, y);
        ctx.lineTo(right - 30, y);
        ctx.stroke();
        drawResistor((pad + 30 + right - 30) / 2, y);
      }

      ctx.beginPath();
      ctx.moveTo(right - 30, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right - 30, bottom);
      ctx.stroke();
    }

    // Charge carriers moving along the loop.
    ctx.fillStyle = 'hsl(210, 80%, 45%)';
    const loopLen = 2 * (bottom - top) + 2 * (right - pad);
    for (let i = 0; i < 14; i++) {
      const d = ((flow * 40 + (i * loopLen) / 14) % loopLen + loopLen) % loopLen;
      let x: number;
      let y: number;
      if (mode === 'series') {
        if (d < right - pad) {
          x = pad + d;
          y = top;
        } else if (d < right - pad + (bottom - top)) {
          x = right;
          y = top + (d - (right - pad));
        } else if (d < 2 * (right - pad) + (bottom - top)) {
          x = right - (d - (right - pad) - (bottom - top));
          y = bottom;
        } else {
          x = pad;
          y = bottom - (d - 2 * (right - pad) - (bottom - top));
        }
      } else {
        x = pad + 30 + (d % (right - pad - 60));
        y = top;
      }
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'hsl(0, 0%, 15%)';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `R_total = ${totalResistance.toFixed(1)}Ω    I = ${current.toFixed(2)} A    P = ${power.toFixed(1)} W`,
      12,
      18
    );
    ctx.font = '11px sans-serif';
    ctx.fillText(
      mode === 'series'
        ? `Current through every resistor: ${perResistor.toFixed(2)} A`
        : `Current through each branch: ${perResistor.toFixed(2)} A`,
      12,
      h - 12
    );
  }, [mode, count, eachOhms, voltage, flow, totalResistance, current, power, perResistor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 250;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (current <= 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setFlow((f) => f + dt * Math.min(current, 3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Circuit Simulator</h4>
        <div className="ml-auto flex gap-1">
          {(['series', 'parallel'] as Mode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? 'default' : 'outline'}
              onClick={() => {
                setMode(m);
                reset();
              }}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ height: 250 }} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            EMF: <span className="text-foreground">{voltage.toFixed(0)} V</span>
          </label>
          <Slider value={[voltage]} onValueChange={([v]) => setVoltage(v)} min={1} max={24} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Resistors: <span className="text-foreground">{count}</span>
          </label>
          <Slider value={[count]} onValueChange={([v]) => setCount(v)} min={1} max={6} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Each resistor: <span className="text-foreground">{eachOhms.toFixed(0)} Ω</span>
          </label>
          <Slider value={[eachOhms]} onValueChange={([v]) => setEachOhms(v)} min={2} max={100} step={2} />
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Series:</strong> R = R₁ + R₂ + … — adding resistors <em>raises</em> total resistance and
          lowers current.
        </p>
        <p>
          <strong>Parallel:</strong> 1/R = 1/R₁ + 1/R₂ + … — adding resistors <em>lowers</em> total
          resistance and raises current.
        </p>
        <p>
          <strong>V = IR</strong> — watch the current drop as you add series resistors.
        </p>
      </div>
    </div>
  );
}
