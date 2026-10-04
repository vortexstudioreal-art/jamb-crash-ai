import { useState, useRef, useEffect, useCallback } from 'react';
import { Rocket, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface ProjectileConfig {
  speed?: number;
  angle?: number;
  gravity?: number;
}

const G_DEFAULT = 9.8;

export function ProjectileSimulator({ config }: InteractiveProps) {
  const cfg = config as ProjectileConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const [speed, setSpeed] = useState(cfg.speed ?? 25);
  const [angle, setAngle] = useState(cfg.angle ?? 45);
  const [gravity, setGravity] = useState(cfg.gravity ?? G_DEFAULT);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [trail, setTrail] = useState<Array<[number, number]>>([]);

  const rad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy = speed * Math.sin(rad);
  const flightTime = (2 * vy) / gravity;
  const range = vx * flightTime;
  const maxHeight = (vy * vy) / (2 * gravity);

  const reset = useCallback(() => {
    setT(0);
    setTrail([]);
    setPlaying(false);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, 'hsl(210, 80%, 92%)');
    sky.addColorStop(1, 'hsl(40, 60%, 88%)');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const groundY = h - 34;
    ctx.fillStyle = 'hsl(100, 35%, 45%)';
    ctx.fillRect(0, groundY, w, h - groundY);

    const scale = Math.max(w / Math.max(range, 1), 4) * 0.9;

    // Ideal (no drag) trajectory, dashed.
    ctx.strokeStyle = 'hsl(0, 0%, 55%)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let step = 0; step <= 60; step++) {
      const tt = (step / 60) * flightTime;
      const x = vx * tt;
      const y = vy * tt - 0.5 * gravity * tt * tt;
      const px = 20 + x * scale;
      const py = groundY - y * scale;
      if (step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual trail.
    if (trail.length > 1) {
      ctx.strokeStyle = 'hsl(210, 80%, 45%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      trail.forEach(([x, y], i) => {
        const px = 20 + x * scale;
        const py = groundY - y * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Ball with velocity components.
    const x = vx * t;
    const y = Math.max(0, vy * t - 0.5 * gravity * t * t);
    const bx = 20 + x * scale;
    const by = groundY - y * scale;

    ctx.strokeStyle = 'hsl(120, 70%, 40%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + vx * 3, by);
    ctx.stroke();
    ctx.strokeStyle = 'hsl(0, 70%, 50%)';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - vy * 3);
    ctx.stroke();

    ctx.fillStyle = 'hsl(0, 70%, 45%)';
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();

    // Max-height guide.
    if (maxHeight > 0) {
      ctx.strokeStyle = 'hsl(45, 80%, 45%)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(20, groundY - maxHeight * scale);
      ctx.lineTo(w - 10, groundY - maxHeight * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`t = ${t.toFixed(2)} s`, 12, 18);
    ctx.font = '11px monospace';
    ctx.fillText(`Range = ${range.toFixed(1)} m`, 12, groundY + 16);
    ctx.fillText(`Max height = ${maxHeight.toFixed(1)} m`, 150, groundY + 16);
    ctx.fillText(`T = ${flightTime.toFixed(2)} s`, 300, groundY + 16);
  }, [t, trail, vx, vy, gravity, range, maxHeight, flightTime]);

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
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= flightTime) {
          setPlaying(false);
          return flightTime;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, flightTime]);

  useEffect(() => {
    const y = Math.max(0, vy * t - 0.5 * gravity * t * t);
    setTrail((prev) => {
      const next = [...prev, [vx * t, y] as [number, number]];
      return next.length > 400 ? next.slice(next.length - 400) : next;
    });
  }, [t, vx, vy, gravity]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    reset();
  }, [speed, angle, gravity, reset]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Projectile Simulator</h4>
      </div>

      <canvas ref={canvasRef} className="w-full rounded-lg border border-border" style={{ height: 250 }} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Launch speed: <span className="text-foreground">{speed.toFixed(0)} m/s</span>
          </label>
          <Slider value={[speed]} onValueChange={([v]) => setSpeed(v)} min={5} max={60} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Angle: <span className="text-foreground">{angle.toFixed(0)}°</span>
          </label>
          <Slider value={[angle]} onValueChange={([v]) => setAngle(v)} min={5} max={85} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            g: <span className="text-foreground">{gravity.toFixed(1)} m/s²</span>
          </label>
          <Slider value={[gravity]} onValueChange={([v]) => setGravity(v)} min={1.6} max={24.8} step={0.2} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={playing ? 'secondary' : 'default'}
          onClick={() => {
            if (t >= flightTime) reset();
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {playing ? 'Pause' : 'Launch'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Range = v²sin2θ/g</strong> — set the angle to 45° for maximum range; 30° and 60° give the
          same range at different heights.
        </p>
        <p>
          <strong>H = v²sin²θ/2g</strong> — the horizontal velocity (green) never changes; only the vertical
          (red) does.
        </p>
        <p>Drop g to the Moon's 1.6 m/s² and the same launch flies much further.</p>
      </div>
    </div>
  );
}
