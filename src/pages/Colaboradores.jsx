// src/pages/Colaboradores.jsx
import React, { useEffect, useState } from "react";
import ColaboradoresTable from "../components/ColaboradoresTable";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { getColaboradores } from "../services/api";

// ⬅️ IMPORTA MSAL CORRETAMENTE
import msalInstance, { loginRequest } from "../auth";

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);

        // Obtém conta ativa
        const account = msalInstance.getAllAccounts()[0];
        if (!account) {
          console.warn("Nenhuma conta MSAL encontrada.");
          return;
        }

        // Garante token válido antes de chamar api.js
        await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        // Chama API que já busca o token interno
        const data = await getColaboradores();
        setColaboradores(data);

      } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">
          Gestão de Colaboradores
        </h1>

        <p className="text-gray-300 mb-6">
          Veja informações sobre os colaboradores.
        </p>

        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : (
          <ColaboradoresTable colaboradores={colaboradores} />
        )}
      </div>

      <ScrollToTopButton />
    </>
  );
}
