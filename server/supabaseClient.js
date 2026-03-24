const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    console.log('[SUPABASE] Initialisé pour la production.');
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.log('[SUPABASE] Non configuré, utilisation du stockage JSON (Local).');
}

module.exports = supabase;
