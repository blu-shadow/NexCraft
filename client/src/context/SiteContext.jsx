// ═══════════════════════════════════════════════════════════
//                   SITE CONTEXT
//     Global Site Config — Logo, Name, Social, etc.
// ═══════════════════════════════════════════════════════════
import { createContext, useState, useEffect, useCallback } from "react";
import API from "../services/authService";
import axios from "axios";

export const SiteContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SiteProvider = ({ children }) => {
  const [config,  setConfig ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);

  // ─────────────────────────────────────────
  //   Fetch site config on app mount
  // ─────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/site-config`);
      if (res.data?.config) {
        setConfig(res.data.config);
        // Apply dynamic site name to document title
        if (res.data.config.branding?.siteName) {
          document.title = res.data.config.branding.siteName;
        }
        // Apply primary color CSS variable dynamically
        if (res.data.config.branding?.primaryColor) {
          document.documentElement.style.setProperty(
            "--clr-primary",
            res.data.config.branding.primaryColor
          );
        }
      }
    } catch (err) {
      setError("Failed to load site configuration");
      // Use default fallback values
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ─────────────────────────────────────────
  //   Update config in state (after admin edit)
  // ─────────────────────────────────────────
  const refreshConfig = useCallback(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfigLocally = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // ─────────────────────────────────────────
  //   Shortcut Getters
  // ─────────────────────────────────────────
  const siteName    = config?.branding?.siteName    || "1000 Din";
  const logoUrl     = config?.branding?.logo?.url   || null;
  const primaryColor= config?.branding?.primaryColor|| "#6c63ff";
  const social      = config?.social                || {};
  const contact     = config?.contact               || {};
  const seo         = config?.seo                   || {};
  const maintenance = config?.maintenance           || { isEnabled: false };
  const isUnderMaintenance = maintenance.isEnabled;

  // ─────────────────────────────────────────
  //   Context Value
  // ─────────────────────────────────────────
  const value = {
    config,
    loading,
    error,
    // Shortcuts
    siteName,
    logoUrl,
    primaryColor,
    social,
    contact,
    seo,
    maintenance,
    isUnderMaintenance,
    // Actions
    refreshConfig,
    updateConfigLocally,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

// ─────────────────────────────────────────
//   Default Fallback Config (if API fails)
// ─────────────────────────────────────────
const defaultConfig = {
  branding: {
    siteName      : "1000 Din",
    tagline       : "Building the future, one day at a time",
    logo          : { url: "" },
    primaryColor  : "#6c63ff",
    secondaryColor: "#7c3aed",
  },
  social  : {},
  contact : {},
  seo     : { metaTitle: "1000 Din — Web & Tech Services" },
  maintenance: { isEnabled: false },
};
