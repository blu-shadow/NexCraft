// ═══════════════════════════════════════════════════════════
//                    MAIN.JSX — ENTRY POINT
// ═══════════════════════════════════════════════════════════
import React         from "react";
import ReactDOM      from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App           from "./App";
import { AuthProvider }   from "./context/AuthContext";
import { ThemeProvider }  from "./context/ThemeContext";
import { SiteProvider }   from "./context/SiteContext";

import "./styles/globals.css";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Theme must wrap everything */}
      <ThemeProvider>
        {/* Site config (logo, siteName etc.) */}
        <SiteProvider>
          {/* Auth state */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </SiteProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
