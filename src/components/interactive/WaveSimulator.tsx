import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface WaveConfig {
  max_amplitude?: number;
  max_frequency?: number;
  max_speed?: number;
}

export function WaveSimulator({ config, onInteraction }: InteractiveProps) {
  const cfg = config as WaveConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(2);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  const maxAmp = cfg.max_amplitude ?? 100;
  const maxFreq = cfg.max_frequency ?? 5;
  const maxSpeed = cfg.max_speed ?? 3;

  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'hsl(var(--muted))';
    ctx.lineWidth = 1;
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Equilibrium line
    ctx.strokeStyle = 'hsl(var(--muted-foreground))';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw wave
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = midY - amplitude * Math.sin((x * frequency * Math.PI * 2) / w - time * speed * 2);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw second wave (dashed, showing original)
    ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = midY - 50 * Math.sin((x * 2 * Math.PI * 2) / w);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    if (showLabels) {
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '12px sans-serif';

      // Amplitude label
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.fillText(`A = ${amplitude.toFixed(0)} px`, 10, midY - amplitude - 10);

      // Wavelength
      const wavelength = w / (frequency * 2);
      if (wavelength < w - 40) {
        ctx.beginPath();
        ctx.strokeStyle = 'hsl(var(--destructive))';
        ctx.lineWidth = 1;
        ctx.moveTo(wavelength, midY + 30);
        ctx.lineTo(wavelength * 2, midY + 30);
        ctx.stroke();
        ctx.fillStyle = 'hsl(var(--destructive))';
        ctx.fillText(`λ = ${(1 / frequency).toFixed(2)} m`, wavelength + 10, midY + 50);
      }
    }
  }, [amplitude, frequency, speed, time, showLabels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 200;
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
      setTime(t => t + dt);
      drawWave();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, drawWave]);

  const handleReset = () => {
    setAmplitude(50);
    setFrequency(2);
    setSpeed(1);
    setTime(0);
  };

  const handleInteraction = () => {
    onInteraction?.({ amplitude, frequency, speed, wavelength: 1 / frequency });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Waves className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Wave Simulator</h4>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-background border border-border"
        style={{ height: 200 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Amplitude: <span className="text-foreground">{amplitude.toFixed(0)} px</span>
          </label>
          <Slider
            value={[amplitude]}
            onValueChange={([v]) => { setAmplitude(v); handleInteraction(); }}
            min={5}
            max={maxAmp}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Frequency: <span className="text-foreground">{frequency.toFixed(1)} Hz</span>
          </label>
          <Slider
            value={[frequency]}
            onValueChange={([v]) => { setFrequency(v); handleInteraction(); }}
            min={0.5}
            max={maxFreq}
            step={0.1}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Speed: <span className="text-foreground">{speed.toFixed(1)}x</span>
          </label>
          <Slider
            value={[speed]}
            onValueChange={([v]) => { setSpeed(v); handleInteraction(); }}
            min={0.1}
            max={maxSpeed}
            step={0.1}
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
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? 'Hide' : 'Show'} Labels
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Amplitude:</strong> Maximum displacement from equilibrium (loudness/brightness)</p>
        <p><strong>Frequency:</strong> Number of complete waves per second (pitch/colour)</p>
        <p><strong>Wavelength (λ):</strong> Distance between two consecutive crests = 1/frequency</p>
      </div>
    </div>
  );
}
