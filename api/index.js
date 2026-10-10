const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory fallback config & transactions store for Serverless environment
let memoryConfig = {
  productName: "Kaspersky Antivirus",
  subtitle: "MULTI-APPAREILS",
  heroTitle: "KASPERSKY",
  heroSubtitle: "Un investissement pour votre tranquillité d'esprit. Protégez-vous dès aujourd'hui.",
  price: "20 000",
  currency: "BIF",
  paymentNote: "PAIEMENT UNIQUE • LICENCE 1 AN",
  features: [
    "Multi-appareils",
    "Garantie 3 ans incluse",
    "Guide d'installation complet",
    "Vidéo tutoriel fournie",
    "Lien de téléchargement envoyé par email",
    "Protection antivirus en temps réel",
    "Blocage des ransomwares",
    "Support technique 24/7"
  ],
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  videoTitle: "TUTORIEL D'INSTALLATION",
  videoDescription: "Suivez ce guide vidéo étape par étape pour sécuriser votre appareil en moins de 3 minutes.",
  ctaText: "PROCÉDER AU PAIEMENT",
  emailPlaceholder: "votre.email@exemple.com",
  countdownEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  primaryHue: "160"
};

const memoryTransactions = {};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kaspersky Sales Suite API is active on Vercel' });
});

// GET /api/config
app.get('/api/config', (req, res) => {
  res.json(memoryConfig);
});

// POST /api/config
app.post('/api/config', (req, res) => {
  try {
    memoryConfig = { ...memoryConfig, ...req.body };
    res.json({ success: true, message: 'Configuration mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Échec de mise à jour' });
  }
});

// POST /api/payment/initiate
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { email, amount, currency, comment, returnUrl, cancelUrl, backUrl } = req.body;
    const clientToken = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    memoryTransactions[clientToken] = {
      id: clientToken,
      email,
      amount: amount || "20 000",
      currency: currency || "BIF",
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    const checkoutFormData = {
      amount: String(amount || 20000).replace(/\s+/g, ''),
      currency: currency || "BIF",
      client_token: clientToken,
      comment: comment || `Achat Kaspersky - ${email}`,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      back_url: backUrl
    };

    return res.status(200).json({
      success: true,
      transactionId: clientToken,
      redirectUrl: "https://www.afripay.africa/checkout/index.php",
      checkoutFormData
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/webhook/afripay & POST /api/payments/afripay/callback
const handleAfriPayCallback = (req, res) => {
  try {
    const { status, amount, currency, transaction_ref, payment_method, client_token } = req.body;
    
    if (client_token && memoryTransactions[client_token]) {
      memoryTransactions[client_token].status = (status === 'success' || status === 'COMPLETED') ? 'SUCCESS' : 'FAILED';
      memoryTransactions[client_token].transactionRef = transaction_ref;
      memoryTransactions[client_token].paymentMethod = payment_method;
    }

    return res.status(200).json({ status: "ok", message: "Callback AfriPay traité avec succès" });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

app.post('/api/payment/webhook/afripay', handleAfriPayCallback);
app.post('/api/payments/afripay/callback', handleAfriPayCallback);

// GET /api/payment/:clientToken/status
app.get('/api/payment/:clientToken/status', (req, res) => {
  const txn = memoryTransactions[req.params.clientToken];
  if (txn) {
    return res.status(200).json(txn);
  }
  return res.status(200).json({ status: "PENDING" });
});

module.exports = app;
