import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { API_URL } from '../lib/siteConfig';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  
  const [status, setStatus] = useState<'polling' | 'success' | 'failure' | 'timeout'>('polling');
  const [message, setMessage] = useState('Vérification de votre transaction...');
  const [dots, setDots] = useState('.');
  const [isNetworkError, setIsNetworkError] = useState(false);

  const txnId = searchParams.get('token') || searchParams.get('client_token') || localStorage.getItem('pending_txn_id');
  const email = localStorage.getItem('pending_email');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '.' : d + '.'));
    }, 600);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    if (!txnId) {
      setStatus('failure');
      setMessage('Identifiant de transaction introuvable.');
      return;
    }

    let pollCount = 0;
    const maxPolls = 120; // 10 minutes (5s * 120)
    let isFinished = false;

    const checkStatus = async () => {
      if (isFinished) return true;

      try {
        setIsNetworkError(false);

        // Check using the universal status endpoint
        const response = await axios.get(`${API_URL}/payment/${txnId}/status`, {
          timeout: 10000
        });
        const data = response.data;

        if (data.status === 'SUCCESS' || data.status === 'COMPLETED' || data.response_code === '00') {
          isFinished = true;
          setStatus('success');
          setMessage('Paiement validé avec succès ! Votre commande est confirmée.');
          
          // Clean storage and redirect to success page
          localStorage.removeItem('pending_txn_id');
          localStorage.removeItem('pending_email');

          setTimeout(() => navigate('/paiement/succes'), 2500);
          return true;
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          isFinished = true;
          setStatus('failure');
          setMessage('La transaction a échoué ou a été annulée par l\'opérateur.');
          return true;
        }
      } catch (error) {
        console.error('Polling error:', error);
        setIsNetworkError(true);
      }
      return false;
    };

    const interval = setInterval(async () => {
      const done = await checkStatus();
      if (done) {
        clearInterval(interval);
        return;
      }
      
      pollCount++;
      if (pollCount >= maxPolls && status === 'polling') {
        clearInterval(interval);
        setStatus('timeout');
        setMessage('Délai d\'attente dépassé. Si votre compte a été débité, le traitement sera automatique sous peu.');
      }
    }, 5000);

    // Initial immediate check
    checkStatus();

    return () => clearInterval(interval);
  }, [txnId, email, navigate]);

  const whatsappSupportUrl = `https://wa.me/25761000000?text=${encodeURIComponent(
    `Bonjour, j'ai une question concernant ma commande Kaspersky (ID: ${txnId || 'N/A'}, Email: ${email || 'N/A'}).`
  )}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6">
        
        {/* POLLING STATE */}
        {status === 'polling' && (
          <>
            <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
            
            <div>
              <h1 className="text-2xl font-display font-bold">Vérification en cours{dots}</h1>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>

            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-xs tracking-wider">
              <span>MONTANT :</span>
              <span>{config.price} {config.currency}</span>
            </div>
            
            <div className="space-y-4 text-left">
              {isNetworkError && (
                <div className="p-3 bg-destructive/10 rounded-xl flex items-center gap-3 border border-destructive/20 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive-foreground font-medium">
                    Connexion instable... Nouvelle tentative en cours. Ne fermez pas cette page.
                  </p>
                </div>
              )}

              <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-3 border border-border">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-foreground/90">
                  Après avoir confirmé sur votre mobile, la validation s'effectuera automatiquement ici.
                </p>
              </div>

              {/* USSD Instructions Tabs / Guide */}
              <div className="space-y-3">
                {/* Lumicash */}
                <div className="glass-card rounded-xl p-4 space-y-2 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-display font-bold text-primary tracking-widest uppercase">
                      📱 PROCÉDURE LUMICASH
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary font-semibold">Optionnel</span>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>1. Composez <span className="text-foreground font-bold">*163#</span></li>
                    <li>2. Choisissez <span className="text-foreground font-bold">4. Payer les factures</span></li>
                    <li>3. Choisissez <span className="text-foreground font-bold">2. Approuver les transactions</span></li>
                    <li>4. Choisissez <span className="text-foreground font-bold">1. AFRIREGISTER</span></li>
                    <li>5. Saisissez votre <span className="text-foreground font-bold">Code PIN</span>.</li>
                  </ul>
                </div>

                {/* Ecocash */}
                <div className="glass-card rounded-xl p-4 space-y-2 border border-border">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-display font-bold text-cyber-orange tracking-widest uppercase">
                      📱 PROCÉDURE ECOCASH
                    </p>
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>1. Composez <span className="text-foreground font-bold">*444#</span></li>
                    <li>2. Validez le paiement en attente en saisissant votre <span className="text-foreground font-bold">Code PIN</span>.</li>
                  </ul>
                </div>
              </div>

              {/* Support Quick Link */}
              <div className="pt-2 text-center">
                <a 
                  href={whatsappSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#25D366] hover:underline font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  Besoin d'aide immédiate sur WhatsApp ?
                </a>
              </div>
            </div>
          </>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-cyber-green mx-auto animate-bounce" />
            <h1 className="text-2xl font-display font-bold text-cyber-green">Paiement Validé !</h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            <div className="p-4 bg-cyber-green/10 rounded-xl border border-cyber-green/30 text-xs text-cyber-green">
              Redirection automatique vers votre page de téléchargement...
            </div>
          </>
        )}

        {/* FAILURE / TIMEOUT STATE */}
        {(status === 'failure' || status === 'timeout') && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-display font-bold text-destructive">
              {status === 'timeout' ? 'Délai d\'attente dépassé' : 'Échec du paiement'}
            </h1>
            <p className="text-muted-foreground text-sm">{message}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => navigate('/')}
                className="cyber-button flex-1 py-3 rounded-lg text-sm font-bold"
              >
                Réessayer l'achat
              </button>
              
              <a 
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-lg bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/25 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Support WhatsApp
              </a>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentResult;
