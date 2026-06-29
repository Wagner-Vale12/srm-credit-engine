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

export type ListReceivablesInput = {
  page?: number;
  limit?: number;
  status?: string;
  currencyCode?: string;
  receivableTypeCode?: string;
  cedentId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
};

export type PaginatedReceivables = {
  data: ReceivableSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
