import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { InteractiveProps } from '@/types/lesson';

interface ElectrolysisConfig {
  electrolyte?: string;
  show_bubbles?: boolean;
}

type Electrolyte = 'copper_sulfate' | 'sodium_chloride' | 'water';

const ELECTROLYTES: Record<Electrolyte, {
  name: string;
  anode_product: string;
  cathode_product: string;
  anode_color: string;
  cathode_color: string;
  anode_label: string;
  cathode_label: string;
  solution_color: string;
}> = {
  copper_sulfate: {
    name: 'Copper Sulfate (CuSO₄)',
    anode_product: 'O₂',
    cathode_product: 'Cu',
    anode_color: 'hsl(200, 80%, 60%)',
    cathode_color: 'hsl(25, 80%, 50%)',
    anode_label: 'Oxygen gas',
    cathode_label: 'Copper metal',
    solution_color: 'hsl(200, 70%, 70%)',
  },
  sodium_chloride: {
    name: 'Sodium Chloride (NaCl)',
    anode_product: 'Cl₂',
    cathode_product: 'H₂',
    anode_color: 'hsl(120, 60%, 50%)',
    cathode_color: 'hsl(200, 60%, 60%)',
    anode_label: 'Chlorine gas',
    cathode_label: 'Hydrogen gas',
    solution_color: 'hsl(60, 30%, 85%)',
  },
  water: {
    name: 'Water (H₂O)',
    anode_product: 'O₂',
    cathode_product: 'H₂',
    anode_color: 'hsl(200, 80%, 60%)',
    cathode_color: 'hsl(200, 60%, 60%)',
    anode_label: 'Oxygen gas',
    cathode_label: 'Hydrogen gas',
    solution_color: 'hsl(200, 40%, 90%)',
  },
};

export function ElectrolysisSimulator({ config, onInteraction }: InteractiveProps) {
  const cfg = config as ElectrolysisConfig;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const [electrolyte, setElectrolyte] = useState<Electrolyte>(
    (cfg.electrolyte as Electrolyte) || 'copper_sulfate'
  );
  const [voltage, setVoltage] = useState(6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [anodeMass, setAnodeMass] = useState(0);
  const [cathodeMass, setCathodeMass] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ x: number; y: number; size: number; speed: number; side: 'anode' | 'cathode' }>>([]);

  const data = ELECTROLYTES[electrolyte];

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = 'hsl(210, 20%, 95%)';
    ctx.fillRect(0, 0, w, h);

    // Beaker
    const bx = w * 0.25;
    const by = h * 0.35;
    const bw = w * 0.5;
    const bh = h * 0.55;

    // Solution
    ctx.fillStyle = data.solution_color;
    ctx.fillRect(bx + 5, by + 20, bw - 10, bh - 25);

    // Beaker walls
    ctx.strokeStyle = 'hsl(0, 0%, 40%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Anode (left electrode)
    const anodeX = bx + bw * 0.25;
    ctx.fillStyle = 'hsl(0, 0%, 30%)';
    ctx.fillRect(anodeX - 5, by - 20, 10, bh * 0.7);

    // Cathode (right electrode)
    const cathodeX = bx + bw * 0.75;
    ctx.fillStyle = 'hsl(0, 0%, 30%)';
    ctx.fillRect(cathodeX - 5, by - 20, 10, bh * 0.7);

    // Electrode labels
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Anode (+)', anodeX, by - 25);
    ctx.fillText('Cathode (−)', cathodeX, by - 25);

    // Product labels on electrodes
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'hsl(0, 0%, 40%)';
    ctx.fillText(data.anode_label, anodeX, by + bh * 0.75 + 15);
    ctx.fillText(data.cathode_label, cathodeX, by + bh * 0.75 + 15);

    // Bubbles
    bubbles.forEach(b => {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = b.side === 'anode' ? data.anode_color : data.cathode_color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Battery
    ctx.fillStyle = 'hsl(50, 80%, 50%)';
    ctx.fillRect(w * 0.4, 10, w * 0.2, 25);
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, w * 0.5, 27);

    // Wires
    ctx.strokeStyle = 'hsl(0, 0%, 30%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 22);
    ctx.lineTo(anodeX, 22);
    ctx.lineTo(anodeX, by - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.6, 22);
    ctx.lineTo(cathodeX, 22);
    ctx.lineTo(cathodeX, by - 20);
    ctx.stroke();

    // + and - symbols on battery
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('+', w * 0.42, 28);
    ctx.fillText('−', w * 0.58, 28);

    // Info panel
    ctx.textAlign = 'left';
    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(10, h - 65, 220, 55);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.font = '11px monospace';
    ctx.fillText(`Electrolyte: ${data.name}`, 15, h - 48);
    ctx.fillText(`Time: ${time.toFixed(1)} s`, 15, h - 33);
    ctx.fillText(`Anode: ${anodeMass.toFixed(2)}g | Cathode: ${cathodeMass.toFixed(2)}g`, 15, h - 18);

    ctx.textAlign = 'left';
  }, [data, voltage, time, anodeMass, cathodeMass, bubbles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 300;
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
      setAnodeMass(m => m + dt * 0.01 * voltage);
      setCathodeMass(m => m + dt * 0.015 * voltage);

      // Generate bubbles
      if (Math.random() < 0.3 * voltage / 6) {
        const canvas = canvasRef.current;
        if (canvas) {
          const w = canvas.width;
          const h = canvas.height;
          const bx = w * 0.25;
          const bw = w * 0.5;
          setBubbles(prev => {
            const newBubbles = [...prev];
            if (newBubbles.length < 30) {
              const side = Math.random() > 0.5 ? 'anode' : 'cathode';
              const x = side === 'anode' ? bx + bw * 0.25 + (Math.random() - 0.5) * 20 : bx + bw * 0.75 + (Math.random() - 0.5) * 20;
              newBubbles.push({
                x,
                y: h * 0.75,
                size: 2 + Math.random() * 4,
                speed: 30 + Math.random() * 50,
                side,
              });
            }
            return newBubbles.map(b => ({
              ...b,
              y: b.y - b.speed * dt,
            })).filter(b => b.y > h * 0.3);
          });
        }
      }

      drawScene();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, drawScene, voltage]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const reset = () => {
    setTime(0);
    setAnodeMass(0);
    setCathodeMass(0);
    setBubbles([]);
    setIsPlaying(false);
  };

  const handleInteraction = () => {
    onInteraction?.({ electrolyte, voltage, time, anodeMass, cathodeMass });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-foreground">Electrolysis Simulator</h4>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-border"
        style={{ height: 300 }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Electrolyte</label>
          <div className="flex gap-2">
            {(Object.keys(ELECTROLYTES) as Electrolyte[]).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={electrolyte === key ? 'default' : 'outline'}
                onClick={() => { setElectrolyte(key); reset(); }}
                className="text-xs"
              >
                {ELECTROLYTES[key].name.split('(')[0].trim()}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Voltage: <span className="text-foreground">{voltage.toFixed(0)}V</span>
          </label>
          <Slider
            value={[voltage]}
            onValueChange={([v]) => { setVoltage(v); handleInteraction(); }}
            min={1}
            max={12}
            step={1}
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
          {isPlaying ? 'Pause' : 'Start'}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Anode (+):</strong> Oxidation occurs here (electrons lost)</p>
        <p><strong>Cathode (−):</strong> Reduction occurs here (electrons gained)</p>
        <p><strong>Electrons flow:</strong> Anode → External circuit → Cathode</p>
        <p>Watch the bubbles rise as gases are produced at each electrode!</p>
      </div>
    </div>
  );
}
