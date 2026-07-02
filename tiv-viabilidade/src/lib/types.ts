// Modelo de dados do Estudo de Viabilidade Econômica e Financeira (preliminar)
// Estrutura e fórmulas fiéis à metodologia da Técnica Inteligente de Viabilidade (TIV).

export interface UnidadeTipo {
  id: string;
  nome: string;
  qtd: number;
  /** Coluna 20 Quadro II NBR 12.721 – Área Real Privativa Principal coberta padrão (m²) */
  areaPrivativaCoberta: number;
  /** Coluna 21 Quadro II NBR 12.721 – Área Real Privativa Principal padrão diferente/descoberta,
   *  incluindo vagas e cômodos (m²) */
  areaPrivativaDiferente: number;
  /** Área de vaga de garagem e/ou cômodo de despejo (m²) */
  areaVagaGaragem: number;
  /** Coluna 38 Quadro II NBR 12.721 – Área Equivalente Total (m²), extraída do Quadro II */
  areaEquivalenteTotal: number;
  /** Pesquisa de mercado – preço de venda unitário (R$/m²) */
  precoVendaUnitM2: number;
  /** Pesquisa de mercado – deflator do preço de venda da área descoberta (0 a 1) */
  deflatorAreaDescoberta: number;
  /** Pesquisa de mercado – CUC, custo de construção unitário (R$/m²) */
  cucM2: number;
  /** Quantidade de unidades deste tipo destinadas à sub-rogação (pagamento do terreno) */
  qtdSubRogada: number;
}

export const CATEGORIAS_CUSTO = [
  "Terreno — custos complementares",
  "Projetos e aprovações",
  "Jurídico e documentação",
  "Administração da incorporação",
  "Comercialização e marketing",
  "Instalações e equipamentos",
  "Outros",
] as const;

export type CategoriaCusto = (typeof CATEGORIAS_CUSTO)[number];

export interface CustoOperacionalItem {
  id: string;
  nome: string;
  valor: number;
  categoria: CategoriaCusto;
}

export interface Terreno {
  areaTerreno: number; // m²
  valorTerrenoTotal: number; // R$
  /** Área total construída (m²), incluindo áreas comuns — Quadro I da NBR 12.721.
   *  Usada apenas pela matriz de risco (índice Área Privativa / Área Total). */
  areaTotalConstruida: number;
}

export interface Parametros {
  tributacaoPct: number; // 0-1
  corretagemUnidadePct: number; // 0-1
  corretagemTerrenoPct: number; // 0-1
  vmvPct: number; // 0-1, "Verba de Mercado e Vendas" sobre a receita total
  metaIncorporadorPct: number; // 0-1
  metaConstrutorPct: number; // 0-1
}

/** Modelos de curva de distribuição mensal, como nas abas de premissas do TIV
 *  (ex.: "MODELO DE CURVA: LINEAR" em CP 01.4; curva S de engenharia em CP 02). */
export type ModeloCurva = "linear" | "curvaS";

export interface CurvaConfig {
  modelo: ModeloCurva;
  /** Mês de início (0 = primeiro mês do empreendimento) */
  mesInicio: number;
  /** Duração da curva em meses */
  duracao: number;
}

export interface Cronograma {
  /** Horizonte total do empreendimento em meses */
  prazoTotalMeses: number;
  /** Mês de pagamento do terreno (usado quando não há sub-rogação) */
  pagamentoTerrenoMes: number;
  /** Curva de desembolso do custo de construção */
  construcao: CurvaConfig;
  /** Curva de desembolso do custo operacional */
  custoOperacional: CurvaConfig;
  /** Curva de recebimento das vendas (parte recebida durante o período de vendas) */
  vendas: CurvaConfig;
  /** Percentual da receita recebida apenas no repasse/entrega (fim da obra), 0-1 */
  pctRepasse: number;
}

export interface EstudoState {
  nomeProjeto: string;
  terreno: Terreno;
  parametros: Parametros;
  unidades: UnidadeTipo[];
  custoOperacional: CustoOperacionalItem[];
  cronograma: Cronograma;
}
