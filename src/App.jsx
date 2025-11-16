import { Routes, Route } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";

import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Relatorios from "./pages/Relatorios";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Pagamentos from "./pages/Pagamentos";


import { loginRequest } from "./auth";

export default function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  const user = accounts[0] || null;

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error("Erro ao fazer login:", e);
    }
  };

  // Tela de login (já responsiva)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl">
              LM
            </div>
            <div>
              <h1 className="text-xl font-semibold">Lojas Mercado • CRM</h1>
              <p className="text-xs text-slate-400 mt-1">
                Faça login com sua conta Microsoft para acessar o painel de
                colaboradores das lojas.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-sm font-medium text-white shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 transition-all hover:-translate-y-[1px] active:translate-y-[1px]"
          >
            Entrar com Microsoft
          </button>

          <p className="mt-4 text-[11px] text-slate-500 text-center">
            Seus dados de acesso são usados apenas para autenticação via
            Microsoft. Nenhuma senha é armazenada no sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar: drawer no mobile, fixa no desktop */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header account={user} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
          <Routes>
            <Route path="/" element={<Dashboard account={user} />} />
            <Route path="/colaboradores" element={<Colaboradores account={user} />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/relatorios" element={<Relatorios account={user} />} />
          </Routes>

        </main>
      </div>
    </div>
  );
}
