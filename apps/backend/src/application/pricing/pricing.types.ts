export enum PricingReceivableType {
  DUPLICATA_MERCANTIL = 'DUPLICATA_MERCANTIL',
  CHEQUE_PRE_DATADO = 'CHEQUE_PRE_DATADO',
}

export type PricingSimulationInput = {
  faceValue: string;
  currencyCode: string;
  receivableType: PricingReceivableType;
  baseRateMonthly: string;
  dueDate: string;
  simulationDate?: string;
};

export type PricingSimulationResult = {
  currencyCode: string;
  receivableType: PricingReceivableType;
  faceValue: string;
  presentValue: string;
  discountAmount: string;
  baseRateMonthly: string;
  spreadMonthly: string;
  effectiveMonthlyRate: string;
  termDays: number;
  termInMonths: string;
};
