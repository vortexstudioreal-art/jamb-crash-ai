import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Variable {
  name: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
}

interface Constant {
  name: string;
  value: number;
}

interface Output {
  name: string;
  label: string;
  unit: string;
}

interface FormulaCalculatorConfig {
  formula: string;
  constants?: Constant[];
  variables: Variable[];
  output: Output;
  show_graph?: boolean;
  graph_type?: string;
}

interface FormulaCalculatorProps {
  config: FormulaCalculatorConfig;
  onInteraction?: (data: Record<string, unknown>) => void;
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + ' × 10⁹';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + ' × 10⁶';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + ' × 10³';
  if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(2);
  if (Math.abs(num) < 1) return num.toFixed(4);
  return num.toFixed(2);
}

function formatUnit(unit: string): string {
  const superscripts: Record<string, string> = {
    '²': '²', '³': '³', '-1': '⁻¹', '-2': '⁻²', '-3': '⁻³',
  };
  return unit.replace(/⁻(\d)/g, (_, n) => '⁻' + n);
}

export function FormulaCalculator({ config, onInteraction }: FormulaCalculatorProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    config.variables.forEach((v) => {
      initial[v.name] = v.initial;
    });
    return initial;
  });

  const constants = useMemo(() => {
    const map: Record<string, number> = {};
    config.constants?.forEach((c) => {
      map[c.name] = c.value;
    });
    return map;
  }, [config.constants]);

  const result = useMemo(() => {
    // Build the calculation context
    const context: Record<string, number> = { ...constants, ...values };
    
    // Simple formula evaluator for F = kQq/r² type formulas
    // This handles: multiplication, division, exponentiation
    const formula = config.formula;
    const lhs = formula.split('=')[0].trim();
    const rhs = formula.split('=')[1].trim();
    
    // Parse the RHS: handle patterns like kQq/r²
    let computed = 1;
    let divisor = 1;
    let inDivisor = false;
    let i = 0;
    const tokens: string[] = [];
    
    // Tokenize: split by operators but keep variable names
    while (i < rhs.length) {
      if (rhs[i] === '/' ) {
        inDivisor = true;
        i++;
      } else if (rhs[i] === '*' || rhs[i] === '×') {
        i++;
      } else if (rhs[i] === '(' ) {
        // Handle parentheses
        let depth = 1;
        let j = i + 1;
        while (j < rhs.length && depth > 0) {
          if (rhs[j] === '(') depth++;
          if (rhs[j] === ')') depth--;
          j++;
        }
        tokens.push(rhs.substring(i + 1, j - 1));
        i = j;
      } else if (rhs[i] === '²' || rhs[i] === '^') {
        // Square the last token
        if (tokens.length > 0) {
          const last = tokens[tokens.length - 1];
          const val = context[last] ?? parseFloat(last);
          if (!isNaN(val)) {
            tokens[tokens.length - 1] = String(val * val);
          }
        }
        i++;
      } else if (rhs[i] >= 'A' && rhs[i] <= 'z') {
        // Variable name (could be multi-char like Qq)
        let j = i;
        while (j < rhs.length && ((rhs[j] >= 'A' && rhs[j] <= 'z') || (rhs[j] >= '0' && rhs[j] <= '9'))) {
          j++;
        }
        const varName = rhs.substring(i, j);
        tokens.push(varName);
        i = j;
      } else if (rhs[i] >= '0' && rhs[i] <= '9' || rhs[i] === '.') {
        let j = i;
        while (j < rhs.length && ((rhs[j] >= '0' && rhs[j] <= '9') || rhs[j] === '.')) {
          j++;
        }
        tokens.push(rhs.substring(i, j));
        i = j;
      } else {
        i++;
      }
    }
    
    // Evaluate tokens
    computed = 1;
    divisor = 1;
    inDivisor = false;
    
    for (const token of tokens) {
      if (token === '/') {
        inDivisor = true;
        continue;
      }
      
      const numVal = parseFloat(token);
      const contextVal = context[token];
      const value = contextVal !== undefined ? contextVal : (isNaN(numVal) ? 1 : numVal);
      
      if (inDivisor) {
        divisor *= value;
      } else {
        computed *= value;
      }
    }
    
    const finalResult = divisor !== 0 ? computed / divisor : 0;
    
    return finalResult;
  }, [values, constants, config.formula]);

  const handleChange = useCallback((varName: string, value: number) => {
    setValues((prev) => {
      const next = { ...prev, [varName]: value };
      return next;
    });
    onInteraction?.({ variable: varName, value, output: result });
  }, [result, onInteraction]);

  const handleReset = useCallback(() => {
    const initial: Record<string, number> = {};
    config.variables.forEach((v) => {
      initial[v.name] = v.initial;
    });
    setValues(initial);
  }, [config.variables]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
      {/* Formula Display */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span className="text-lg font-mono font-semibold text-gray-800">
            {config.formula}
          </span>
        </div>
      </div>

      {/* Variable Sliders */}
      <div className="space-y-3 mb-4">
        {config.variables.map((variable) => (
          <div key={variable.name} className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                {variable.label}
              </label>
              <span className="text-sm font-mono text-blue-600">
                {formatNumber(values[variable.name])} {formatUnit(variable.unit)}
              </span>
            </div>
            <input
              type="range"
              min={variable.min}
              max={variable.max}
              step={variable.step}
              value={values[variable.name]}
              onChange={(e) => handleChange(variable.name, parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatNumber(variable.min)}</span>
              <span>{formatNumber(variable.max)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Result Display */}
      <motion.div
        key={result.toFixed(6)}
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white text-center"
      >
        <div className="text-sm opacity-80 mb-1">{config.output.label}</div>
        <div className="text-2xl font-bold font-mono">
          {formatNumber(result)} {formatUnit(config.output.unit)}
        </div>
      </motion.div>

      {/* Reset Button */}
      <div className="mt-3 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Graph (if enabled) */}
      {config.show_graph && (
        <div className="mt-4 bg-white/60 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Relationship: {config.output.label} vs {config.variables[config.variables.length - 1]?.label}
          </div>
          <svg viewBox="0 0 300 150" className="w-full h-32">
            {/* Grid */}
            <line x1="40" y1="10" x2="40" y2="130" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="40" y1="130" x2="290" y2="130" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Axes */}
            <line x1="40" y1="10" x2="40" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
            <line x1="40" y1="130" x2="290" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
            
            {/* Curve points */}
            {(() => {
              const points: string[] = [];
              const lastVar = config.variables[config.variables.length - 1];
              if (!lastVar) return null;
              
              for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const x = lastVar.min + t * (lastVar.max - lastVar.min);
                const tempValues = { ...values, [lastVar.name]: x };
                
                // Calculate result for this x
                const context: Record<string, number> = { ...constants, ...tempValues };
                let computed = 1;
                let divisor = 1;
                let inDiv = false;
                
                const rhs = config.formula.split('=')[1]?.trim() || '';
                const tokens: string[] = [];
                let ti = 0;
                
                while (ti < rhs.length) {
                  if (rhs[ti] === '/') { inDiv = true; ti++; }
                  else if (rhs[ti] === '*' || rhs[ti] === '×') { ti++; }
                  else if (rhs[ti] === '²') {
                    if (tokens.length > 0) {
                      const last = tokens[tokens.length - 1];
                      const val = context[parseFloat(last).toString()] ?? parseFloat(last);
                      if (!isNaN(val)) tokens[tokens.length - 1] = String(val * val);
                    }
                    ti++;
                  } else if (rhs[ti] >= 'A' && rhs[ti] <= 'z') {
                    let j = ti;
                    while (j < rhs.length && ((rhs[j] >= 'A' && rhs[j] <= 'z') || (rhs[j] >= '0' && rhs[j] <= '9'))) j++;
                    tokens.push(rhs.substring(ti, j));
                    ti = j;
                  } else if (rhs[ti] >= '0' && rhs[ti] <= '9' || rhs[ti] === '.') {
                    let j = ti;
                    while (j < rhs.length && ((rhs[j] >= '0' && rhs[j] <= '9') || rhs[j] === '.')) j++;
                    tokens.push(rhs.substring(ti, j));
                    ti = j;
                  } else { ti++; }
                }
                
                computed = 1;
                divisor = 1;
                inDiv = false;
                for (const token of tokens) {
                  if (token === '/') { inDiv = true; continue; }
                  const numVal = parseFloat(token);
                  const contextVal = context[token];
                  const val = contextVal !== undefined ? contextVal : (isNaN(numVal) ? 1 : numVal);
                  if (inDiv) divisor *= val; else computed *= val;
                }
                
                const y = divisor !== 0 ? computed / divisor : 0;
                points.push(`${40 + t * 250},${130 - (y / Math.max(result, 1)) * 110}`);
              }
              
              return (
                <>
                  <polyline
                    points={points.join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {/* Current value dot */}
                  {(() => {
                    const t = (values[lastVar.name] - lastVar.min) / (lastVar.max - lastVar.min);
                    const cx = 40 + t * 250;
                    const cy = 130 - (result / Math.max(result, 1)) * 110;
                    return <circle cx={cx} cy={cy} r="5" fill="#ef4444" />;
                  })()}
                </>
              );
            })()}
            
            {/* Labels */}
            <text x="165" y="148" textAnchor="middle" className="text-xs fill-gray-500">
              {config.variables[config.variables.length - 1]?.label}
            </text>
            <text x="15" y="70" textAnchor="middle" className="text-xs fill-gray-500" transform="rotate(-90, 15, 70)">
              {config.output.label}
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
