import React, { useEffect, useState } from "react";
import Charts from "../components/Charts";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ExportButtons from "../components/ExportButtons";
import { getColaboradores } from "../services/api";

export default function Relatorios() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        // importante para não dar erro 401
        const dados = await getColaboradores(true);
        setColaboradores(Array.isArray(dados) ? dados : []);
      } catch (erro) {
        console.error("Erro ao carregar colaboradores:", erro);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">
          Relatórios e Indicadores
        </h1>

        <p className="text-gray-300 mb-6">
          Visualize métricas detalhadas de desempenho e evolução dos colaboradores.
        </p>

        {/* Botões de exportação — aparecem mesmo sem gráficos */}
        <div className="mb-6">
          <ExportButtons colaboradores={colaboradores} />
        </div>

        {/* Estado de carregamento */}
        {loading && (
          <p className="text-gray-400 text-lg">Carregando dados...</p>
        )}

        {/* Renderização dos gráficos */}
        {!loading && colaboradores.length > 0 && (
          <Charts colaboradores={colaboradores} />
        )}
      </div>

      <ScrollToTopButton />
    </>
  );
}
