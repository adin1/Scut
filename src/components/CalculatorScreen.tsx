import React, { useState } from 'react';
import { Home, Info, ShieldCheck, AlertCircle } from 'lucide-react';

interface CalculatorScreenProps {
  onUnlockSuccess: () => void;
  onDuressTrigger: () => void;
  onReturnHome: () => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  onUnlockSuccess,
  onDuressTrigger,
  onReturnHome
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [pinBuffer, setPinBuffer] = useState<string>('');
  const [showHelperPill, setShowHelperPill] = useState<boolean>(true);

  // Standard Secret PINs
  const MASTER_PIN = '1234';
  const DURESS_PIN = '0000';

  const inputDigit = (digit: string) => {
    // Append to secret pin buffer
    setPinBuffer(prev => (prev + digit).slice(-8));

    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const clearAll = () => {
    setDisplayValue('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setPinBuffer('');
  };

  const toggleSign = () => {
    const value = parseFloat(displayValue);
    if (!isNaN(value)) {
      setDisplayValue(String(-value));
    }
  };

  const inputPercent = () => {
    const value = parseFloat(displayValue);
    if (!isNaN(value)) {
      setDisplayValue(String(value / 100));
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(displayValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result = 0;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setPreviousValue(result);
      setDisplayValue(String(Number(result.toFixed(6))));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEquals = () => {
    // 1. Check if the secret PIN was entered in the buffer or current input
    const cleanBuffer = pinBuffer.trim();
    const cleanDisplay = displayValue.trim();

    if (cleanBuffer.endsWith(MASTER_PIN) || cleanDisplay === MASTER_PIN) {
      // Secret unlock: smoothly transitions into SCUT Dashboard
      clearAll();
      onUnlockSuccess();
      return;
    }

    if (cleanBuffer.endsWith(DURESS_PIN) || cleanDisplay === DURESS_PIN) {
      // Duress PIN entered under threat: triggers silent distress beacon & opens decoy weather
      clearAll();
      onDuressTrigger();
      return;
    }

    // 2. Otherwise execute standard math calculation
    const inputValue = parseFloat(displayValue);
    if (previousValue !== null && operation) {
      let result = 0;
      switch (operation) {
        case '+':
          result = previousValue + inputValue;
          break;
        case '-':
          result = previousValue - inputValue;
          break;
        case '×':
          result = previousValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? previousValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }
      setDisplayValue(String(Number(result.toFixed(6))));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="flex-1 w-full h-full bg-black text-white p-4 flex flex-col justify-between select-none font-sans relative">
      {/* Top subtle controls */}
      <div className="w-full flex items-center justify-between text-xs text-stone-500 pt-1 pb-2">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-1 text-stone-400 hover:text-white transition px-2 py-1 rounded bg-stone-900 border border-stone-800"
          title="Înapoi pe ecranul principal"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="text-[11px]">Acasă</span>
        </button>

        <button
          onClick={() => setShowHelperPill(!showHelperPill)}
          className="text-stone-400 hover:text-teal-400 transition flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="text-[10px]">{showHelperPill ? 'Ascunde Instrucțiuni' : 'Vezi PIN'}</span>
        </button>
      </div>

      {/* Helper guide pill for testing / reviewer demo */}
      {showHelperPill && (
        <div className="w-full bg-stone-900/90 border border-stone-800 rounded-xl p-2.5 text-[11px] text-stone-300 space-y-1 my-1">
          <div className="flex items-center justify-between font-semibold text-teal-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mecanism Deblocare Secretă:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5 text-[10px]">
            <div className="bg-stone-950 p-1.5 rounded border border-stone-800">
              <span className="text-emerald-400 font-bold block">PIN Real: 1234 =</span>
              <span className="text-stone-400">Verificare Biometrică (FaceID/Amprentă) &rarr; SCUT</span>
            </div>
            <div className="bg-stone-950 p-1.5 rounded border border-stone-800">
              <span className="text-amber-400 font-bold block">PIN Constrângere: 0000 =</span>
              <span className="text-stone-400">Alertă silențioasă + Meteo</span>
            </div>
          </div>
          <p className="text-[9px] text-stone-400 pt-0.5">
            * Orice alt calcul matematic (ex: 25+15=) funcționează perfect ca un calculator normal.
          </p>
        </div>
      )}

      {/* Calculator LCD Display */}
      <div className="w-full px-2 py-4 flex flex-col items-end justify-end text-right">
        {operation && previousValue !== null && (
          <span className="text-stone-400 text-sm font-mono mb-1">
            {previousValue} {operation}
          </span>
        )}
        <div className="text-5xl font-light tracking-tight font-mono text-white break-all max-w-full overflow-hidden">
          {displayValue}
        </div>
      </div>

      {/* Calculator Keypad Grid (Standard Native Calculator) */}
      <div className="grid grid-cols-4 gap-2.5 pb-2">
        {/* Row 1 */}
        <button
          id="btn-calc-ac"
          onClick={clearAll}
          className="h-14 rounded-full bg-stone-400 hover:bg-stone-300 text-stone-950 font-semibold text-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          {displayValue !== '0' ? 'C' : 'AC'}
        </button>

        <button
          id="btn-calc-pm"
          onClick={toggleSign}
          className="h-14 rounded-full bg-stone-400 hover:bg-stone-300 text-stone-950 font-semibold text-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          ±
        </button>

        <button
          id="btn-calc-pct"
          onClick={inputPercent}
          className="h-14 rounded-full bg-stone-400 hover:bg-stone-300 text-stone-950 font-semibold text-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          %
        </button>

        <button
          id="btn-calc-div"
          onClick={() => performOperation('÷')}
          className={`h-14 rounded-full font-bold text-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
            operation === '÷' ? 'bg-white text-amber-500' : 'bg-amber-500 hover:bg-amber-400 text-white'
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          id="btn-calc-7"
          onClick={() => inputDigit('7')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          7
        </button>

        <button
          id="btn-calc-8"
          onClick={() => inputDigit('8')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          8
        </button>

        <button
          id="btn-calc-9"
          onClick={() => inputDigit('9')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          9
        </button>

        <button
          id="btn-calc-mul"
          onClick={() => performOperation('×')}
          className={`h-14 rounded-full font-bold text-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
            operation === '×' ? 'bg-white text-amber-500' : 'bg-amber-500 hover:bg-amber-400 text-white'
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          id="btn-calc-4"
          onClick={() => inputDigit('4')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          4
        </button>

        <button
          id="btn-calc-5"
          onClick={() => inputDigit('5')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          5
        </button>

        <button
          id="btn-calc-6"
          onClick={() => inputDigit('6')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          6
        </button>

        <button
          id="btn-calc-sub"
          onClick={() => performOperation('-')}
          className={`h-14 rounded-full font-bold text-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
            operation === '-' ? 'bg-white text-amber-500' : 'bg-amber-500 hover:bg-amber-400 text-white'
          }`}
        >
          -
        </button>

        {/* Row 4 */}
        <button
          id="btn-calc-1"
          onClick={() => inputDigit('1')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          1
        </button>

        <button
          id="btn-calc-2"
          onClick={() => inputDigit('2')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          2
        </button>

        <button
          id="btn-calc-3"
          onClick={() => inputDigit('3')}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          3
        </button>

        <button
          id="btn-calc-add"
          onClick={() => performOperation('+')}
          className={`h-14 rounded-full font-bold text-xl flex items-center justify-center transition active:scale-95 cursor-pointer ${
            operation === '+' ? 'bg-white text-amber-500' : 'bg-amber-500 hover:bg-amber-400 text-white'
          }`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          id="btn-calc-0"
          onClick={() => inputDigit('0')}
          className="h-14 col-span-2 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-start pl-7 transition active:scale-95 cursor-pointer"
        >
          0
        </button>

        <button
          id="btn-calc-dot"
          onClick={inputDecimal}
          className="h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-white font-medium text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer"
        >
          .
        </button>

        <button
          id="btn-calc-eq"
          onClick={handleEquals}
          className="h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-2xl flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
        >
          =
        </button>
      </div>
    </div>
  );
};
