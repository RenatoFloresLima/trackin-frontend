export type TipoEscalaEnum = "ESCALA_8X5" | "ESCALA_12X36" | "ESCALA_24X48" | "PERSONALIZADA";
export type ModoFechamentoDiaEnum = "CIVIL" | "OPERACIONAL";

export interface EmpresaJornadaRegraDTO {
  id: number;
  empresaId: number;
  empresaNome: string;
  tipoEscala: TipoEscalaEnum;
  horasPrevistasPorTurno: number;
  toleranciaEntradaMin: number;
  toleranciaSaidaMin: number;
  limiteExtraDiaria: number;
  limiteTotalDia: number;
  obrigatoriedadeIntervalo: boolean;
  intervaloMinimo: number;
  modoFechamentoDia: ModoFechamentoDiaEnum;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface EmpresaJornadaRegraFormValues {
  tipoEscala: TipoEscalaEnum;
  horasPrevistasPorTurno: number;
  toleranciaEntradaMin: number;
  toleranciaSaidaMin: number;
  limiteExtraDiaria: number;
  limiteTotalDia: number;
  obrigatoriedadeIntervalo: boolean;
  intervaloMinimo: number;
  modoFechamentoDia: ModoFechamentoDiaEnum;
}

