import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { updatePagamentoColaboradoresExcel } from "../services/api";

function formatMoeda(v) {
  return (
    "R$ " +
    (Number(v) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function SalaryReminder({ colaboradores = [] }) {
  const [visible, setVisible] = useState(false);
  const [referenceLabel, setReferenceLabel] = useState("");
  const [pending, setPending] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [mesRefKey, setMesRefKey] = useState(""); // "YYYY-MM"
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1–12
    const day = now.getDate();

    const monthStr = String(month).padStart(2, "0");
    const mesKey = `${year}-${monthStr}`;
    setMesRefKey(mesKey);

    setReferenceLabel(
      new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(now)
    );

    // Filtrar ativos
    const ativos = (colaboradores || []).filter((c) => {
      const statusRaw = (c.situacao || c.status || "").toString().toLowerCase();
      return statusRaw.includes("ativo");
    });

    // Pendentes = UltimoPagamento vazio ou diferente do mês atual
    const pendentes = ativos.filter((c) => {
      const ultimo = (c.ultimoPagamento || "").toString().slice(0, 7); // "YYYY-MM..."
      return ultimo !== mesKey;
    });

    setPending(
      pendentes.map((c, index) => ({
        ...c,
        _salaryId: String(c.id ?? c.cpf ?? `${c.nome ?? "sem-nome"}-${index}`),
      }))
    );
    setSelectedIds([]);

    // produção: day >= 30; pra teste você pode usar >= 16
    const isPayDayWindow = day >= 16;
    setVisible(isPayDayWindow && pendentes.length > 0);
  }, [colaboradores]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pending.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pending.map((c) => c._salaryId));
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedIds.length === 0 || !mesRefKey) return;

    setSaving(true);
    try {
      // usamos o ID da planilha (coluna ID numérica)
      const idsPlanilha = pending
        .filter((c) => selectedIds.includes(c._salaryId))
        .map((c) => c.id);

      await updatePagamentoColaboradoresExcel(idsPlanilha, mesRefKey);

      const remaining = pending.filter(
        (c) => !selectedIds.includes(c._salaryId)
      );
      setPending(remaining);
      setSelectedIds([]);

      if (remaining.length === 0) {
        setVisible(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar pagamento na planilha:", error);
      alert("Falha ao marcar pagamento na planilha. Verifique o console.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  // Agrupar por loja
  const groupsMap = pending.reduce((acc, c) => {
    const loja = (c.loja && c.loja.toString().trim()) || "Sem loja";
    if (!acc[loja]) acc[loja] = [];
    acc[loja].push(c);
    return acc;
  }, {});

  const ordemLojas = ["Loja Trevo 1", "Loja Trevo 2", "Loja Trevo 3", "Loja Michael"];

  const orderedStores = Object.keys(groupsMap).sort((a, b) => {
    const ia = ordemLojas.indexOf(a);
    const ib = ordemLojas.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div className="mt-4 mb-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-pink-500/60 bg-slate-950/90 shadow-lg shadow-pink-500/30 px-4 py-3 sm:px-5 sm:py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl 
                bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500
                text-slate-900 shrink-0 shadow-lg shadow-amber-400/60">
              <Bell size={18} />
            </div>



            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-50">
                Lembrete de Pagamento de Salário
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Hoje é período de pagamento (a partir do dia 30). Selecione os
                colaboradores que já receberam o salário para removê-los da lista
                deste mês.
              </p>
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-pink-500/40 bg-pink-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-pink-200"
          >
            <Clock size={12} />
            <span className="ml-1">{referenceLabel}</span>
            {expanded ? (
              <ChevronUp size={12} className="ml-1" />
            ) : (
              <ChevronDown size={12} className="ml-1" />
            )}
          </button>
        </div>

        {expanded && (
          <>
            {pending.length > 0 ? (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-950/80">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 text-[11px] text-slate-300">
                  <span>
                    {pending.length} colaborador
                    {pending.length > 1 ? "es" : ""} ativos pendentes de pagamento.
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] text-pink-300 hover:text-pink-200 underline-offset-2 hover:underline"
                  >
                    {selectedIds.length === pending.length
                      ? "Limpar seleção"
                      : "Selecionar todos"}
                  </button>
                </div>

                {orderedStores.map((loja) => {
                  const list = groupsMap[loja];
                  return (
                    <div key={loja}>
                      <div className="px-3 py-1 bg-slate-900/80 border-b border-slate-800/80 text-[11px] font-semibold text-slate-200">
                        {loja} • {list.length} colaborador
                        {list.length > 1 ? "es" : ""} pendentes
                      </div>

                      {list.map((c) => (
                        <label
                          key={c._salaryId}
                          className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 border-slate-800/60 text-xs text-slate-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-pink-500 focus:ring-pink-500"
                            checked={selectedIds.includes(c._salaryId)}
                            onChange={() => toggleSelect(c._salaryId)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{c.nome}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {c.cargo || "Cargo não informado"} •{" "}
                              {formatMoeda(c.salario)}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-emerald-300">
                Todos os colaboradores ativos já foram marcados como pagos neste
                mês.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleMarkAsPaid}
                disabled={selectedIds.length === 0 || saving}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-md transition-all ${
                  selectedIds.length === 0 || saving
                    ? "bg-slate-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/40 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-[1px]"
                }`}
              >
                <CheckCircle size={16} />
                {saving ? "Salvando..." : "Já paguei selecionados"}
              </button>

              <button
                onClick={handleClose}
                className="text-[11px] sm:text-xs text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
              >
                Fechar (lembrar na próxima abertura)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
