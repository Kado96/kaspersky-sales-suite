import { useState, useEffect } from "react";
import { useConfig } from "@/context/ConfigContext";
import { updateSiteConfig, SiteConfig, fetchSiteConfig, API_URL } from "@/lib/siteConfig";
import { Save, ArrowLeft, Plus, Trash2, LogOut, Key, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const Admin = () => {
  const { refreshConfig } = useConfig();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin-token"));
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "content" | "history" | "testimonials">("general");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const liveConfig = await fetchSiteConfig();
      setConfig(liveConfig);
      
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (e) {
      console.error("Failed to load admin data", e);
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/admin/login`, loginData);
      if (res.data.success) {
        localStorage.setItem("admin-token", res.data.token);
        setToken(res.data.token);
        toast.success("Connexion réussie");
      }
    } catch (e) {
      toast.error("Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setToken(null);
    navigate("/");
  };

  const handleSave = async () => {
    if (!config || !token) return;
    try {
      await updateSiteConfig(config, token);
      await refreshConfig();
      toast.success("Configuration sauvegardée !");
    } catch (e) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    if (!config) return;
    setConfig((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card neon-border rounded-2xl p-8 max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <Key className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-display font-bold">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4"
              value={loginData.username}
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <button className="cyber-button w-full py-3 rounded-lg font-bold">ENTRER</button>
          </form>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const inputClass = "w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1 block";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </button>
          <div className="flex gap-4">
            <button onClick={handleSave} className="cyber-button px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-8 text-center sm:text-left">
          ⚙️ Panneau de Contrôle
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")}>Général</TabButton>
          <TabButton active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")}>Paiement</TabButton>
          <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")}>Cartes</TabButton>
          <TabButton active={activeTab === "testimonials"} onClick={() => setActiveTab("testimonials")}>Avis</TabButton>
          <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            <div className="flex items-center gap-2"><History className="w-4 h-4" /> Historique</div>
          </TabButton>
        </div>

        <div className="space-y-8">
          {activeTab === "general" && (
            <Section title="Informations de base">
              <Field label="Titre Hero" value={config.heroTitle} onChange={(v) => update("heroTitle", v)} />
              <Field label="Sous-titre Hero" value={config.heroSubtitle} onChange={(v) => update("heroSubtitle", v)} />
              <Field label="Hue Primaire (CSS)" value={config.primaryHue || "160"} onChange={(v) => update("primaryHue", v)} />
              <Field label="Fin Compte à rebours (ISO)" value={config.countdownEndDate} onChange={(v) => update("countdownEndDate", v)} />
              <div className="pt-4 border-t border-border mt-4">
                <h3 className="text-xs font-bold text-primary mb-3">FOOTER</h3>
                <Field label="Titre Footer" value={config.footerTitle} onChange={(v) => update("footerTitle", v)} />
                <Field label="Copyright/Texte Footer" value={config.footerText} onChange={(v) => update("footerText", v)} />
              </div>
            </Section>
          )}

          {activeTab === "pricing" && (
            <Section title="Paramètres Financiers">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prix" value={config.price} onChange={(v) => update("price", v)} />
                <Field label="Devise" value={config.currency} onChange={(v) => update("currency", v)} />
              </div>
              <Field label="Lien de téléchargement" value={config.downloadUrl || ""} onChange={(v) => update("downloadUrl", v)} />
              <Field label="Note de paiement" value={config.paymentNote} onChange={(v) => update("paymentNote", v)} />
            </Section>
          )}

          {activeTab === "content" && (
            <Section title="Configuration des Cartes">
                {config.benefitCards.map((card, i) => (
                    <div key={i} className="glass-card rounded-lg p-4 space-y-3 border border-border/50">
                        <Field label={`Titre Carte ${i+1}`} value={card.title} onChange={(v) => {
                            const newCards = [...config.benefitCards];
                            newCards[i].title = v;
                            update("benefitCards", newCards);
                        }} />
                        <Field label="Description" value={card.description} onChange={(v) => {
                            const newCards = [...config.benefitCards];
                            newCards[i].description = v;
                            update("benefitCards", newCards);
                        }} />
                    </div>
                ))}
            </Section>
          )}

          {activeTab === "testimonials" && (
            <Section title="Gestion des Avis Clients">
              <div className="space-y-4">
                {(config.testimonials || []).map((t, i) => (
                  <div key={i} className="glass-card rounded-lg p-4 space-y-3 border border-border/50 relative">
                    <button 
                      onClick={() => {
                        const newTestimonials = [...(config.testimonials || [])];
                        newTestimonials.splice(i, 1);
                        update("testimonials", newTestimonials);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nom" value={t.name} onChange={(v) => {
                        const newT = [...(config.testimonials || [])];
                        newT[i].name = v;
                        update("testimonials", newT);
                      }} />
                      <Field label="Role/Entreprise" value={t.role} onChange={(v) => {
                        const newT = [...(config.testimonials || [])];
                        newT[i].role = v;
                        update("testimonials", newT);
                      }} />
                    </div>
                    <Field label="Commentaire" value={t.content} onChange={(v) => {
                      const newT = [...(config.testimonials || [])];
                      newT[i].content = v;
                      update("testimonials", newT);
                    }} />
                    <Field label="Note (1-5)" value={String(t.rating)} onChange={(v) => {
                      const newT = [...(config.testimonials || [])];
                      newT[i].rating = parseInt(v) || 5;
                      update("testimonials", newT);
                    }} />
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newT = [...(config.testimonials || []), { name: "Nouveau Client", role: "Particulier", content: "Avis à remplir", rating: 5 }];
                    update("testimonials", newT);
                  }}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter un avis
                </button>
              </div>
            </Section>
          )}
          {activeTab === "history" && (
            <div className="glass-card rounded-xl overflow-hidden border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Téléphone</th>
                    <th className="px-6 py-4">Méthode</th>
                    <th className="px-6 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((t, i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{t.email}</div>
                        <div className="text-[10px] text-muted-foreground">{t.amount}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">{t.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary px-2 py-1 rounded text-[10px] uppercase font-bold text-muted-foreground">
                          {t.payment_method || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'success' ? 'bg-cyber-green/10 text-cyber-green' : 
                          t.status === 'attempted' ? 'bg-cyber-orange/10 text-cyber-orange' : 
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">Aucune transaction enregistrée</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
      active ? "bg-primary text-black scale-105 shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-card rounded-xl p-6 space-y-4 border border-border/50">
    <h2 className="font-display text-sm font-bold text-primary tracking-wider uppercase">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[10px] font-black text-muted-foreground tracking-widest uppercase ml-1">{label}</label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium"
      />
    </div>
  );
};

export default Admin;
