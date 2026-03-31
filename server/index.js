const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

app.get('/api/health', (req, res) => {
    return res.status(200).json({ status: 'OK', message: 'API_IS_READY_V4' });
});

app.get('/', (req, res) => {
    res.send('SUPER_SERVER_V4_READY');
});

// Logger de diagnostic
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} from ${req.headers.origin || 'No Origin'}`);
    next();
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

const getConfig = async () => {
    if (supabase) {
        const { data, error } = await supabase
            .from('site_config')
            .select('data')
            .eq('name', 'main')
            .single();
        if (!error && data) return data.data;
    }
    // Fallback JSON
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (e) { console.error("Error reading local config", e); }
    return null;
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

// Logger simple
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('Proxy Backend Kaspersky : OK');
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

app.post('/api/callback', async (req, res) => {
    const { status, amount, currency, transaction_ref, payment_method, client_token, phone, payer_phone, phone_number } = req.body;
    console.log(`[CALLBACK] Transaction ${client_token} : ${status}`);

    const txnUpdate = {
        id: client_token,
        status: status === 'success' ? 'success' : 'failed',
        transaction_ref,
        payment_method, 
        phone: phone || payer_phone || phone_number,
        last_callback: new Date().toISOString()
    };

    await upsertTransaction(txnUpdate);

    // Email logic remains similar, but using the new getConfig
    if (status === 'success') {
        const transactions = await getTransactions();
        const fullTxn = transactions.find(t => t.id === client_token);
        if (fullTxn && fullTxn.email) {
            sendPaymentEmail(fullTxn.email, client_token, 'success');
        }
    }
    res.status(200).send('OK'); 
});

app.post('/api/transactions', async (req, res) => {
    await upsertTransaction(req.body);
    res.json({ success: true });
});

app.get('/api/check-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    const transactions = await getTransactions();
    const localTxn = transactions.find(t => t.id === transactionId);

    if (localTxn) {
        const statusMap = {
            'success': 'SUCCESS',
            'completed': 'SUCCESS',
            'failed': 'FAILED',
            'pending': 'PENDING'
        };
        return res.json({ 
            status: statusMap[localTxn.status] || localTxn.status.toUpperCase(), 
            transaction: localTxn 
        });
    }

    res.json({ status: 'PENDING', message: 'Transaction not found yet' });
});

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
    console.log(`Backend proxy running on http://localhost:${PORT}`);
});
