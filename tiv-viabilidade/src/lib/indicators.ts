import type { FluxoMensal } from "./schedule";

/**
 * Indicadores dinâmicos — Fase 3.
 *
 * Calculados sobre o fluxo de caixa mensal do empreendimento, como na aba
 * de indicadores técnico-financeiros do TIV 4.0:
 *
 * - TIR mensal e anualizada (equivalência composta);
 * - VPL descontado à TMA;
 * - Payback simples e descontado (primeiro mês em que o acumulado zera);
 * - Exposição máxima nominal e a valor presente.
 */

export interface IndicadoresDinamicos {
  tirMensal: number | null; // null quando não existe raiz (fluxo sem inversão de sinal)
  tirAnual: number | null;
  /** MTIR — TIR modificada: positivos capitalizados à TMA, negativos
   *  descontados à TMA. Mais estável que a TIR em fluxos não convencionais. */
  mtirMensal: number | null;
  mtirAnual: number | null;
  vpl: number;
  tmaMensal: number;
  paybackMeses: number | null; // null quando o acumulado não termina positivo
  paybackDescontadoMeses: number | null;
  exposicaoMaximaVP: number;
  mesExposicaoMaximaVP: number;
}

function vplComTaxa(fluxo: number[], taxaMensal: number): number {
  return fluxo.reduce((acc, v, t) => acc + v / Math.pow(1 + taxaMensal, t), 0);
}

/**
 * TIR por bisseção em [-0,95; 5] a.m. — robusta e suficiente para fluxos
 * imobiliários típicos. Retorna null quando não há mudança de sinal do VPL
 * no intervalo (fluxo sem investimento ou sem retorno).
 */
export function tirMensalDe(fluxo: number[]): number | null {
  const temPositivo = fluxo.some((v) => v > 0);
  const temNegativo = fluxo.some((v) => v < 0);
  if (!temPositivo || !temNegativo) return null;

  let lo = -0.95;
  let hi = 5;
  let fLo = vplComTaxa(fluxo, lo);
  const fHi = vplComTaxa(fluxo, hi);
  if (fLo * fHi > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = vplComTaxa(fluxo, mid);
    if (Math.abs(fMid) < 1e-7 || hi - lo < 1e-10) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

export function calcularIndicadores(
  fluxo: FluxoMensal,
  tmaAnual: number
): IndicadoresDinamicos {
  const serie = fluxo.saldoMensal;
  const tmaMensal = Math.pow(1 + Math.max(0, tmaAnual), 1 / 12) - 1;

  const tirMensal = tirMensalDe(serie);
  const tirAnual =
    tirMensal === null ? null : Math.pow(1 + tirMensal, 12) - 1;

  // MTIR: capitaliza entradas até o fim à TMA; desconta saídas a valor
  // presente à TMA. Estável mesmo com múltiplas inversões de sinal.
  const n = serie.length - 1;
  let fvPos = 0;
  let pvNeg = 0;
  serie.forEach((v, t) => {
    if (v > 0) fvPos += v * Math.pow(1 + tmaMensal, n - t);
    else if (v < 0) pvNeg += -v / Math.pow(1 + tmaMensal, t);
  });
  const mtirMensal =
    fvPos > 0 && pvNeg > 0 && n > 0
      ? Math.pow(fvPos / pvNeg, 1 / n) - 1
      : null;
  const mtirAnual =
    mtirMensal === null ? null : Math.pow(1 + mtirMensal, 12) - 1;

  const vpl = vplComTaxa(serie, tmaMensal);

  // Payback: primeiro mês a partir do qual o saldo acumulado fica não
  // negativo e assim permanece até o fim (robusto a fluxos não
  // convencionais, como recebimentos antes do pico de obra).
  const payback = (valores: number[]): number | null => {
    const acumulado: number[] = [];
    let acc = 0;
    for (const v of valores) {
      acc += v;
      acumulado.push(acc);
    }
    if (acumulado[acumulado.length - 1] < -1e-9) return null; // termina negativo
    let ultimoNegativo = -1;
    acumulado.forEach((v, t) => {
      if (v < -1e-9) ultimoNegativo = t;
    });
    return ultimoNegativo + 1; // 0 quando nunca foi negativo
  };

  const paybackMeses = payback(serie);
  const serieDescontada = serie.map((v, t) => v / Math.pow(1 + tmaMensal, t));
  const paybackDescontadoMeses = payback(serieDescontada);

  let exposicaoMaximaVP = 0;
  let mesExposicaoMaximaVP = 0;
  let accVP = 0;
  serieDescontada.forEach((v, t) => {
    accVP += v;
    if (accVP < exposicaoMaximaVP) {
      exposicaoMaximaVP = accVP;
      mesExposicaoMaximaVP = t;
    }
  });

  return {
    tirMensal,
    tirAnual,
    mtirMensal,
    mtirAnual,
    vpl,
    tmaMensal,
    paybackMeses,
    paybackDescontadoMeses,
    exposicaoMaximaVP,
    mesExposicaoMaximaVP,
  };
  }
