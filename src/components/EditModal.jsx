import React, { useState } from "react";
import { updateColaborador } from "../services/api";
import { X, Save, Loader2 } from "lucide-react";

export default function EditModal({ colaborador, onClose, token, setColaboradores }) {
  const [form, setForm] = useState(colaborador);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { rowIndex, ...data } = form;
      await updateColaborador(rowIndex, data, token);
      setColaboradores((prev) =>
        prev.map((c) => (c.rowIndex === rowIndex ? { ...form } : c))
      );
      onClose();
    } catch (err) {
      setError("Erro ao salvar alterações. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl my-8 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Editar Colaborador</h2>
            <p className="text-sm text-gray-400 mt-1">Atualize as informações do colaborador</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(form)
              .filter(([key]) => key !== "rowIndex")
              .map(([key, val]) => (
                <div key={key} className={key === "Nome" || key === "Email" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {key}
                  </label>
                  {key === "Status" ? (
                    <select
                      value={val}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Desligado">Demitido</option>
                    </select>
                  ) : (
                    <input
                      type={key === "Salario" || key === "MesesNaEmpresa" ? "number" : "text"}
                      value={val}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder-gray-500"
                      placeholder={`Digite ${key.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        @keyframes in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}