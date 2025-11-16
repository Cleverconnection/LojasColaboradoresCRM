import React, { useEffect, useState } from "react";
import StatsCards from "../components/StatsCards";
import Charts from "../components/Charts";
import ColaboradoresTable from "../components/ColaboradoresTable";
import ExportButtons from "../components/ExportButtons";
import ScrollToTopButton from "../components/ScrollToTopButton";
import SalaryReminder from "../components/SalaryReminder";
import { getColaboradores } from "../services/api";
import msalInstance, { loginRequest } from "../auth";

export default function Dashboard({ account }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!account) return;

      try {
        setLoading(true);
        setError(null);

        const result = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        const data = await getColaboradores(result.accessToken);
        setColaboradores(data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Não foi possível carregar os dados dos colaboradores.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [account]);

  return (
    <>
      <div className="space-y-12 scroll-smooth relative">
        <section id="dashboard">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Dashboard</h2>
              <p className="text-sm text-gray-400 mt-1">
                Visão geral dos colaboradores das lojas.
              </p>
            </div>
          </div>

          {/* Lembrete de pagamento de salário */}
          <SalaryReminder colaboradores={colaboradores} />

          {/* Mensagem de erro (se houver) */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-xs text-red-100">
              {error}
            </div>
          )}

          {/* Cards principais */}
          {loading ? (
            <div className="mt-6 text-sm text-gray-400">Carregando dados...</div>
          ) : (
            <StatsCards colaboradores={colaboradores} />
          )}
        </section>

        <section id="evolucao-salarial">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Evolução Salarial
          </h2>
          {!loading && (
            <Charts colaboradores={colaboradores} />
          )}
        </section>

        <section id="colaboradores">
          {!loading && (
            <ColaboradoresTable colaboradores={colaboradores} />
          )}
        </section>

        <section id="relatorios">
          <div className="pt-6 border-t border-slate-700 mt-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Relatórios
            </h2>
            <p className="text-gray-400 mb-4 text-sm">
              Gere relatórios completos de colaboradores em PDF ou Excel.
            </p>
            {!loading && (
              <ExportButtons colaboradores={colaboradores} />
            )}
          </div>
        </section>
      </div>

      <ScrollToTopButton />
    </>
  );
}
