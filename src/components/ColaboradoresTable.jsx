import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

export default function ColaboradoresTable({ colaboradores }) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState({ campo: "nome", direcao: "asc" });
  const [visibleCount, setVisibleCount] = useState(5);

  const handleSort = (campo) => {
    setOrdem((atual) => {
      if (atual.campo === campo) {
        return {
          campo,
          direcao: atual.direcao === "asc" ? "desc" : "asc",
        };
      }
      return { campo, direcao: "asc" };
    });
  };

  const dados = useMemo(() => {
    let lista = [...colaboradores];

    if (busca.trim() !== "") {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.nome?.toLowerCase().includes(termo) ||
          c.cpf?.toString().toLowerCase().includes(termo) ||
          c.loja?.toString().toLowerCase().includes(termo) ||
          c.cargo?.toString().toLowerCase().includes(termo)
      );
    }

    lista.sort((a, b) => {
      const campo = ordem.campo;
      const dir = ordem.direcao === "asc" ? 1 : -1;

      const va = (a[campo] ?? "").toString().toLowerCase();
      const vb = (b[campo] ?? "").toString().toLowerCase();

      if (!va && vb) return 1 * dir;
      if (va && !vb) return -1 * dir;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return lista;
  }, [colaboradores, busca, ordem]);

  const visiveis = useMemo(
    () => dados.slice(0, visibleCount),
    [dados, visibleCount]
  );

  const headerCell = (label, campo) => (
    <th
      onClick={() => handleSort(campo)}
      className="px-3 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wide cursor-pointer select-none"
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {ordem.campo === campo ? (
          ordem.direcao === "asc" ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : null}
      </div>
    </th>
  );

  const formatCurrency = (v) =>
    "R$ " +
    (Number(v) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString("pt-BR");
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Lista de Colaboradores
          </h2>
          <p className="text-xs text-slate-400">
            Todas as colunas da planilha: dados pessoais, loja, situação e
            salários.
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF, loja..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner shadow-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80">
            <tr>
              {headerCell("ID", "id")}
              {headerCell("Nome", "nome")}
              {headerCell("CPF", "cpf")}
              {headerCell("Cargo", "cargo")}
              {headerCell("Loja", "loja")}
              {headerCell("Conta", "conta")}
              {headerCell("Situação", "situacao")}
              {headerCell("Admissão", "dataAdmissao")}
              {headerCell("Desligamento", "dataDesligamento")}
              {headerCell("Salário", "salario")}
              {headerCell("Meses", "mesesNaEmpresa")}
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-6 text-center text-slate-400 text-xs"
                >
                  Nenhum colaborador encontrado com os filtros atuais.
                </td>
              </tr>
            )}

            {visiveis.map((c, index) => (
              <tr
                key={c.id ?? `${c.nome}-${index}`}
                className={`border-t border-slate-800/80 ${
                  index % 2 === 0 ? "bg-slate-950" : "bg-slate-900/60"
                }`}
              >
                <td className="px-3 py-2 text-slate-300">{c.id}</td>
                <td className="px-3 py-2 text-slate-100 font-medium whitespace-nowrap">
                  {c.nome}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {c.cpf}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {c.cargo}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {c.loja}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {c.conta}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {c.situacao || c.status}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {formatDate(c.dataAdmissao)}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {formatDate(c.dataDesligamento)}
                </td>
                <td className="px-3 py-2 text-slate-300 whitespace-nowrap">
                  {formatCurrency(c.salario)}
                </td>
                <td className="px-3 py-2 text-slate-300 text-center">
                  {c.mesesNaEmpresa ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dados.length > visiveis.length && (
          <div className="flex justify-center py-4 border-t border-slate-800 bg-slate-950">
            <button
              onClick={() =>
                setVisibleCount((prev) => Math.min(prev + 10, dados.length))
              }
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-medium shadow-md shadow-pink-500/40 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-[1px] transition-all"
            >
              Listar mais (
              {Math.min(visibleCount + 10, dados.length) - visibleCount})
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
