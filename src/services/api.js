// src/services/api.js
import axios from "axios";
import msalInstance, { loginRequest } from "../auth";

// ID da planilha "Controle Mercados.xlsx" no seu OneDrive (conta allyson.bastos@cleverconnection.com.br)
const fileId = "01FWWAKIRDDN4UH7S4DJC3XOKSOURRLQGA";

// Nome EXATO da aba da planilha
const sheetName = "Planilha1"; // se for outro nome, só trocar aqui

async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  const request = {
    ...loginRequest,
    account: accounts[0],
  };

  try {
    const result = await msalInstance.acquireTokenSilent(request);
    return result.accessToken;
  } catch (err) {
    console.warn("Token silencioso falhou, tentando popup:", err);
    const result = await msalInstance.acquireTokenPopup(request);
    return result.accessToken;
  }
}

export async function getColaboradores() {
  const token = await getAccessToken();
  if (!token) {
    console.error("Nenhum token encontrado.");
    return [];
  }

  try {
    // usando diretamente o arquivo do seu OneDrive
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets('${sheetName}')/usedRange(valuesOnly=true)`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const header = rows[0];
    const data = rows.slice(1);

    // índices importantes
    const idxUltimoPagamento = header.indexOf("UltimoPagamento");

    const colaboradores = data.map((row) => {
      const obj = {};

      // monta objeto chave/valor com base no cabeçalho da planilha
      header.forEach((columnName, colIndex) => {
        obj[columnName] = row[colIndex] ?? "";
      });

      const dataAdmissaoRaw =
        obj["DataAdmissão"] || obj["Data Admissão"] || obj["Data Admiss�o"];
      const dataDesligamentoRaw =
        obj["DataDesligamento"] || obj["Data Desligamento"];

      const dataAdmissao = convertExcelDate(dataAdmissaoRaw);
      const dataDesligamento = convertExcelDate(dataDesligamentoRaw);

      const mesesNaEmpresa = calcularMesesNaEmpresa(
        dataAdmissao,
        dataDesligamento
      );

      const situacao = obj["Situação"] || obj["Status"];

      const ultimoPagamento =
        idxUltimoPagamento >= 0 ? row[idxUltimoPagamento] || "" : "";

      return {
        id: obj["ID"],
        nome: obj["Nome"],
        cpf: obj["CPF"],
        cargo: obj["Cargo"],
        dataAdmissao,
        dataDesligamento,
        salario: parseCurrency(obj["Salário"] || obj["Sal�rio"]),

        // compatibilidade com o CRM antigo
        valorPagar: parseCurrency(
          obj["Valor a Pagar"] || obj["Salário"] || obj["Sal�rio"]
        ),
        modo: obj["Modo"] || "",

        mesesNaEmpresa,
        status: situacao,
        situacao,

        // campos específicos das lojas
        loja: obj["Loja"],
        conta: obj["Conta"],

        // controle de pagamento de salário
        ultimoPagamento,
      };
    });

    return colaboradores;
  } catch (err) {
    console.error("Erro ao buscar colaboradores (lojas):", err);
    return [];
  }
}

function convertExcelDate(serial) {
  if (!serial) return "";

  if (typeof serial === "string") {
    const parts = serial.split("/");
    if (parts.length === 3) {
      const [dia, mes, ano] = parts;
      const date = new Date(Number(ano), Number(mes) - 1, Number(dia));
      return isNaN(date) ? "" : date.toISOString().split("T")[0];
    }
    return serial;
  }

  const date = new Date((serial - 25569) * 86400 * 1000);
  return date.toISOString().split("T")[0];
}

function calcularMesesNaEmpresa(dataAdmissaoStr, dataDesligamentoStr) {
  if (!dataAdmissaoStr) return 0;

  const inicio = new Date(dataAdmissaoStr);
  if (isNaN(inicio)) return 0;

  const fim = dataDesligamentoStr ? new Date(dataDesligamentoStr) : new Date();
  if (isNaN(fim)) return 0;

  let meses = (fim.getFullYear() - inicio.getFullYear()) * 12;
  meses += fim.getMonth() - inicio.getMonth();

  return meses < 0 ? 0 : meses;
}

function parseCurrency(value) {
  if (!value) return 0;
  if (typeof value === "number") return value;

  return Number(
    value
      .toString()
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

// Converte índice da coluna (1,2,3...) para letra do Excel (A,B,C..., AA, AB...)
function columnNumberToLetter(col) {
  let temp = "";
  while (col > 0) {
    let remainder = (col - 1) % 26;
    temp = String.fromCharCode(65 + remainder) + temp;
    col = Math.floor((col - 1) / 26);
  }
  return temp;
}

/**
 * Atualiza a coluna "UltimoPagamento" na planilha
 * colaboradorIds: array de IDs (coluna "ID" da planilha)
 * mesRef: string "YYYY-MM", ex: "2025-11"
 */
export async function updatePagamentoColaboradoresExcel(
  colaboradorIds,
  mesRef
) {
  if (!Array.isArray(colaboradorIds) || colaboradorIds.length === 0) return;

  const token = await getAccessToken();
  if (!token) {
    throw new Error("Nenhum token encontrado para atualizar pagamento.");
  }

  const headersReq = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1) Ler novamente o usedRange para descobrir:
  //    - índice da coluna ID
  //    - índice da coluna UltimoPagamento
  //    - em qual linha está cada ID
  const metaUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets('${sheetName}')/usedRange(valuesOnly=true)`;
  const metaResp = await axios.get(metaUrl, { headers: headersReq });

  const rows = metaResp.data.values || [];
  if (!rows.length) return;

  const header = rows[0];
  const idxId = header.indexOf("ID");
  const idxUltimoPagamento = header.indexOf("UltimoPagamento");

  if (idxId === -1 || idxUltimoPagamento === -1) {
    console.warn(
      "Colunas 'ID' ou 'UltimoPagamento' não encontradas na planilha."
    );
    return;
  }

  // Mapa de ID -> número da linha (no Excel: header está na linha 1)
  const idToRowIndex = new Map();
  rows.slice(1).forEach((row, i) => {
    const idVal = row[idxId];
    if (idVal !== null && idVal !== undefined && idVal !== "") {
      idToRowIndex.set(String(idVal), i + 2); // +2 porque slice(1) pula header (linha 1)
    }
  });

  const colLetter = columnNumberToLetter(idxUltimoPagamento + 1); // índice 0-based -> 1-based

  // Para cada ID selecionado, grava o mesRef na célula correspondente
  for (const id of colaboradorIds) {
    const rowNumber = idToRowIndex.get(String(id));
    if (!rowNumber) continue;

    const rangeAddress = `${sheetName}!${colLetter}${rowNumber}:${colLetter}${rowNumber}`;

    await axios.patch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/workbook/worksheets('${sheetName}')/range(address='${rangeAddress}')`,
      {
        values: [[mesRef]],
      },
      { headers: headersReq }
    );
  }
}
