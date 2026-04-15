import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: "0.0.0.0", // listen on all interfaces
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
      host: "process-ebony-capacity-dean.trycloudflare.com",
    },
    // For older Vite versions to allow specific host
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "framer-motion"],
        },
      },
    },
  },
});
