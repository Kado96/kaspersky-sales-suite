const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { AfriPayAdapter, PaymentService, WebhookService } = require('./src/modules/payment');

const app = express();
const PORT = process.env.PORT || 5001;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
app.use(express.json());

// Logger simple & diagnostic
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] [REQ] ${req.method} ${req.url} from ${req.headers.origin || 'No Origin'}`);
    next();
});

app.get('/api/health', (req, res) => {
    return res.status(200).json({ status: 'OK', message: 'API_IS_READY_V4' });
});

app.get('/', (req, res) => {
    res.status(200).send('Proxy Backend Kaspersky : OK');
});

let supabase = null;
try {
    supabase = require('./supabaseClient');
    console.log("[INIT] Supabase client checked.");
} catch (e) {
    console.error("[CRITICAL] Failed to load Supabase client:", e.message);
}

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

// --- Centralized Data Handlers (Hybrid Supabase/JSON) ---

const isKasperskyConfig = (cfg) =>
    cfg && typeof cfg === 'object' && (cfg.heroTitle || cfg.productName || Array.isArray(cfg.benefitCards));

const readLocalConfig = () => {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (e) { console.error("Error reading local config", e); }
    return null;
};

const getConfig = async () => {
    if (supabase) {
        const { data, error } = await supabase
            .from('site_config')
            .select('data')
            .eq('name', 'main')
            .single();
        if (!error && data && isKasperskyConfig(data.data)) return data.data;
        if (!error && data && !isKasperskyConfig(data.data)) {
            console.warn('[CONFIG] Supabase payload is not Kaspersky-shaped; falling back to config.json');
        }
    }
    return readLocalConfig();
};

const saveConfig = async (updatedConfig) => {
    if (supabase) {
        const { error } = await supabase
            .from('site_config')
            .upsert({ name: 'main', data: updatedConfig }, { onConflict: 'name' });
        if (!error) return true;
        console.error("Supabase config save error:", error);
    }
    // Fallback JSON
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error saving local config", e);
        return false;
    }
};

const getTransactions = async () => {
    if (supabase) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
        if (!error) return data;
    }
    // Fallback JSON
    try {
        if (fs.existsSync(TRANSACTIONS_FILE)) {
            return JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
        }
    } catch (e) { console.error("Error reading local transactions", e); }
    return [];
};

const upsertTransaction = async (txn) => {
    if (supabase) {
        const { error } = await supabase
            .from('transactions')
            .upsert(txn);
        if (!error) return true;
    }
    // Fallback JSON
    try {
        let transactions = [];
        if (fs.existsSync(TRANSACTIONS_FILE)) {
            transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
        }
        const idx = transactions.findIndex(t => t.id === txn.id);
        if (idx >= 0) transactions[idx] = { ...transactions[idx], ...txn };
        else transactions.unshift(txn);
        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error("Error saving local transaction", e);
        return false;
    }
};

// --- System mailer ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPaymentEmail = async (email, transactionId, status) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email credentials not configured.");
        return { success: false, message: "Email credentials missing" };
    }

    const isSuccess = status === 'success' || status === 'completed' || status === 'SUCCESS';
    const config = await getConfig() || { downloadUrl: "https://drive.google.com/file/d/1jk5kbmm74K6nf9OYcs03aJ0Zd1-GCY74/view?usp=drive_link" };
    const downloadUrl = config.downloadUrl;

    const mailOptions = {
        from: `"Kaspersky Burundi" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: isSuccess
            ? `✅ Succès : Votre licence Kaspersky est prête ! (${transactionId})`
            : `⚠️ Problème : État de votre paiement Kaspersky (${transactionId})`,
        html: isSuccess ? `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px;">
                <h2 style="color: #00a884; text-align: center;">Félicitations !</h2>
                <p>Bonjour,</p>
                <p>Nous avons le plaisir de vous informer que votre paiement pour <b>Kaspersky Antivirus</b> a été validé avec succès.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 5px solid #00a884; margin: 20px 0;">
                    <p style="margin: 0;"><b>ID Transaction :</b> ${transactionId}</p>
                    <p style="margin: 5px 0 0 0;"><b>Produit :</b> Licence 1 an - Multi-appareils</p>
                </div>
                <p>Vous pouvez télécharger votre logiciel en cliquant sur le bouton ci-dessous :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${downloadUrl}" style="background-color: #00a884; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">TÉLÉCHARGER LE LOGICIEL</a>
                </div>
                <p style="font-size: 12px; color: #666;">Si le bouton ne fonctionne pas, copiez ce lien : ${downloadUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999; text-align: center;">Merci d'avoir choisi le revendeur agréé Kaspersky Burundi.</p>
            </div>
        ` : `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f44336; border-radius: 10px; padding: 20px;">
                <h2 style="color: #f44336; text-align: center;">Attention : Paiement non complété</h2>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre signalement pour la transaction <b>${transactionId}</b>, mais le paiement n'est pas encore confirmé.</p>
                <p><b>Statut actuel :</b> ${status}</p>
                <div style="background-color: #fffde7; padding: 15px; border-radius: 5px; border-left: 5px solid #fbc02d; margin: 20px 0;">
                    <p style="margin: 0;"><b>Conseils :</b></p>
                    <ul style="margin: 10px 0 0 0;">
                        <li>Vérifiez que votre solde Lumicash/Ecocash est suffisant.</li>
                        <li>Assurez-vous d'avoir validé la transaction sur votre téléphone.</li>
                        <li>Réessayez de cliquer sur "Acheter Maintenant" sur le site.</li>
                    </ul>
                </div>
                <p>Si vous avez été débité, n'ayez crainte. Notre support vérifie manuellement les transactions toutes les heures.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999; text-align: center;">Support Technique - Kaspersky Burundi</p>
            </div>
        ` 
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

// --- Universal Payment Engine Initialization ---
const paymentRepository = {
    saveTransaction: async (txn) => {
        return await upsertTransaction(txn);
    },
    getTransaction: async (transactionId) => {
        const transactions = await getTransactions();
        return transactions.find(t => t.id === transactionId) || null;
    },
    updateTransaction: async (transactionId, data) => {
        return await upsertTransaction({ id: transactionId, ...data });
    },
    isProcessed: async (transactionId) => {
        const transactions = await getTransactions();
        const txn = transactions.find(t => t.id === transactionId);
        return Boolean(txn && (txn.status === 'success' || txn.processed === true));
    }
};

const afripayAdapter = new AfriPayAdapter({
    appId: process.env.AFRIPAY_APP_ID,
    appSecret: process.env.AFRIPAY_APP_SECRET,
    checkoutUrl: process.env.AFRIPAY_CHECKOUT_URL,
    defaultFrontendUrl: process.env.FRONTEND_URL || 'https://kaspersky.kesug.com'
});

const paymentService = new PaymentService(afripayAdapter, paymentRepository);
const webhookService = new WebhookService(afripayAdapter, paymentRepository, sendPaymentEmail);

// --- New Universal Payment API Routes ---

// 1. POST /api/payment/initiate
app.post('/api/payment/initiate', async (req, res) => {
    try {
        const { email, amount, currency, comment, customerName, phone, mode, items, metadata, returnUrl, cancelUrl, backUrl } = req.body;

        let finalAmount = amount;
        let finalCurrency = currency || 'BIF';

        if (!finalAmount) {
            const config = await getConfig();
            finalAmount = config ? config.price : '20000';
            finalCurrency = (config && config.currency) || finalCurrency;
        }

        const result = await paymentService.initiate({
            email,
            amount: finalAmount,
            currency: finalCurrency,
            comment: comment || `Achat Kaspersky - ${email}`,
            customerName,
            phone,
            mode: mode || 'single_product',
            items,
            metadata,
            returnUrl,
            cancelUrl,
            backUrl
        });

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (err) {
        console.error('[ERROR] /api/payment/initiate:', err);
        return res.status(500).json({ success: false, error: err.message || 'Erreur lors de l’initiation du paiement' });
    }
});

// 2. POST /api/payment/webhook/afripay
app.post('/api/payment/webhook/afripay', async (req, res) => {
    try {
        console.log('[WEBHOOK] AfriPay notification reçue:', req.body);
        const result = await webhookService.handleWebhook(req.body);
        return res.status(200).json(result);
    } catch (err) {
        console.error('[ERROR] /api/payment/webhook/afripay:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 3. GET /api/payment/:clientToken/status
app.get('/api/payment/:clientToken/status', async (req, res) => {
    try {
        const { clientToken } = req.params;
        const result = await paymentService.getStatus(clientToken);
        return res.status(200).json(result);
    } catch (err) {
        console.error('[ERROR] /api/payment/:clientToken/status:', err);
        return res.status(500).json({ status: 'PENDING', error: err.message });
    }
});

// --- Administration Routes ---
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'donald';
    const adminPass = process.env.ADMIN_PASS || 'donald';
    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'admin_token_secure_xyz789' });
    } else {
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
});

const requireAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'Bearer admin_token_secure_xyz789') next();
    else res.status(401).json({ success: false, message: 'Non autorisé' });
};

// --- Config Routes ---
app.get('/api/config', async (req, res) => {
    const config = await getConfig();
    if (!config) return res.status(404).json({ message: 'No config found' });
    res.json(config);
});

app.post('/api/config', requireAdmin, async (req, res) => {
    if (await saveConfig(req.body)) {
        res.json({ success: true, message: 'Configuration enregistrée' });
    } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
});

// --- Transactions Routes ---
app.get('/api/transactions', requireAdmin, async (req, res) => {
    const transactions = await getTransactions();
    res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
    await upsertTransaction(req.body);
    res.json({ success: true });
});

// --- Backwards Compatibility Routes ---
app.post('/api/callback', async (req, res) => {
    console.log(`[CALLBACK LEGACY] Notification reçue:`, req.body);
    await webhookService.handleWebhook(req.body);
    res.status(200).send('OK'); 
});

app.get('/api/check-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    const result = await paymentService.getStatus(transactionId);
    return res.json({ 
        status: result.status, 
        transaction: result.metadata || null 
    });
});

app.post('/api/notify-payment', async (req, res) => {
    const { email, transactionId, status } = req.body;
    const result = await sendPaymentEmail(email, transactionId, status);
    if (result.success) {
        res.json({ success: true, message: 'Email envoyé avec succès' });
    } else {
        res.status(500).json(result);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
