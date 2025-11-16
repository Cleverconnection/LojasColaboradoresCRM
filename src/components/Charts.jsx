import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";

const COLORS = ["#ec4899", "#fb7185", "#f97316", "#22c55e", "#38bdf8", "#a855f7"];

export default function Charts({ colaboradores }) {
  // --- COLABORADORES / SALÁRIO POR LOJA (ignora lojas vazias) ---
  const porLojaMap = new Map();

  (colaboradores || []).forEach((c) => {
    const rawLoja = c.loja ? c.loja.toString().trim() : "";
    if (!rawLoja) return; // ignora linhas sem loja

    const loja = rawLoja;
    const atual = porLojaMap.get(loja) || {
      loja,
      colaboradores: 0,
      salarioTotal: 0,
    };

    atual.colaboradores += 1;
    atual.salarioTotal += Number(c.salario) || 0;
    porLojaMap.set(loja, atual);
  });

  const ordemLojas = ["Loja Trevo 1", "Loja Trevo 2", "Loja Trevo 3", "Loja Michael"];

  const porLoja = Array.from(porLojaMap.values()).sort((a, b) => {
    const ia = ordemLojas.indexOf(a.loja);
    const ib = ordemLojas.indexOf(b.loja);

    if (ia === -1 && ib === -1) return a.loja.localeCompare(b.loja);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const salarioPorLoja = porLoja.map((l) => ({
    name: l.loja,
    value: l.salarioTotal,
  }));

  // --- SITUAÇÃO DOS COLABORADORES ---
  const porSituacaoMap = new Map();
  (colaboradores || []).forEach((c) => {
    const sitRaw = c.situacao || c.status || "Sem situação";
    const sit =
      sitRaw.toString().trim() === "" ? "Sem situação" : sitRaw.toString();
    const atual = porSituacaoMap.get(sit) || { name: sit, value: 0 };
    atual.value += 1;
    porSituacaoMap.set(sit, atual);
  });
  const porSituacao = Array.from(porSituacaoMap.values());

  const formatMoeda = (v) =>
    "R$ " +
    (Number(v) || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 1. Colaboradores por Loja */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-950/40">
        <h2 className="text-slate-50 text-lg font-semibold mb-1">
          Colaboradores por Loja
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Quantidade de colaboradores cadastrados em cada loja.
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porLoja}>
              <XAxis
                dataKey="loja"
                interval={0}
                tick={{ fill: "#e5e7eb", fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "#e5e7eb", fontSize: 11 }}
                stroke="#9ca3af"
                domain={[0, 14]} // eixo 0–14 fixo
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#e5e7eb" }}
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "rgba(15,23,42,0.85)" }}
              />
              <Bar dataKey="colaboradores" radius={[6, 6, 0, 0]}>
                {porLoja.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.9}
                  />
                ))}
                <LabelList
                  dataKey="colaboradores"
                  position="top"
                  fill="#e5e7eb"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Situação dos Colaboradores */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-950/40">
        <h2 className="text-slate-50 text-lg font-semibold mb-1">
          Situação dos Colaboradores
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Distribuição por situação (ativo, demitido, etc.).
        </p>

        <div className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={porSituacao}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {porSituacao.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.9}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#e5e7eb" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                formatter={(value) => (
                  <span className="text-xs text-slate-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Salário total por Loja (barra) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-950/40">
        <h2 className="text-slate-50 text-lg font-semibold mb-1">
          Salário Total por Loja
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Soma dos salários dos colaboradores em cada loja.
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porLoja}>
              <XAxis
                dataKey="loja"
                interval={0}
                tick={{ fill: "#e5e7eb", fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                tick={{ fill: "#e5e7eb", fontSize: 11 }}
                stroke="#9ca3af"
                domain={[0, 20000]} // eixo de 0 a 20k
                tickFormatter={(v) =>
                  (v / 1000).toLocaleString("pt-BR", {
                    maximumFractionDigits: 0,
                  }) + "k"
                }
              />
              <Tooltip
                formatter={(value) => [formatMoeda(value), "Salário total"]}
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#e5e7eb" }}
                wrapperStyle={{ outline: "none" }}
                cursor={{ fill: "rgba(15,23,42,0.85)" }}
              />
              <Bar dataKey="salarioTotal" radius={[6, 6, 0, 0]}>
                {porLoja.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.9}
                  />
                ))}
                <LabelList
                  dataKey="salarioTotal"
                  position="top"
                  formatter={formatMoeda}
                  fill="#e5e7eb"
                  fontSize={10}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Distribuição de Salário por Loja (pizza) */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 shadow-md shadow-slate-950/40">
        <h2 className="text-slate-50 text-lg font-semibold mb-1">
          Distribuição de Salário por Loja
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Percentual do total de salários que cada loja representa.
        </p>

        <div className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={salarioPorLoja}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {salarioPorLoja.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    opacity={0.9}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _, item) => [
                  formatMoeda(value),
                  item?.name || "Loja",
                ]}
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  color: "#e5e7eb",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#e5e7eb" }}
                itemStyle={{ color: "#e5e7eb" }}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend
                verticalAlign="bottom"
                height={60}
                formatter={(value) => (
                  <span className="text-xs text-slate-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
