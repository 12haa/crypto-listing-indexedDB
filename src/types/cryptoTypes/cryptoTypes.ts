

export interface AuditInfo {
  coinId: string;
  auditor: string;
  auditStatus: number;
  auditTime?: string;
  reportUrl: string;
  score?: string;
  contractAddress?: string;
  contractPlatform?: string;
}

export interface Quote {
  name: string;
  price: number;
  volume24h: number;
  volume7d: number;
  volumePercentChange: number;
  volume30d: number;
  marketCap: number;
  selfReportedMarketCap: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  lastUpdated: string;
  percentChange30d: number;
  percentChange60d: number;
  percentChange90d: number;
  fullyDilluttedMarketCap: number;
  marketCapByTotalSupply: number;
  dominance: number;
  turnover: number;
  ytdPriceChangePercentage: number;
  percentChange1y: number;
}

export interface CryptoCurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmcRank: number;
  marketPairCount: number;
  circulatingSupply: number;
  selfReportedCirculatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  ath: number;
  atl: number;
  high24h: number;
  low24h: number;
  isActive: number;
  lastUpdated: string;
  dateAdded: string;
  quotes: Quote[];
  isAudited: boolean;
  auditInfoList: AuditInfo[];
  badges: number[];
}
export type Cryptocurrency = CryptoCurrency;

export interface CryptoCurrencyListResponse {
  data: {
    cryptoCurrencyList: CryptoCurrency[];
    totalCount: string;
  };
  status: {
    timestamp: string;
    error_code: string;
    error_message: string;
    elapsed: string;
    credit_count: number;
  };
}
