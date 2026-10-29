import React, { useRef, useState, useEffect } from 'react';
import { useWebOtp } from '../hooks/useWebOtp';
import { hapticAutoFill, hapticSelection } from '../lib/haptic';

export interface AutoOtpInputProps {
  /**
   * Nombre de cases du code OTP (ex: 4 ou 6)
   * @default 6
   */
  length?: number;

  /**
   * Callback déclenché à chaque modification de la valeur complète
   */
  onChange?: (pin: string) => void;

  /**
   * Callback déclenché immédiatement dès que toutes les cases sont remplies
   */
  onComplete?: (pin: string) => void;

  /**
   * État désactivé
   */
  disabled?: boolean;

  /**
   * Afficher ou masquer le badge visuel d'auto-détection Android
   * @default true
   */
  showDetectionBadge?: boolean;

  /**
   * Classe CSS additionnelle pour le conteneur
   */
  className?: string;

  /**
   * Auto-focus sur la première case au montage
   * @default true
   */
  autoFocus?: boolean;
}

export const AutoOtpInput: React.FC<AutoOtpInputProps> = ({
  length = 6,
  onChange,
  onComplete,
  disabled = false,
  showDetectionBadge = true,
  className = '',
  autoFocus = true,
}) => {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState<boolean>(false);

  // Intégration du hook WebOTP Android natif
  const { isSupported, isListening, otp } = useWebOtp({
    autoStart: true,
    onOtpReceived: (code) => {
      handleExtractedOtp(code);
    },
  });

  // Met à jour la liste des cases quand la prop length change
  useEffect(() => {
    setDigits(Array(length).fill(''));
  }, [length]);

  // Focus initial
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  // Écoute de l'OTP externe si intercepté
  useEffect(() => {
    if (otp) {
      handleExtractedOtp(otp);
    }
  }, [otp]);

  /**
   * Traitement et injection d'un code OTP extrait (SMS WebOTP ou copier-coller)
   */
  const handleExtractedOtp = (rawOtp: string) => {
    // Regex pour extraire la première suite de chiffres
    const cleaned = rawOtp.replace(/\D/g, '').slice(0, length);
    if (!cleaned) return;

    const newDigits = Array(length).fill('');
    for (let i = 0; i < cleaned.length; i++) {
      newDigits[i] = cleaned[i];
    }

    setDigits(newDigits);
    setIsAutoFilled(true);
    hapticAutoFill();

    const fullPin = newDigits.join('');
    if (onChange) onChange(fullPin);

    // Focus sur la dernière case ou après
    const targetIdx = Math.min(cleaned.length, length - 1);
    if (inputRefs.current[targetIdx]) {
      inputRefs.current[targetIdx]?.focus();
    }

    if (cleaned.length === length && onComplete) {
      onComplete(fullPin);
    }

    // Réinitialise l'animation après 2 secondes
    setTimeout(() => setIsAutoFilled(false), 2000);
  };

  /**
   * Gestion de la frappe par case
   */
  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Garde uniquement le dernier chiffre entré
    const lastChar = value.slice(-1).replace(/\D/g, '');

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    if (lastChar) {
      hapticSelection();
    }

    const currentPin = newDigits.join('');
    if (onChange) onChange(currentPin);

    // Déplacement automatique vers la case suivante
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Détection complétion
    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(currentPin);
    }
  };

  /**
   * Gestion du clavier (Backspace & Flèches)
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Si la case actuelle est vide, efface et recule vers la précédente
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
        hapticSelection();
        if (onChange) onChange(newDigits.join(''));
      } else if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        hapticSelection();
        if (onChange) onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Gestion du collage (Paste) avec regex d'extraction
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    handleExtractedOtp(pasteData);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Badge d'état de détection SMS WebOTP Android */}
      {showDetectionBadge && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all duration-300 border bg-slate-900/80 border-slate-700/60 shadow-inner">
          {isSupported && isListening ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span>📡</span> Écoute SMS Android active (WebOTP)
              </span>
            </>
          ) : isSupported ? (
            <span className="text-slate-400 flex items-center gap-1">
              <span>📱</span> Auto-détection prête
            </span>
          ) : (
            <span className="text-slate-500 flex items-center gap-1">
              <span>⌨️</span> Saisie manuelle sécurisée
            </span>
          )}
        </div>
      )}

      {/* Rangée de cases segmentées */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {digits.map((digit, idx) => (
          <div key={idx} className="relative">
            <input
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={idx === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleInputChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-lg transition-all duration-200 outline-none
                ${
                  digit
                    ? 'border-emerald-500 text-emerald-400 bg-slate-900/90 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'border-slate-700/80 text-white bg-slate-950/70 hover:border-slate-500'
                }
                ${
                  isAutoFilled
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                    : ''
                }
                border-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:scale-105
                disabled:opacity-40 disabled:cursor-not-allowed`}
            />

            {/* Trait laser de soulignement cyber */}
            <div
              className={`absolute bottom-1 left-2 right-2 h-0.5 rounded-full transition-all duration-300 ${
                digit ? 'bg-emerald-400' : 'bg-transparent'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Helper d'information */}
      <p className="text-[11px] text-slate-400 text-center">
        Collez le code ou laissez Android remplir automatiquement le SMS reçu
      </p>
    </div>
  );
};
export default AutoOtpInput;
