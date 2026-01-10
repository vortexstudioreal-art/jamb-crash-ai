import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [bracketCount, setBracketCount] = useState(0);
  const [expression, setExpression] = useState<string[]>([]);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Escape to close
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Prevent default for calculator keys
      e.preventDefault();

      // Number keys
      if (/^[0-9]$/.test(e.key)) {
        inputDigit(e.key);
        return;
      }

      // Decimal
      if (e.key === '.' || e.key === ',') {
        inputDecimal();
        return;
      }

      // Operations
      switch (e.key) {
        case '+':
          performOperation('+');
          break;
        case '-':
          performOperation('-');
          break;
        case '*':
          performOperation('×');
          break;
        case '/':
          performOperation('÷');
          break;
        case 'Enter':
        case '=':
          calculate();
          break;
        case 'Backspace':
          backspace();
          break;
        case 'Delete':
        case 'c':
        case 'C':
          clear();
          break;
        case '(':
          inputOpenBracket();
          break;
        case ')':
          inputCloseBracket();
          break;
        case '%':
          inputPercent();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, previousValue, operation, waitingForOperand]);

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

  const inputOpenBracket = useCallback(() => {
    setExpression(prev => [...prev, '(']);
    setBracketCount(prev => prev + 1);
    setWaitingForOperand(true);
  }, []);

  const inputCloseBracket = useCallback(() => {
    if (bracketCount > 0) {
      setExpression(prev => [...prev, display, ')']);
      setBracketCount(prev => prev - 1);
      setWaitingForOperand(true);
    }
  }, [bracketCount, display]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setBracketCount(0);
    setExpression([]);
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

  const buttonClass = "h-10 md:h-12 text-base md:text-lg font-semibold rounded-xl transition-all duration-150 active:scale-95";
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

          {/* Calculator - Centered on all devices */}
          <motion.div
            ref={calculatorRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
            style={{ transform: 'none' }}
          >
            <div className="w-full max-w-[340px] bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-700 to-green-600 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white font-bold text-xs md:text-sm tracking-wide">CALCULATOR</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Display */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-3 md:p-4">
                <div className="bg-lime-100 rounded-xl p-3 md:p-4 border-2 border-lime-200 shadow-inner">
                  <div className="text-right">
                    {previousValue && operation && (
                      <div className="text-xs text-slate-500 font-mono h-4">
                        {previousValue} {operation}
                      </div>
                    )}
                    <div className="text-2xl md:text-3xl font-mono font-bold text-slate-800 truncate">
                      {display.length > 12 ? parseFloat(display).toExponential(6) : display}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="bg-card p-2 md:p-3">
                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {/* Row 1 */}
                  <button onClick={clear} className={functionClass}>AC</button>
                  <button onClick={clearEntry} className={functionClass}>CE</button>
                  <button onClick={inputOpenBracket} className={functionClass}>(</button>
                  <button onClick={inputCloseBracket} className={functionClass}>)</button>
                  <button onClick={() => performOperation('÷')} className={operatorClass}>÷</button>

                  {/* Row 2 */}
                  <button onClick={() => inputDigit('7')} className={numberClass}>7</button>
                  <button onClick={() => inputDigit('8')} className={numberClass}>8</button>
                  <button onClick={() => inputDigit('9')} className={numberClass}>9</button>
                  <button onClick={backspace} className={functionClass}>
                    <Delete className="w-4 h-4 md:w-5 md:h-5 mx-auto" />
                  </button>
                  <button onClick={() => performOperation('×')} className={operatorClass}>×</button>

                  {/* Row 3 */}
                  <button onClick={() => inputDigit('4')} className={numberClass}>4</button>
                  <button onClick={() => inputDigit('5')} className={numberClass}>5</button>
                  <button onClick={() => inputDigit('6')} className={numberClass}>6</button>
                  <button onClick={toggleSign} className={functionClass}>±</button>
                  <button onClick={() => performOperation('-')} className={operatorClass}>−</button>

                  {/* Row 4 */}
                  <button onClick={() => inputDigit('1')} className={numberClass}>1</button>
                  <button onClick={() => inputDigit('2')} className={numberClass}>2</button>
                  <button onClick={() => inputDigit('3')} className={numberClass}>3</button>
                  <button onClick={inputPercent} className={functionClass}>%</button>
                  <button onClick={() => performOperation('+')} className={operatorClass}>+</button>

                  {/* Row 5 */}
                  <button onClick={sqrt} className={functionClass}>√</button>
                  <button onClick={() => inputDigit('0')} className={`${numberClass} col-span-2`}>0</button>
                  <button onClick={inputDecimal} className={numberClass}>.</button>
                  <button onClick={calculate} className={equalsClass}>=</button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-green-700 to-green-600 px-3 md:px-4 py-1.5 md:py-2">
                <p className="text-center text-white/70 text-[10px] md:text-xs">
                  Type numbers directly • ESC to close
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};