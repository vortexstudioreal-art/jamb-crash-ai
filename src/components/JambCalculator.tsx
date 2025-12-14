import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete } from 'lucide-react';

interface JambCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JambCalculator = ({ isOpen, onClose }: JambCalculatorProps) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const backspace = useCallback(() => {
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          newValue = inputValue;
      }

      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let newValue: number;

    switch (operation) {
      case '+':
        newValue = currentValue + inputValue;
        break;
      case '-':
        newValue = currentValue - inputValue;
        break;
      case '×':
        newValue = currentValue * inputValue;
        break;
      case '÷':
        newValue = inputValue !== 0 ? currentValue / inputValue : 0;
        break;
      default:
        newValue = inputValue;
    }

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operation]);

  const sqrt = useCallback(() => {
    const value = parseFloat(display);
    if (value >= 0) {
      setDisplay(String(Math.sqrt(value)));
    }
  }, [display]);

  const buttonClass = "h-12 text-lg font-semibold rounded-xl transition-all duration-150 active:scale-95";
  const numberClass = `${buttonClass} bg-muted hover:bg-muted/80 text-foreground`;
  const operatorClass = `${buttonClass} bg-primary/20 hover:bg-primary/30 text-primary`;
  const functionClass = `${buttonClass} bg-secondary hover:bg-secondary/80 text-secondary-foreground`;
  const equalsClass = `${buttonClass} bg-primary hover:bg-primary/90 text-primary-foreground`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Calculator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[320px]"
          >
            <div className="bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Header - JAMB Style */}
              <div className="bg-gradient-to-r from-green-700 to-green-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white font-bold text-sm tracking-wide">JAMB CALCULATOR</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Display */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-4">
                <div className="bg-lime-100 rounded-xl p-4 border-2 border-lime-200 shadow-inner">
                  <div className="text-right">
                    {previousValue && operation && (
                      <div className="text-xs text-slate-500 font-mono h-4">
                        {previousValue} {operation}
                      </div>
                    )}
                    <div className="text-3xl font-mono font-bold text-slate-800 truncate">
                      {display.length > 12 ? parseFloat(display).toExponential(6) : display}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="bg-card p-4">
                <div className="grid grid-cols-4 gap-2">
                  {/* Row 1 */}
                  <button onClick={clear} className={functionClass}>AC</button>
                  <button onClick={clearEntry} className={functionClass}>CE</button>
                  <button onClick={backspace} className={functionClass}>
                    <Delete className="w-5 h-5 mx-auto" />
                  </button>
                  <button onClick={() => performOperation('÷')} className={operatorClass}>÷</button>

                  {/* Row 2 */}
                  <button onClick={() => inputDigit('7')} className={numberClass}>7</button>
                  <button onClick={() => inputDigit('8')} className={numberClass}>8</button>
                  <button onClick={() => inputDigit('9')} className={numberClass}>9</button>
                  <button onClick={() => performOperation('×')} className={operatorClass}>×</button>

                  {/* Row 3 */}
                  <button onClick={() => inputDigit('4')} className={numberClass}>4</button>
                  <button onClick={() => inputDigit('5')} className={numberClass}>5</button>
                  <button onClick={() => inputDigit('6')} className={numberClass}>6</button>
                  <button onClick={() => performOperation('-')} className={operatorClass}>−</button>

                  {/* Row 4 */}
                  <button onClick={() => inputDigit('1')} className={numberClass}>1</button>
                  <button onClick={() => inputDigit('2')} className={numberClass}>2</button>
                  <button onClick={() => inputDigit('3')} className={numberClass}>3</button>
                  <button onClick={() => performOperation('+')} className={operatorClass}>+</button>

                  {/* Row 5 */}
                  <button onClick={toggleSign} className={functionClass}>±</button>
                  <button onClick={() => inputDigit('0')} className={numberClass}>0</button>
                  <button onClick={inputDecimal} className={numberClass}>.</button>
                  <button onClick={calculate} className={equalsClass}>=</button>

                  {/* Row 6 - Extra functions */}
                  <button onClick={sqrt} className={functionClass}>√</button>
                  <button onClick={inputPercent} className={functionClass}>%</button>
                  <div className="col-span-2" />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-green-700 to-green-600 px-4 py-2">
                <p className="text-center text-white/70 text-xs">
                  Press ESC or click outside to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
