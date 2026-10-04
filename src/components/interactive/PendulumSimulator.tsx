import { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface PendulumConfig {
  length?: number;
  angle?: number;
  gravity?: number;
}

export function PendulumSimulator({ config }: InteractiveProps) {
  const cfg = config as PendulumConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const [length, setLength] = useState(cfg.length ?? 1);
  const [amplitude, setAmplitude] = useState(cfg.angle ?? 30);
  const [gravity, setGravity] = useState(cfg.gravity ?? 9.8);
  const [damping, setDamping] = useState(0);
  const [t, setT] = useState(0);

  const thetaMax = (amplitude * Math.PI) / 180;
  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const omega = Math.sqrt(gravity / length);

  const reset = useCallback(() => setT(0), []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'hsl(200, 30%, 97%)';
    ctx.fillRect(0, 0, w, h);

    const pivotX = w / 2;
    const pivotY = 24;
    const pixelsPerMetre = Math.min((h - pivotY - 30) / Math.max(length, 0.2), 130);
    const bobR = 10;

    const decay = Math.exp(-damping * t);
    const theta = thetaMax * decay * Math.cos(omega * t);
    const bobX = pivotX + length * pixelsPerMetre * Math.sin(theta);
    const bobY = pivotY + length * pixelsPerMetre * Math.cos(theta);

    // Height above the lowest point is purely geometric; applying `decay` here
    // as well would count the damping twice.
    const height = length * (1 - Math.cos(theta));

    // Instantaneous speed, not the peak speed: the bob is fastest at the bottom
    // of the swing and momentarily still at the extremes. Using the amplitude
    // alone made kinetic energy constant, so the energy bar never moved.
    const v = length * thetaMax * omega * decay * Math.abs(Math.sin(omega * t));
    const ke = 0.5 * (v * v);
    const pe = gravity * height;
    const total = ke + pe;
    const kePct = total > 0 ? (ke / total) * 100 : 50;

    ctx.strokeStyle = 'hsl(0, 0%, 25%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = 'hsl(0, 0%, 30%)';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, bobR);
    grad.addColorStop(0, 'hsl(210, 90%, 70%)');
    grad.addColorStop(1, 'hsl(210, 80%, 40%)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
    ctx.fill();

    // Arc showing the swing.
    ctx.strokeStyle = 'hsl(210, 40%, 70%)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      pivotX,
      pivotY,
      length * pixelsPerMetre,
      Math.PI / 2 - thetaMax,
      Math.PI / 2 + thetaMax
    );
    ctx.stroke();
    ctx.setLineDash([]);

    // Energy bar.
    const barW = w - 100;
    const barX = 50;
    const barY = h - 18;
    ctx.fillStyle = 'hsl(0, 0%, 88%)';
    ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = 'hsl(150, 65%, 40%)';
    ctx.fillRect(barX, barY, (barW * kePct) / 100, 8);
    ctx.fillStyle = 'hsl(0, 0%, 25%)';
    ctx.font = '10px sans-serif';
    ctx.fillText('KE', barX - 20, barY + 8);
    ctx.fillText('PE', barX + barW + 6, barY + 8);

    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`T = 2π√(L/g) = ${period.toFixed(2)} s`, 12, 16);
    ctx.font = '11px monospace';
    ctx.fillText(`θ = ${((theta * 180) / Math.PI).toFixed(1)}°`, 12, h - 26);
    ctx.fillText(`L = ${length.toFixed(2)} m`, 110, h - 26);
  }, [length, damping, gravity, t, thetaMax, omega, period]);

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
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => prev + dt);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Pendulum Simulator</h4>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ height: 260 }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Length L: <span className="text-foreground">{length.toFixed(2)} m</span>
          </label>
          <Slider value={[length]} onValueChange={([v]) => setLength(v)} min={0.2} max={2.5} step={0.05} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Initial angle: <span className="text-foreground">{amplitude.toFixed(0)}°</span>
          </label>
          <Slider value={[amplitude]} onValueChange={([v]) => setAmplitude(v)} min={5} max={80} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Gravity: <span className="text-foreground">{gravity.toFixed(1)} m/s²</span>
          </label>
          <Slider value={[gravity]} onValueChange={([v]) => setGravity(v)} min={1.6} max={24.8} step={0.2} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Damping: <span className="text-foreground">{damping.toFixed(2)}</span>
          </label>
          <Slider value={[damping]} onValueChange={([v]) => setDamping(v)} min={0} max={0.5} step={0.01} />
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={reset}>
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset clock
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>T = 2π√(L/g)</strong> — double the length and the period grows by √2 ≈ 1.41, not by 2.
        </p>
        <p>Length is the only thing that sets the period; the amplitude does not (for small swings).</p>
        <p>Add damping and watch the swing die, while total mechanical energy falls to heat and sound.</p>
      </div>
    </div>
  );
}
