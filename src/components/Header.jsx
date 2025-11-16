import React from "react";
import { LogOut, User } from "lucide-react";
import { useMsal } from "@azure/msal-react";

export default function Header({ account }) {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      mainWindowRedirectUri:
        window.location.hostname === "localhost"
          ? "http://localhost:5174/LojasColaboradoresCRM/"
          : "https://cleverconnection.github.io/LojasColaboradoresCRM/",
    });
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur border-b border-slate-800 bg-slate-950/80">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-50">
            Painel de Colaboradores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Visão geral das equipes das Lojas Mercado
          </p>
        </div>

        <div className="flex items-center gap-3">
          {account && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-100 truncate max-w-[180px]">
                  {account.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  {account.username}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-pink-500/40 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
