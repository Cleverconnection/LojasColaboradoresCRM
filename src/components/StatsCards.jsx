import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  TrendingUp,
  Store,
} from "lucide-react";

export default function StatsCards({ colaboradores }) {
  const normalize = (v) =>
    v?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const colaboradoresUnicos = Array.from(
    new Map(colaboradores.map((c) => [c.id ?? c.nome, c])).values()
  );

  const total = colaboradoresUnicos.length;

  const ativos = colaboradoresUnicos.filter((c) => {
    const sit = normalize(c.situacao || c.status);
    const desligado =
      sit?.includes("demit") || sit?.includes("deslig") || !!c.dataDesligamento;
    return !desligado;
  });

  const demitidos = colaboradoresUnicos.filter(
    (c) =>
      normalize(c.situacao || c.status)?.includes("demit") ||
      normalize(c.situacao || c.status)?.includes("deslig") ||
      !!c.dataDesligamento
  );

  const lojas = Array.from(
    new Set(
      colaboradoresUnicos
        .map((c) => c.loja)
        .filter((l) => l && l.toString().trim() !== "")
    )
  );

  const mediaSalarioAtivos =
    ativos.reduce((acc, c) => acc + (Number(c.salario) || 0), 0) /
      (ativos.length || 1) || 0;

  const taxaRetencao =
    total === 0 ? 0 : Math.round((ativos.length / total) * 100);

  const mediaMeses =
    ativos.reduce((acc, c) => acc + (Number(c.mesesNaEmpresa) || 0), 0) /
      (ativos.length || 1) || 0;

  const cards = [
    {
      title: "Total de Colaboradores",
      value: total,
      subtitle: "Em todas as lojas",
      icon: Users,
    },
    {
      title: "Ativos",
      value: ativos.length,
      subtitle: "Colaboradores em atividade",
      icon: UserCheck,
    },
    {
      title: "Demitidos / Desligados",
      value: demitidos.length,
      subtitle: "Histórico de desligamentos",
      icon: UserX,
    },
    {
      title: "Média Salarial (Ativos)",
      value:
        "R$ " +
        mediaSalarioAtivos.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      subtitle: "Baseado nos salários da planilha",
      icon: DollarSign,
    },
    {
      title: "Taxa de Retenção",
      value: `${taxaRetencao.toFixed(0)}%`,
      subtitle: "Proporção de colaboradores ativos",
      icon: TrendingUp,
    },
    {
      title: "Lojas Cadastradas",
      value: lojas.length,
      subtitle: "Lojas distintas na coluna Loja",
      icon: Store,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-md shadow-slate-950/50 hover:border-pink-500/80 hover:shadow-pink-500/40 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="relative p-4 sm:p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-50">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40">
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
