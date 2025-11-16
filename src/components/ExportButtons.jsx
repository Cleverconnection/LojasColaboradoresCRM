import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function ExportButtons({ colaboradores }) {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "-";

  const formatMoney = (v) =>
    v
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  // 📤 Exportar para Excel
  const exportToExcel = () => {
    const data = colaboradores.map((c) => ({
      ID: c.id,
      Nome: c.nome,
      Cargo: c.cargo,
      "Data Admissão": formatDate(c.dataAdmissao),
      "Data Pagamento": formatDate(c.dataPagamento),
      "Salário Combinado": formatMoney(c.salario),
      "Valor a Pagar": formatMoney(c.valorPagar),
      Modo: c.modo,
      Situação: c.situacao,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Colaboradores");
    XLSX.writeFile(workbook, "colaboradores.xlsx");
  };

  // 📄 Exportar PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "ID",
      "Nome",
      "Cargo",
      "Data Admissão",
      "Data Pagamento",
      "Salário",
      "Valor a Pagar",
      "Modo",
      "Situação",
    ];

    const tableRows = colaboradores.map((c) => [
      c.id,
      c.nome,
      c.cargo,
      formatDate(c.dataAdmissao),
      formatDate(c.dataPagamento),
      formatMoney(c.salario),
      formatMoney(c.valorPagar),
      c.modo,
      c.situacao,
    ]);

    doc.setFontSize(13);
    doc.text("Relatório de Colaboradores", 14, 15);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save("colaboradores.pdf");
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition text-white shadow"
      >
        <FileSpreadsheet size={18} />
        Exportar Excel
      </button>

      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white shadow"
      >
        <FileText size={18} />
        Exportar PDF
      </button>
    </div>
  );
}
