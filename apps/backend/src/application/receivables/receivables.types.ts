export type CreateReceivableInput = {
  cedentId: string;
  receivableTypeCode: string;
  currencyCode: string;
  faceValue: string;
  dueDate: string;
};

export type ReceivableSummary = {
  id: string;
  cedentName: string;
  receivableType: string;
  currencyCode: string;
  faceValue: string;
  dueDate: string;
  status: string;
  version: number;
  createdAt: string;
};
