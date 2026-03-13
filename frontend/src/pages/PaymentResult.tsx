import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  
  const [status, setStatus] = useState<'polling' | 'success' | 'failure' | 'timeout'>('polling');
  const [message, setMessage] = useState('Vérification de votre paiement...');
  const [dots, setDots] = useState('.');

  const txnId = searchParams.get('token') || localStorage.getItem('pending_txn_id');
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
      setMessage('Identifiant de transaction manquant.');
      return;
    }

    let pollCount = 0;
    const maxPolls = 120; // 10 minutes (5s * 120)
    
    const checkStatus = async () => {
      try {
          // Poll our backend which proxies to AfriPay
        const response = await axios.get(`http://localhost:5001/api/check-status/${txnId}`);
        const data = response.data;

        if (data.status === 'SUCCESS' || data.status === 'COMPLETED' || data.response_code === '00') {
          setStatus('success');
          setMessage('Paiement validé ! Un email vous a été envoyé.');
          
          // Save transaction to backend
          await axios.post('http://localhost:5001/api/transactions', {
            id: txnId,
            email: email,
            amount: config.price,
            status: 'success',
            date: new Date().toISOString()
          });

          // Notify (send email)
          await axios.post('http://localhost:5001/api/notify-payment', {
            email: email,
            transactionId: txnId,
            status: 'success'
          });

          setTimeout(() => navigate('/paiement/succes'), 3000);
          return true;
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setStatus('failure');
          setMessage('Le paiement a échoué ou a été annulé.');
          return true;
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
      return false;
    };

    const interval = setInterval(async () => {
      const done = await checkStatus();
      if (done) clearInterval(interval);
      
      pollCount++;
      if (pollCount >= maxPolls && status === 'polling') {
        clearInterval(interval);
        setStatus('timeout');
        setMessage('Délai d\'attente dépassé. Si vous avez été débité, vérifiez vos emails.');
        
        // Notify delay
        if (email) {
            axios.post('http://localhost:5001/api/notify-payment', {
                email: email,
                transactionId: txnId,
                status: 'pending_delayed'
            });
        }
      }
    }, 5000);

    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, [txnId, email, navigate, config.price]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card neon-border rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {status === 'polling' && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-display font-bold">Confirmation{dots}</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="space-y-4 pt-4">
                <div className="p-4 bg-secondary/50 rounded-xl flex items-center gap-3 text-left border border-border">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-xs">
                        Vérification en cours. Une fois votre code PIN saisi sur votre téléphone, le système validera votre commande automatiquement.
                    </p>
                </div>

                <div className="glass-card rounded-xl p-4 text-left space-y-2 border-primary/20">
                    <p className="text-[10px] font-display font-bold text-primary tracking-widest uppercase">
                        Procédure Lumicash (si pas de popup)
                    </p>
                    <ul className="text-xs space-y-1.5 text-muted-foreground">
                        <li>1. Composez <span className="text-foreground font-bold">*163#</span></li>
                        <li>2. Sélectionnez <span className="text-foreground font-bold">4. Payer les factures</span></li>
                        <li>3. Sélectionnez <span className="text-foreground font-bold">2. Approuver les transactions</span></li>
                        <li>4. Sélectionnez <span className="text-foreground font-bold">1. AFRIREGISTER</span></li>
                        <li>5. Entrez votre <span className="text-foreground font-bold">Code PIN</span> pour valider.</li>
                    </ul>
                </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-cyber-green mx-auto" />
            <h1 className="text-2xl font-display font-bold text-cyber-green">Succès !</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {(status === 'failure' || status === 'timeout') && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-display font-bold text-destructive">
                {status === 'timeout' ? 'Délai dépassé' : 'Échec'}
            </h1>
            <p className="text-muted-foreground">{message}</p>
            <button 
                onClick={() => navigate('/')}
                className="cyber-button px-6 py-2 rounded-lg text-sm"
            >
                Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
