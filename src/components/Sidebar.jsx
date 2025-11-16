import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { BarChart3, Users, FileText, Menu, X, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: BarChart3, path: "/" },
    { name: "Colaboradores", icon: Users, path: "/colaboradores" },
    { name: "Pagamentos de Salários", icon: CreditCard, path: "/pagamentos" },
    { name: "Relatórios", icon: FileText, path: "/relatorios" },
  ];

  return (
    <>
      {/* Botão mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[1001] p-2 rounded-lg bg-slate-900/90 border border-slate-700 text-gray-300 hover:bg-slate-700 transition-colors"
      >
        {isOpen ? <X size={22} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[1000]
          w-72 flex flex-col border-r border-slate-700/50 
          bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617]
          shadow-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / título */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/60">
          <div className="h-11 w-11 rounded-2xl bg-pink-500/10 border border-pink-500/40 flex items-center justify-center overflow-hidden">
            <img
              src={logo}
              alt="Lojas Mercado"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-pink-300 uppercase">
              Lojas Mercado
            </span>
            <span className="text-sm text-slate-300">
              Painel de colaboradores
            </span>
          </div>
        </div>

        {/* Menu principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                  ${
                    active
                      ? "bg-pink-500/15 border border-pink-500/60 text-pink-100 shadow-sm shadow-pink-500/40"
                      : "text-slate-300 border border-transparent hover:border-pink-500/30 hover:bg-slate-800/70"
                  }
                `}
              >
                <div
                  className={`h-8 w-8 flex items-center justify-center rounded-lg
                    ${
                      active
                        ? "bg-pink-500/30"
                        : "bg-slate-800/80 text-slate-300"
                    }
                  `}
                >
                  <Icon size={18} />
                </div>
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-xl p-3">
            <p className="text-[11px] text-slate-400 mb-1">Status do sistema</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-300">
                Operacional
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800/60">
          <p className="text-[11px] text-center text-slate-500">
            © 2025 Clever Connection
          </p>
          <p className="text-[11px] text-center text-slate-600 mt-1">
            Versão 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
