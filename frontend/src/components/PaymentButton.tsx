import React, { useState } from 'react';
import { Mail, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import axios from 'axios';
import { API_URL } from '../lib/siteConfig';

const PaymentButton: React.FC = () => {
  const { config } = useConfig();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setErrorMessage("Veuillez saisir une adresse email valide (ex: nom@exemple.com).");
      return;
    }

    setIsSubmitting(true);

    try {
      const frontendOrigin = window.location.origin;

      const response = await axios.post(`${API_URL}/payment/initiate`, {
        email: trimmedEmail,
        amount: config.price,
        currency: config.currency,
        comment: `Achat ${config.productName} - ${trimmedEmail}`,
        returnUrl: `${frontendOrigin}/paiement/resultat`,
        cancelUrl: `${frontendOrigin}/paiement/echec`,
        backUrl: `${frontendOrigin}/`,
      }, {
        timeout: 15000,
      });

      const data = response.data;

      if (!data.success || !data.redirectUrl || !data.checkoutFormData) {
        throw new Error(data.error || "Impossible d'initialiser la session de paiement.");
      }

      // Store transaction reference locally for state recovery and polling
      localStorage.setItem('pending_email', trimmedEmail);
      localStorage.setItem('pending_txn_id', data.transactionId);

      // Create dynamic POST form to safely submit to AfriPay checkout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.redirectUrl;

      const params: Record<string, string> = data.checkoutFormData;
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = params[key];
          form.appendChild(input);
        }
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      const apiErrorMsg = error.response?.data?.error || error.message || "Erreur de connexion avec le serveur de paiement. Veuillez réessayer.";
      setErrorMessage(apiErrorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full text-left" noValidate>
      <div className="space-y-1">
        <label htmlFor="email-input" className="text-xs font-medium text-muted-foreground block">
          Votre adresse email pour recevoir la licence
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="email-input"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            required
            placeholder={config.emailPlaceholder || "votre.email@exemple.com"}
            value={email}
            onChange={handleEmailChange}
            className={`w-full bg-secondary border rounded-lg py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
              errorMessage 
                ? 'border-destructive focus:ring-destructive/40 bg-destructive/5' 
                : 'border-border focus:ring-primary/50'
            } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>

      {/* Inline Validation Error Message */}
      {errorMessage && (
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 text-left">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive font-medium leading-relaxed">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={isSubmitting}
        className={`cyber-button w-full py-4 rounded-lg text-sm flex items-center justify-center gap-2.5 font-bold tracking-widest transition-all ${
          isSubmitting ? 'opacity-80 cursor-wait' : 'hover:scale-[1.01]'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>INITIALISATION EN COURS...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-black" />
            <span>{config.ctaText || "PROCÉDER AU PAIEMENT"} · {config.price} {config.currency}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default PaymentButton;
