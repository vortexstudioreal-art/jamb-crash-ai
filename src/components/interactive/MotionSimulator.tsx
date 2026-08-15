import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface MotionConfig {
  max_velocity?: number;
  max_acceleration?: number;
}

export function MotionSimulator({ config, onInteraction }: InteractiveProps) {
  const cfg = config as MotionConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [initialVelocity, setInitialVelocity] = useState(20);
  const [acceleration, setAcceleration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(20);

  const maxVel = cfg.max_velocity ?? 50;
  const maxAcc = cfg.max_acceleration ?? 20;

  const reset = useCallback(() => {
    setTime(0);
    setPosition(0);
    setVelocity(initialVelocity);
    setIsPlaying(false);
  }, [initialVelocity]);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'hsl(210, 80%, 95%)');
    grad.addColorStop(1, 'hsl(210, 80%, 85%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Road
    const roadY = h * 0.7;
    ctx.fillStyle = 'hsl(0, 0%, 30%)';
    ctx.fillRect(0, roadY, w, 40);

    // Road markings
    ctx.strokeStyle = 'hsl(50, 100%, 50%)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + 20);
    ctx.lineTo(w, roadY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Car position on road
    const carX = 30 + (position * 2) % (w - 60);

    // Car body
    ctx.fillStyle = 'hsl(0, 70%, 50%)';
    ctx.fillRect(carX - 20, roadY - 15, 40, 15);

    // Car top
    ctx.fillStyle = 'hsl(0, 70%, 40%)';
    ctx.beginPath();
    ctx.moveTo(carX - 12, roadY - 15);
    ctx.lineTo(carX - 8, roadY - 28);
    ctx.lineTo(carX + 8, roadY - 28);
    ctx.lineTo(carX + 12, roadY - 15);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.beginPath();
    ctx.arc(carX - 12, roadY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carX + 12, roadY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Velocity arrow
    const arrowLen = Math.min(velocity * 1.5, 80);
    ctx.strokeStyle = 'hsl(120, 70%, 50%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(carX + 20, roadY - 8);
    ctx.lineTo(carX + 20 + arrowLen, roadY - 8);
    ctx.stroke();

    // Arrow head
    ctx.fillStyle = 'hsl(120, 70%, 50%)';
    ctx.beginPath();
    ctx.moveTo(carX + 20 + arrowLen, roadY - 8);
    ctx.lineTo(carX + 15 + arrowLen, roadY - 13);
    ctx.lineTo(carX + 15 + arrowLen, roadY - 3);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`v = ${velocity.toFixed(1)} m/s`, carX + 25, roadY - 20);

    // Info panel
    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(10, 10, 180, 90);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = '12px monospace';
    ctx.fillText(`Time:     ${time.toFixed(2)} s`, 15, 30);
    ctx.fillText(`Position: ${position.toFixed(1)} m`, 15, 48);
    ctx.fillText(`Velocity: ${velocity.toFixed(1)} m/s`, 15, 66);
    ctx.fillText(`Accel:    ${acceleration.toFixed(1)} m/s²`, 15, 84);

    // Graph area
    const graphX = w - 200;
    const graphY = 10;
    const graphW = 190;
    const graphH = 80;

    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'hsl(0, 0%, 70%)';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Velocity-time graph line
    ctx.strokeStyle = 'hsl(210, 80%, 50%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const t = Math.max(time, 0.01);
    for (let i = 0; i <= graphW; i++) {
      const tVal = (i / graphW) * Math.max(t, 2);
      const v = initialVelocity + acceleration * tVal;
      const y = graphY + graphH - (v / maxVel) * graphH * 0.8 - 5;
      if (i === 0) ctx.moveTo(graphX + i, y);
      else ctx.lineTo(graphX + i, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'hsl(0, 0%, 50%)';
    ctx.font = '10px sans-serif';
    ctx.fillText('v-t graph', graphX + 5, graphY + 12);
  }, [time, position, velocity, acceleration, initialVelocity, maxVel]);

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
    if (!isPlaying) return;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setTime(t => {
        const newT = t + dt;
        const newPos = position + velocity * dt + 0.5 * acceleration * dt * dt;
        const newVel = velocity + acceleration * dt;
        setPosition(newPos);
        setVelocity(newVel);
        return newT;
      });
      drawScene();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, drawScene, position, velocity, acceleration]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  useEffect(() => {
    reset();
  }, [initialVelocity, acceleration, reset]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Car className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Motion Simulator</h4>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-border"
        style={{ height: 250 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Initial Velocity: <span className="text-foreground">{initialVelocity.toFixed(0)} m/s</span>
          </label>
          <Slider
            value={[initialVelocity]}
            onValueChange={([v]) => setInitialVelocity(v)}
            min={0}
            max={maxVel}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Acceleration: <span className="text-foreground">{acceleration.toFixed(0)} m/s²</span>
          </label>
          <Slider
            value={[acceleration]}
            onValueChange={([v]) => setAcceleration(v)}
            min={-maxAcc}
            max={maxAcc}
            step={0.5}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={isPlaying ? 'secondary' : 'default'}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>v = u + at</strong> — velocity at time t</p>
        <p><strong>s = ut + ½at²</strong> — position at time t</p>
        <p>Try negative acceleration to see deceleration! The velocity-time graph updates in real time.</p>
      </div>
    </div>
  );
}
