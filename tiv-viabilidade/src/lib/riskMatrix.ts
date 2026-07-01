import type { EstudoState } from "./types";
import type { ResultadoCalculo } from "./calc";

/**
 * Matriz de risco "Estático" — reproduz a metodologia da aba
 * `Tab. Viab. - Estático` / `DEFINIÇÃO DAS MÉTRICAS` do TIV 4.0.
 *
 * Cada indicador tem 3 limiares de referência extraídos da planilha original
 * (pior caso, mediano/ideal, melhor caso) e um peso de 1 a 10. A posição do
 * resultado obtido dentro dessa faixa gera uma pontuação de -5 (ameaça
 * máxima) a +5 (oportunidade máxima), normalizada para 0–1 e ponderada pelo
 * peso do indicador. O índice composto é a média ponderada de todas as
 * pontuações normalizadas.
 *
 * Nota de fidelidade: a planilha original usa uma tabela de faixas discretas
 * (VLOOKUP aproximado) que produz saltos de pontuação. Aqui a posição dentro
 * de cada faixa é interpolada linearmente entre os mesmos limiares — mesma
 * lógica de ameaça/mediano/oportunidade e os mesmos pesos, com uma curva
 * contínua em vez de degraus, o que é mais legível e igualmente fiel ao
 * espírito da metodologia.
 */

export interface MetricaRisco {
  id: string;
  nome: string;
  /** true = valores menores são melhores (ex.: custo % VGV) */
  invertido: boolean;
  pior: number;
  mediano: number;
  melhor: number;
  peso: number; // 1-10
  formatoPercentual: boolean;
}

export interface MetricaRiscoCalculada extends MetricaRisco {
  valor: number;
  score: number; // -5 a 5
  scoreNormalizado: number; // 0 a 1
  classificacao: "Ameaça" | "Oportunidade";
}

export interface MatrizRisco {
  metricas: MetricaRiscoCalculada[];
  indiceComposto: number; // 0 a 1
}

const METRICAS_BASE: Omit<MetricaRisco, "valor">[] = [
  {
    id: "lucratividade",
    nome: "Lucratividade",
    invertido: false,
    pior: 0.15,
    mediano: 0.17,
    melhor: 0.18,
    peso: 10,
    formatoPercentual: true,
  },
  {
    id: "lucroValorVenal",
    nome: "Lucro / valor venal",
    invertido: false,
    pior: 0.16,
    mediano: 0.18,
    melhor: 0.19,
    peso: 10,
    formatoPercentual: true,
  },
  {
    id: "custoTerreno",
    nome: "Custo do terreno (% VGV total)",
    invertido: true,
    pior: 0.2,
    mediano: 0.18,
    melhor: 0.1,
    peso: 5,
    formatoPercentual: true,
  },
  {
    id: "custoIncorporacao",
    nome: "Custo de incorporação (% VGV total)",
    invertido: true,
    pior: 0.35,
    mediano: 0.25,
    melhor: 0.2,
    peso: 6,
    formatoPercentual: true,
  },
  {
    id: "custoConstrucao",
    nome: "Custo geral de construção (% VGV total)",
    invertido: true,
    pior: 0.6,
    mediano: 0.45,
    melhor: 0.4,
    peso: 7,
    formatoPercentual: true,
  },
  {
    id: "roi",
    nome: "Lucro / investimento total (ROI)",
    invertido: false,
    pior: 0.2,
    mediano: 0.3,
    melhor: 0.35,
    peso: 6,
    formatoPercentual: true,
  },
  {
    id: "roe",
    nome: "Lucro / custo de obra (ROE)",
    invertido: false,
    pior: 0.3,
    mediano: 0.55,
    melhor: 0.55,
    peso: 6,
    formatoPercentual: true,
  },
  {
    id: "apAt",
    nome: "Área privativa / área total",
    invertido: false,
    pior: 0.45,
    mediano: 0.55,
    melhor: 0.6,
    peso: 3,
    formatoPercentual: true,
  },
  {
    id: "apAe",
    nome: "Área privativa / área equivalente",
    invertido: false,
    pior: 0.45,
    mediano: 0.55,
    melhor: 0.6,
    peso: 3,
    formatoPercentual: true,
  },
  {
    id: "aeAp",
    nome: "Área equivalente / área privativa",
    invertido: true,
    pior: 1.8,
    mediano: 1.5,
    melhor: 1.4,
    peso: 3,
    formatoPercentual: false,
  },
];

function pontuar(valor: number, m: Omit<MetricaRisco, "valor">): number {
  const { pior, mediano, melhor, invertido } = m;

  const interp = (v: number, x0: number, x1: number, y0: number, y1: number) => {
    if (x1 === x0) return y1;
    const t = Math.max(0, Math.min(1, (v - x0) / (x1 - x0)));
    return y0 + t * (y1 - y0);
  };

  if (!invertido) {
    if (valor <= pior) return -5;
    if (valor <= mediano) return interp(valor, pior, mediano, -5, 0);
    if (valor <= melhor) return interp(valor, mediano, melhor, 0, 5);
    return 5;
  } else {
    if (valor >= pior) return -5;
    if (valor >= mediano) return interp(valor, pior, mediano, -5, 0);
    if (valor >= melhor) return interp(valor, mediano, melhor, 0, 5);
    return 5;
  }
}

/** Área privativa total vendável (coberta + diferente sem garagem), somada por tipo. */
function areaPrivativaTotal(r: ResultadoCalculo): number {
  return r.unidades.reduce(
    (acc, u) =>
      acc + u.qtd * (u.areaPrivativaCoberta + u.areaDiferenteSemGaragem),
    0
  );
}

function areaEquivalenteTotal(r: ResultadoCalculo): number {
  return r.unidades.reduce((acc, u) => acc + u.qtd * u.areaEquivalenteTotal, 0);
}

export function calcularMatrizRisco(
  state: EstudoState,
  r: ResultadoCalculo
): MatrizRisco {
  const ap = areaPrivativaTotal(r);
  const ae = areaEquivalenteTotal(r);
  const at = state.terreno.areaTotalConstruida || ae;

  const valores: Record<string, number> = {
    lucratividade: r.resultadoIncorporadorPct,
    lucroValorVenal: r.resultadoIncorporadorPct,
    custoTerreno:
      r.receitaTotal > 0 ? state.terreno.valorTerrenoTotal / r.receitaTotal : 0,
    custoIncorporacao:
      r.receitaTotal > 0 ? r.custoOperacionalTotal / r.receitaTotal : 0,
    custoConstrucao:
      r.receitaTotal > 0 ? r.custoConstrucaoTotal / r.receitaTotal : 0,
    roi: r.despesaTotal > 0 ? r.lucroIncorporacao / r.despesaTotal : 0,
    roe: r.custoConstrucaoTotal > 0 ? r.lucroIncorporacao / r.custoConstrucaoTotal : 0,
    apAt: at > 0 ? ap / at : 0,
    apAe: ae > 0 ? ap / ae : 0,
    aeAp: ap > 0 ? ae / ap : 0,
  };

  const metricas: MetricaRiscoCalculada[] = METRICAS_BASE.map((m) => {
    const valor = valores[m.id] ?? 0;
    const score = pontuar(valor, m);
    const scoreNormalizado = (score + 5) / 10;
    const ameaca = m.invertido ? valor > m.mediano : valor < m.mediano;
    return {
      ...m,
      valor,
      score,
      scoreNormalizado,
      classificacao: ameaca ? "Ameaça" : "Oportunidade",
    };
  });

  const somaPesos = metricas.reduce((a, m) => a + m.peso, 0);
  const indiceComposto =
    somaPesos > 0
      ? metricas.reduce((a, m) => a + m.scoreNormalizado * m.peso, 0) / somaPesos
      : 0;

  return { metricas, indiceComposto };
}
