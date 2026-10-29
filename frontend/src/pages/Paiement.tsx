import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import AutoOtpInput from '../components/AutoOtpInput';
import { hapticSuccess, hapticError, hapticWarning } from '../lib/haptic';

interface PaymentState {
  txnId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  licenseType?: string;
  phoneNumber?: string;
  paymentMethod?: string;
}

export const Paiement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const stateData = (location.state as PaymentState) || {};
  const txnId = searchParams.get('txnId') || searchParams.get('id') || stateData.txnId || 'TXN-KASP-' + Math.floor(100000 + Math.random() * 900000);
  const amount = searchParams.get('amount') || stateData.amount || '45 000';
  const currency = searchParams.get('currency') || stateData.currency || 'BIF';
  const licenseType = searchParams.get('license') || stateData.licenseType || 'Kaspersky Total Security (1 An / 3 Postes)';
  const initialPhone = searchParams.get('phone') || stateData.phoneNumber || '+257 ';

  // États du formulaire et du cycle de paiement
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhone);
  const [paymentMethod, setPaymentMethod] = useState<'lumicash' | 'ecocash' | 'afripay'>('lumicash');
  const [otpCode, setOtpCode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'awaiting_otp' | 'processing' | 'confirmed' | 'failed'>('awaiting_otp');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(30);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [pollingAttempts, setPollingAttempts] = useState<number>(0);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compte à rebours pour le renvoi de SMS
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0 && !canResend) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [cooldown, canResend]);

  /**
   * Polling adaptatif haute fréquence (toutes les 2 secondes au début)
   * Détecte la confirmation du paiement en temps réel et déclenche la redirection zéro-clic.
   */
  const pollPaymentStatus = useCallback(async () => {
    if (!txnId) return;

    try {
      setPollingAttempts((prev) => prev + 1);
      const response = await fetch(`/api/payment/${txnId}/status`, {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        const paymentState = (data.status || data.state || '').toUpperCase();

        if (['COMPLETED', 'SUCCESS', 'PAID', 'CONFIRMED'].includes(paymentState)) {
          // Transition instantanée zéro-clic
          setStatus('confirmed');
          hapticSuccess();

          if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
          }

          // Redirection fluide immédiate vers la page de succès
          setTimeout(() => {
            navigate('/paiement/succes', {
              state: {
                txnId,
                amount,
                currency,
                licenseType,
                confirmedAt: new Date().toISOString(),
              },
            });
          }, 400);
          return;
        }

        if (['FAILED', 'CANCELLED', 'EXPIRED', 'REJECTED'].includes(paymentState)) {
          setStatus('failed');
          setErrorMessage(data.message || 'Le paiement a été rejeté ou a expiré.');
          hapticError();
          return;
        }
      }
    } catch (err) {
      console.debug('[Polling Status] Requête en attente de réponse:', err);
    }

    // Prochaine itération de polling (2 secondes initiales, adaptable)
    const nextInterval = pollingAttempts > 15 ? 3000 : 2000;
    pollingTimerRef.current = setTimeout(pollPaymentStatus, nextInterval);
  }, [txnId, amount, currency, licenseType, navigate, pollingAttempts]);

  // Démarre le polling automatique dès que la transaction est créée ou en attente
  useEffect(() => {
    if (status === 'awaiting_otp' || status === 'processing') {
      pollingTimerRef.current = setTimeout(pollPaymentStatus, 2000);
    }

    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
    };
  }, [status, pollPaymentStatus]);

  /**
   * Soumission automatique ou manuelle du code OTP
   */
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpCode;
    if (!finalCode || finalCode.length < 4) {
      setErrorMessage('Veuillez saisir un code OTP valide.');
      hapticWarning();
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/payment/${txnId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          txnId,
          otp: finalCode,
          phoneNumber,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Code OTP invalide ou expiré');
      }

      const resData = await response.json();

      // Si la confirmation est immédiate côté serveur
      if (['COMPLETED', 'SUCCESS', 'PAID'].includes((resData.status || '').toUpperCase())) {
        setStatus('confirmed');
        hapticSuccess();
        setTimeout(() => {
          navigate('/paiement/succes', {
            state: { txnId, amount, currency, licenseType },
          });
        }, 300);
      } else {
        // Continue avec le polling adaptatif
        pollPaymentStatus();
      }
    } catch (err: unknown) {
      setStatus('awaiting_otp');
      hapticError();
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Erreur lors de la validation du code.');
      }
    }
  };

  /**
   * Renvoi du code SMS
   */
  const handleResendSms = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCooldown(30);
    setErrorMessage(null);

    try {
      await fetch(`/api/payment/${txnId}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnId, phoneNumber }),
      });
      hapticWarning();
    } catch (e) {
      console.warn('Erreur renvoi SMS:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Barre supérieure cyber sécurisée */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
              K
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white">Kaspersky Sales Suite</h1>
              <p className="text-[11px] text-emerald-400 font-mono">Terminal de Paiement Sécurisé</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-xl w-full mx-auto p-4 sm:p-6 my-auto">
        <div className="relative bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl overflow-hidden">
          {/* Effet d'arrière-plan cyber néon */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Récapitulatif commande */}
          <div className="border-b border-slate-800 pb-5 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Licence Officielle
                </span>
                <h2 className="text-lg font-bold text-white mt-2">{licenseType}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Réf: {txnId}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-400">{amount}</span>
                <span className="text-xs font-mono text-slate-400 ml-1">{currency}</span>
              </div>
            </div>
          </div>

          {/* Message d'erreur éventuel */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          {/* État : Validation OTP avec Auto-détection Android */}
          {status === 'awaiting_otp' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-base font-semibold text-white">Confirmation par SMS</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Un code de confirmation a été envoyé au <span className="text-emerald-400 font-mono">{phoneNumber || 'numéro mobile'}</span>
                </p>
              </div>

              {/* Composant AutoOtpInput avec WebOTP et Cases Segmentées */}
              <div className="py-2">
                <AutoOtpInput
                  length={6}
                  autoFocus={true}
                  onChange={(pin) => {
                    setOtpCode(pin);
                    setErrorMessage(null);
                  }}
                  onComplete={(pin) => {
                    setOtpCode(pin);
                    handleVerifyOtp(pin);
                  }}
                />
              </div>

              {/* Actions & Bouton de validation zéro-friction */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={otpCode.length < 4}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200
                    bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none font-mono"
                >
                  Confirmer et Activer la Licence
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Pas de SMS reçu ?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendSms}
                      className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4"
                    >
                      Renvoyer le code
                    </button>
                  ) : (
                    <span className="font-mono text-slate-500">Renvoyer dans {cooldown}s</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* État : Traitement en cours avec Radar Cyber & Polling */}
          {status === 'processing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
                <div className="absolute w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-400 text-sm">🔒</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Validation de la transaction</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Détection temps réel en cours... ({pollingAttempts} vérifications)
                </p>
              </div>

              <div className="w-48 bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {/* État : Succès confirmé (avant redirection instantanée) */}
          {status === 'confirmed' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-2xl scale-110 transition-transform">
                ✓
              </div>
              <h3 className="text-base font-bold text-white">Paiement validé avec succès !</h3>
              <p className="text-xs text-slate-400">Redirection instantanée vers votre reçu...</p>
            </div>
          )}

          {/* État : Échec */}
          {status === 'failed' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 text-2xl">
                ✕
              </div>
              <h3 className="text-base font-bold text-white">Transaction non aboutie</h3>
              <button
                type="button"
                onClick={() => {
                  setStatus('awaiting_otp');
                  setErrorMessage(null);
                }}
                className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
              >
                Réessayer la vérification
              </button>
            </div>
          )}
        </div>

        {/* Badges de confiance & sécurité */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500">🛡️</span>
            <span>Kaspersky Anti-Fraud Shield</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">⚡</span>
            <span>Activation instantanée</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">📲</span>
            <span>Compatible Mobile Money</span>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-600 font-mono">
        © 2026 Kaspersky Sales Suite • Bujumbura, Burundi • Tous droits réservés
      </footer>
    </div>
  );
};
export default Paiement;
