import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, WalletCards, Store } from "lucide-react";
import {
  getColaboradores,
  updatePagamentoColaboradoresExcel,
} from "../services/api";

function formatMoeda(v) {
  return (
    "R$ " +
    (Number(v) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

const ordemLojas = [
  "Loja Trevo 1",
  "Loja Trevo 2",
  "Loja Trevo 3",
  "Loja Michael",
];

function groupByLoja(lista) {
  const map = {};
  lista.forEach((c) => {
    const loja = (c.loja && c.loja.toString().trim()) || "Sem loja";
    if (!map[loja]) map[loja] = [];
    map[loja].push(c);
  });

  const keys = Object.keys(map).sort((a, b) => {
    const ia = ordemLojas.indexOf(a);
    const ib = ordemLojas.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return keys.map((loja) => ({ loja, colaboradores: map[loja] }));
}

export default function Pagamentos() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedPendentes, setSelectedPendentes] = useState([]);
  const [selectedPagos, setSelectedPagos] = useState([]);

  const now = new Date();
  const mesKey = now.toISOString().slice(0, 7); // "YYYY-MM"
  const referenceLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(now);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregar() {
    try {
      setLoading(true);
      const data = await getColaboradores();
      setColaboradores(data || []);
    } catch (err) {
      console.error("Erro ao carregar colaboradores (pagamentos):", err);
      alert("Erro ao carregar colaboradores para pagamentos.");
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  const normalize = (text) =>
    text
      ?.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase() || "";

  const { pendentes, pagos } = useMemo(() => {
    const pend = [];
    const pag = [];

    colaboradores.forEach((c) => {
      const status = normalize(c.situacao || c.status);
      if (!status.includes("ativo")) return;

      const ultimo = (c.ultimoPagamento || "").toString().slice(0, 7);
      if (ultimo === mesKey) {
        pag.push(c);
      } else {
        pend.push(c);
      }
    });

    return { pendentes: pend, pagos: pag };
  }, [colaboradores, mesKey]);

  const gruposPendentes = useMemo(
    () => groupByLoja(pendentes),
    [pendentes]
  );
  const gruposPagos = useMemo(() => groupByLoja(pagos), [pagos]);

  useEffect(() => {
    setSelectedPendentes((prev) =>
      prev.filter((id) => pendentes.some((c) => c.id === id))
    );
    setSelectedPagos((prev) =>
      prev.filter((id) => pagos.some((c) => c.id === id))
    );
  }, [pendentes, pagos]);

  const toggleSelecionadoPend = (id) => {
    setSelectedPendentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelecionadoPago = (id) => {
    setSelectedPagos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllPendentes = () => {
    if (selectedPendentes.length === pendentes.length) {
      setSelectedPendentes([]);
    } else {
      setSelectedPendentes(pendentes.map((c) => c.id));
    }
  };

  const handleSelectAllPagos = () => {
    if (selectedPagos.length === pagos.length) {
      setSelectedPagos([]);
    } else {
      setSelectedPagos(pagos.map((c) => c.id));
    }
  };

  const marcarComoPago = async () => {
    if (!selectedPendentes.length || saving) return;

    try {
      setSaving(true);
      await updatePagamentoColaboradoresExcel(selectedPendentes, mesKey);
      await carregar();
      setSelectedPendentes([]);
    } catch (err) {
      console.error("Erro ao marcar pagos:", err);
      alert("Erro ao salvar pagamentos.");
      setSaving(false);
    }
  };

  const desfazerPagamento = async () => {
    if (!selectedPagos.length || saving) return;

    try {
      setSaving(true);
      // passando "" limpa o campo UltimoPagamento
      await updatePagamentoColaboradoresExcel(selectedPagos, "");
      await carregar();
      setSelectedPagos([]);
    } catch (err) {
      console.error("Erro ao desfazer pagamentos:", err);
      alert("Erro ao desfazer pagamentos.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Pagamentos de Salários</h1>
          <p className="text-sm text-gray-400 mt-1">
            Controle dos pagamentos de salário por loja e por colaborador.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-pink-500/40 px-3 py-1 text-xs text-pink-100">
          <WalletCards size={16} />
          <span>Competência: {referenceLabel}</span>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-sm text-slate-300">
            Carregando colaboradores...
          </span>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* PENDENTES */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            {/* Cabeçalho */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-pink-300" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      Pendentes de pagamento
                    </h2>
                    <p className="text-xs text-slate-400">
                      Colaboradores ativos que ainda não foram pagos neste mês.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha de ações no topo */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleSelectAllPendentes}
                  className="text-[11px] text-pink-300 hover:text-pink-100 underline-offset-2 hover:underline"
                >
                  {selectedPendentes.length === pendentes.length
                    ? "Limpar seleção"
                    : "Selecionar todos"}
                </button>

                <button
                  onClick={marcarComoPago}
                  disabled={
                    selectedPendentes.length === 0 ||
                    saving ||
                    gruposPendentes.length === 0
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] sm:text-xs font-medium text-white transition-all ${
                    selectedPendentes.length === 0 || saving
                      ? "bg-slate-700 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 shadow-md shadow-pink-500/40 hover:-translate-y-[1px] active:translate-y-[1px]"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {saving ? "Salvando..." : "Marcar selecionados como pagos"}
                </button>
              </div>
            </div>

            {gruposPendentes.length === 0 ? (
              <p className="mt-4 text-xs text-emerald-300">
                Todos os colaboradores ativos já foram pagos neste mês.
              </p>
            ) : (
              <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {gruposPendentes.map(({ loja, colaboradores }) => (
                  <div
                    key={loja}
                    className="rounded-xl border border-slate-800 bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-100">
                        {loja}
                      </span>
                      <span>
                        {colaboradores.length} colaborador
                        {colaboradores.length > 1 ? "es" : ""}
                      </span>
                    </div>

                    {colaboradores.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-200 border-b last:border-b-0 border-slate-800/70 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-pink-500 focus:ring-pink-500"
                          checked={selectedPendentes.includes(c.id)}
                          onChange={() => toggleSelecionadoPend(c.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {c.nome || "Sem nome"}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {c.cargo || "Cargo não informado"} •{" "}
                            {formatMoeda(c.salario)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PAGOS */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    Já pagos neste mês
                  </h2>
                  <p className="text-xs text-slate-400">
                    Caso tenha marcado alguém por engano, você pode desfazer aqui.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSelectAllPagos}
                className="text-[11px] text-pink-300 hover:text-pink-100 underline-offset-2 hover:underline"
              >
                {selectedPagos.length === pagos.length
                  ? "Limpar seleção"
                  : "Selecionar todos"}
              </button>
            </div>

            {gruposPagos.length === 0 ? (
              <p className="mt-4 text-xs text-slate-400">
                Ainda não há colaboradores marcados como pagos neste mês.
              </p>
            ) : (
              <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {gruposPagos.map(({ loja, colaboradores }) => (
                  <div
                    key={loja}
                    className="rounded-xl border border-slate-800 bg-slate-900/80"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-100">
                        {loja}
                      </span>
                      <span>
                        {colaboradores.length} colaborador
                        {colaboradores.length > 1 ? "es" : ""}
                      </span>
                    </div>

                    {colaboradores.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-3 px-3 py-2 text-xs text-slate-200 border-b last:border-b-0 border-slate-800/70 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-pink-500 focus:ring-pink-500"
                          checked={selectedPagos.includes(c.id)}
                          onChange={() => toggleSelecionadoPago(c.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {c.nome || "Sem nome"}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {c.cargo || "Cargo não informado"} •{" "}
                            {formatMoeda(c.salario)}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={desfazerPagamento}
                disabled={selectedPagos.length === 0 || saving}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] sm:text-xs font-medium text-white transition-all ${
                  selectedPagos.length === 0 || saving
                    ? "bg-slate-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-slate-600 to-slate-500 shadow-md shadow-slate-600/40 hover:-translate-y-[1px] active:translate-y-[1px]"
                }`}
              >
                <RotateCcw size={16} />
                {saving ? "Desfazendo..." : "Desfazer pagamento selecionado"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
