import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * WebOTP API interface standard
 */
interface OTPCredential extends Credential {
  code: string;
}

export interface WebOtpOptions {
  /**
   * Démarrer l'écoute dès le montage du hook si supporté
   * @default true
   */
  autoStart?: boolean;

  /**
   * Callback déclenché dès qu'un code OTP est intercepté par SMS
   */
  onOtpReceived?: (code: string) => void;
}

export interface WebOtpState {
  otp: string;
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Hook personnalisé d'écoute automatique des SMS entrants via l'API native WebOTP
 * (navigator.credentials.get({ otp: { transport: ['sms'] } }))
 */
export function useWebOtp(options: WebOtpOptions = {}): WebOtpState {
  const { autoStart = true, onOtpReceived } = options;
  const [otp, setOtp] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const callbackRef = useRef(onOtpReceived);

  // Maintient la référence callback à jour sans re-déclencher les effets
  useEffect(() => {
    callbackRef.current = onOtpReceived;
  }, [onOtpReceived]);

  // Détection du support navigateur au chargement
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'OTPCredential' in window &&
      typeof navigator !== 'undefined' &&
      'credentials' in navigator &&
      typeof navigator.credentials.get === 'function';

    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    if (typeof window === 'undefined' || !('OTPCredential' in window) || !navigator.credentials) {
      return;
    }

    // Interrompt une session précédente le cas échéant
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsListening(true);
    setError(null);

    try {
      const content = (await navigator.credentials.get({
        // @ts-expect-error WebOTP API otp transport parameter
        otp: { transport: ['sms'] },
        signal: abortController.signal,
      })) as OTPCredential | null;

      if (content && content.code) {
        const cleanedCode = content.code.trim();
        setOtp(cleanedCode);
        if (callbackRef.current) {
          callbackRef.current(cleanedCode);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // AbortError est une interruption normale (cleanup ou annulation utilisateur)
        if (err.name !== 'AbortError') {
          console.warn('[WebOTP] Erreur d’interception SMS:', err.message);
          setError(err.message);
        }
      }
    } finally {
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (autoStart && isSupported) {
      startListening();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoStart, isSupported, startListening]);

  return {
    otp,
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
  };
}
