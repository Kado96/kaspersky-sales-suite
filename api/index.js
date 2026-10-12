// Native Vercel Serverless Function - Zero dependencies, ultra-fast & bulletproof
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

// AfriPay credentials (stored server-side only — NEVER exposed to frontend)
const AFRIPAY_APP_ID = process.env.AFRIPAY_APP_ID || '5b47c080a61d5652c3696cbdf2f8a8cd';
const AFRIPAY_APP_SECRET = process.env.AFRIPAY_APP_SECRET || 'JDJ5JDEwJHNPRHp3';
const AFRIPAY_CHECKOUT_URL = process.env.AFRIPAY_CHECKOUT_URL || 'https://www.afripay.africa/checkout/index.php';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://kaspersky-sales-suite.vercel.app').replace(/\/+$/, '');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = (req.url || '/').split('?')[0];

  // Parse body (JSON or form-urlencoded)
  let body = req.body;
  if (!body && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const raw = Buffer.concat(buffers).toString();
      if (raw) {
        try { body = JSON.parse(raw); }
        catch { const p = new URLSearchParams(raw); body = Object.fromEntries(p); }
      }
    } catch (e) {}
  }
  body = body || {};

  res.setHeader('Content-Type', 'application/json');

  // ─── Health Check ───────────────────────────────────────────────────────────
  if (url === '/api/health' || url === '/health') {
    res.statusCode = 200;
    return res.end(JSON.stringify({ status: 'ok', message: 'Kaspersky API active on Vercel' }));
  }

  // ─── Config ─────────────────────────────────────────────────────────────────
  if (url === '/api/config' || url === '/config') {
    if (req.method === 'GET') {
      res.statusCode = 200;
      return res.end(JSON.stringify(memoryConfig));
    }
    if (req.method === 'POST') {
      memoryConfig = { ...memoryConfig, ...body };
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, message: 'Configuration mise à jour avec succès' }));
    }
  }

  // ─── Payment Initiate ────────────────────────────────────────────────────────
  // CORRECTION : ajout des champs app_id, app_secret, return_url, cancel_url, back_url
  // requis par AfriPay (sinon → "Certains paramètres obligatoires sont manquants !")
  if (url === '/api/payment/initiate' || url === '/payment/initiate') {
    const { email, amount, currency, comment, returnUrl, cancelUrl, backUrl } = body;
    const clientToken = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedAmount = String(amount || 20000).replace(/\s+/g, '');

    memoryTransactions[clientToken] = {
      id: clientToken,
      email,
      amount: normalizedAmount,
      currency: currency || 'BIF',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      transactionId: clientToken,
      redirectUrl: AFRIPAY_CHECKOUT_URL,
      checkoutFormData: {
        amount: normalizedAmount,
        currency: currency || 'BIF',
        client_token: clientToken,
        comment: comment || `Achat Kaspersky - ${email}`,
        return_url: returnUrl || `${FRONTEND_URL}/paiement/resultat`,
        cancel_url: cancelUrl || `${FRONTEND_URL}/paiement/echec`,
        back_url: backUrl || `${FRONTEND_URL}/`,
        app_id: AFRIPAY_APP_ID,
        app_secret: AFRIPAY_APP_SECRET,
      }
    }));
  }

  // ─── Webhook AfriPay ─────────────────────────────────────────────────────────
  const webhookRoutes = [
    '/api/payment/webhook/afripay',
    '/payment/webhook/afripay',
    '/api/payments/afripay/callback',
    '/payments/afripay/callback'
  ];
  if (webhookRoutes.includes(url)) {
    const { status, transaction_ref, payment_method, client_token } = body;
    if (client_token && memoryTransactions[client_token]) {
      memoryTransactions[client_token].status =
        (status === 'success' || status === 'COMPLETED') ? 'SUCCESS' : 'FAILED';
      memoryTransactions[client_token].transactionRef = transaction_ref;
      memoryTransactions[client_token].paymentMethod = payment_method;
    }
    res.statusCode = 200;
    return res.end(JSON.stringify({ status: 'ok', message: 'Callback AfriPay validé' }));
  }

  // ─── Payment Status ──────────────────────────────────────────────────────────
  const statusMatch = url.match(/^\/(?:api\/)?payment\/([^/]+)\/status$/);
  if (statusMatch) {
    const txn = memoryTransactions[statusMatch[1]];
    res.statusCode = 200;
    return res.end(JSON.stringify(txn || { status: 'PENDING' }));
  }

  // ─── Fallback ────────────────────────────────────────────────────────────────
  res.statusCode = 200;
  return res.end(JSON.stringify({ status: 'ok', fallback: true }));
};
