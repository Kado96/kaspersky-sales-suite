const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: ['http://localhost:8080', 'http://kukasoko.wuaze.com', 'https://kukasoko.wuaze.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

// --- Helper Functions ---
const readJsonFile = (filePath, defaultData = {}) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
    }
    return defaultData;
};

const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
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
    // Hardcoded credentials for now, could be in .env
    const adminUser = process.env.ADMIN_USER || 'donald';
    const adminPass = process.env.ADMIN_PASS || 'donald';
    
    if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'admin_token_secure_xyz789' }); // Simple token for this MVP
    } else {
        res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
});

// Middleware pour protéger les routes Admin
const requireAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'Bearer admin_token_secure_xyz789') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Non autorisé' });
    }
};

// --- Config Routes ---
app.get('/api/config', (req, res) => {
    const config = readJsonFile(CONFIG_FILE, null);
    if (!config) {
        // Return 404 so frontend knows to use default config
        return res.status(404).json({ message: 'No custom config found' });
    }
    res.json(config);
});

app.post('/api/config', requireAdmin, (req, res) => {
    const updatedConfig = req.body;
    if (writeJsonFile(CONFIG_FILE, updatedConfig)) {
        res.json({ success: true, message: 'Configuration enregistrée' });
    } else {
        res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
});

// --- Transactions Routes ---
app.get('/api/transactions', requireAdmin, (req, res) => {
    const transactions = readJsonFile(TRANSACTIONS_FILE, []);
    res.json(transactions);
});

// Route Callback appelée par AfriPay (Webhook)
app.post('/api/callback', async (req, res) => {
    const { status, amount, currency, transaction_ref, payment_method, client_token, phone, payer_phone, phone_number } = req.body;
    
    console.log(`[CALLBACK] Transaction ${client_token} : ${status} (Method: ${payment_method}, Phone: ${phone || payer_phone || phone_number})`);

    let transactions = readJsonFile(TRANSACTIONS_FILE, []);
    const existingIndex = transactions.findIndex(t => t.id === client_token);
    
    const txnUpdate = {
        id: client_token,
        status: status === 'success' ? 'success' : 'failed',
        transaction_ref,
        payment_method, 
        phone: phone || payer_phone || phone_number,
        last_callback: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        transactions[existingIndex] = { ...transactions[existingIndex], ...txnUpdate };
    } else {
        transactions.unshift(txnUpdate);
    }
    
    writeJsonFile(TRANSACTIONS_FILE, transactions);

    // Si succès, on peut déclencher l'email immédiatement si on a l'email stocké
    if (status === 'success' && transactions[existingIndex]?.email) {
        console.log(`Envoi automatique de l'email à ${transactions[existingIndex].email}`);
        sendPaymentEmail(transactions[existingIndex].email, client_token, 'success');
    }

    res.status(200).send('OK'); 
});

app.post('/api/transactions', (req, res) => {
    const txn = req.body;
    let transactions = readJsonFile(TRANSACTIONS_FILE, []);
    
    const existingIndex = transactions.findIndex(t => t.id === txn.id);
    if (existingIndex >= 0) {
        transactions[existingIndex] = { ...transactions[existingIndex], ...txn };
    } else {
        transactions.unshift(txn);
    }
    
    writeJsonFile(TRANSACTIONS_FILE, transactions);
    res.json({ success: true });
});

// Endpoint pour vérifier le statut (utilisé par le Polling du frontend)
app.get('/api/check-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    // On vérifie uniquement en local car AfriPay nous notifie via le Callback
    const transactions = readJsonFile(TRANSACTIONS_FILE, []);
    const localTxn = transactions.find(t => t.id === transactionId);

    if (localTxn) {
        // Mappe les status pour le frontend
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
    service: 'gmail', 
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
    const config = readJsonFile(CONFIG_FILE, { downloadUrl: "https://drive.google.com/file/d/1jk5kbmm74K6nf9OYcs03aJ0Zd1-GCY74/view?usp=drive_link" });
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
