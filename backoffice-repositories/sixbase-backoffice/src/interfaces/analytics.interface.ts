export interface DateRange {
  start: string;
  end: string;
}

export interface ChartDatum {
  name: string;
  value: number;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface Summary {
  totalVendas: number;
  totalFaturamento: number;
  b4youRecebeu: number;
  taxaConversaoPix: number;
  taxaConversaoCartao: number;
  taxaConversaoBoleto: number;
  commissionsReal: {
    producer: number;
    coproducer: number;
    affiliate: number;
    supplier: number;
  };
}

export interface PaymentMethodAnalytics {
  totalItems: number;
  totalSalesPrice: number;
  salesMethodsCount: {
    [method: string]: {
      count: number;
      total_price: number;
    };
  };
  salesMethodsCountSimple: {
    [method: string]: number;
  };
}

export interface StatusAnalytics {
  [statusId: string]: number;
}

export interface SellerAnalytics {
  [sellerId: string]: {
    user_name: string;
    total_count: number;
  };
}

export interface ProductAnalytics {
  [productId: string]: {
    product_name: string;
    total_count: number;
  };
}

export interface RegionAnalytics {
  regionCounts: {
    [region: string]: {
      total: number;
    };
  };
}

export interface StateAnalytics {
  stateCounts: {
    [state: string]: {
      total: number;
    };
  };
}

export interface OriginAnalytics {
  totalItems: number;
  totalSalesPrice: number;
  input?: string;
}

export interface CalculationsAnalytics {
  commissionsByRole: {
    [roleKey: string]: {
      id: number;
      label: string;
      total: number;
      count: number;
    };
  };
  agentStatus: {
    devices: { [device: string]: number };
    browsers: { [browser: string]: number };
    os: { [os: string]: number };
    origins: { [origin: string]: number };
  };
  conversionRates: {
    byMethod: {
      [method: string]: string;
    };
  };
  totalFeeB4you: number;
}
export interface CombinedAnalyticsData {
  // From paymentMethod
  totalItems: number;
  totalSalesPrice: number;
  salesMethodsCount: {
    [method: string]: {
      count: number;
      total_price: number;
    };
  };
  salesMethodsCountSimple: {
    [method: string]: number;
  };

  salesByStatus: StatusAnalytics;

  regionCounts: {
    [region: string]: {
      total: number;
    };
  };

  stateCounts: {
    [state: string]: {
      total: number;
    };
  };

  totalFeeB4you: number;
  commissionsByRole: {
    [roleKey: string]: {
      id: number;
      label: string;
      total: number;
      count: number;
    };
  };
  conversionRates: {
    byMethod: {
      [method: string]: string;
    };
  };
  agentStatus: {
    devices: { [device: string]: number };
    browsers: { [browser: string]: number };
    os: { [os: string]: number };
    origins: { [origin: string]: number };
  };

  totalSalesBySeller: SellerAnalytics;

  totalSalesByProduct: ProductAnalytics;
}

export interface SeparateAnalyticsData {
  paymentMethod: PaymentMethodAnalytics | null;
  status: StatusAnalytics | null;
  region: RegionAnalytics | null;
  state: StateAnalytics | null;
  seller: SellerAnalytics | null;
  product: ProductAnalytics | null;
  origin: OriginAnalytics | null;
  calculations: CalculationsAnalytics | null;
}

export interface SeparateLoadingState {
  paymentMethod: boolean;
  status: boolean;
  region: boolean;
  state: boolean;
  seller: boolean;
  product: boolean;
  origin: boolean;
  calculations: boolean;
}
