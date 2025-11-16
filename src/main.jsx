// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";

import msalInstance from "./auth";

async function start() {
  try {
    await msalInstance.initialize();
  } catch (e) {
    console.error("Erro ao inicializar o MSAL:", e);
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter basename="/LojasColaboradoresCRM">
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

start();
