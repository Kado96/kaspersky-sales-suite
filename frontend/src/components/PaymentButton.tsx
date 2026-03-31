import React, { useState } from 'react';
import { Mail, CreditCard, Smartphone } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import axios from 'axios';
import { API_URL } from '../lib/siteConfig';

const FRONTEND_URL = import.meta.env.PROD 
  ? 'https://kaspersky.kesug.com' 
  : 'http://localhost:8080';

const PaymentButton: React.FC = () => {
  const { config } = useConfig();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert("Veuillez saisir une adresse email valide.");
      return;
    }

    const txnId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('pending_email', email);
    localStorage.setItem('pending_txn_id', txnId);

    // Capture IMMÉDIATE de l'email dans l'admin pour ne pas perdre le lead
    axios.post(`${API_URL}/transactions`, {
      id: txnId,
      email: email,
      amount: config.price,
      status: 'attempted',
      date: new Date().toISOString()
    });

    // Form data to AfriPay
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.afripay.africa/checkout/index.php';

    const params: Record<string, string> = {
      'amount': config.price.replace(/\s/g, ''),
      'currency': config.currency,
      'comment': `Achat ${config.productName} - ${email}`,
      'client_token': txnId,
      'return_url': `${FRONTEND_URL}/paiement/resultat`,
      'cancel_url': `${FRONTEND_URL}/`,
      'back_url': `${FRONTEND_URL}/`,
      'app_id': '5b47c080a61d5652c3696cbdf2f8a8cd',
      'app_secret': 'JDJ5JDEwJHNPRHp3'
    };

    for (const key in params) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id="email-input"
          name="email"
          type="email"
          required
          placeholder={config.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-secondary border border-border rounded-lg py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button 
        onClick={handleSubmit}
        className="cyber-button w-full py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 font-bold tracking-widest"
      >
        <CreditCard className="w-4 h-4" /> {config.ctaText}
      </button>
    </div>
  );
};

export default PaymentButton;
