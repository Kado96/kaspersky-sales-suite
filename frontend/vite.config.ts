import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
        
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          return res.end();
        }

        const configPath = path.resolve(__dirname, "../server/config.json");

        if (req.url === "/api/config" || req.url === "/config") {
          if (req.method === "GET") {
            try {
              if (fs.existsSync(configPath)) {
                const data = fs.readFileSync(configPath, "utf-8");
                res.setHeader("Content-Type", "application/json");
                return res.end(data);
              }
            } catch (e) {}
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ status: "ok" }));
          }

          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => {
              try {
                fs.writeFileSync(configPath, body, "utf-8");
              } catch (e) {}
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ success: true, message: "Configuration enregistrée" }));
            });
            return;
          }
        }

        if (req.url === "/api/health" || req.url === "/health") {
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify({ status: "ok", message: "Dev API Active" }));
        }

        if ((req.url === "/api/payment/initiate" || req.url === "/payment/initiate") && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => { body += chunk; });
          req.on("end", () => {
            const clientToken = `TXN_${Date.now()}`;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              success: true,
              transactionId: clientToken,
              redirectUrl: "https://www.afripay.africa/checkout/index.php",
              checkoutFormData: {
                amount: "20000",
                currency: "BIF",
                client_token: clientToken,
                comment: "Achat Kaspersky"
              }
            }));
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    apiDevPlugin(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
