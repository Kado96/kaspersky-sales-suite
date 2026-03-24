const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erreur : SUPABASE_URL et SUPABASE_KEY doivent être définis dans le .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

async function migrate() {
    console.log("🚀 Début de la migration vers Supabase...");

    // 1. Migration de la CONFIG
    if (fs.existsSync(CONFIG_FILE)) {
        console.log("📦 Migration de config.json...");
        const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        
        const { error } = await supabase
            .from('site_config')
            .upsert({ name: 'main', data: configData }, { onConflict: 'name' });

        if (error) console.error("❌ Erreur config:", error.message);
        else console.log("✅ Config migrée !");
    }

    // 2. Migration des TRANSACTIONS
    if (fs.existsSync(TRANSACTIONS_FILE)) {
        console.log("📦 Migration de transactions.json...");
        const transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
        
        for (const txn of transactions) {
            const { error } = await supabase
                .from('transactions')
                .upsert(txn);
            
            if (error) console.error(`❌ Erreur transaction ${txn.id}:`, error.message);
        }
        console.log("✅ Transactions migrées !");
    }

    console.log("🏁 Migration terminée.");
}

migrate();
