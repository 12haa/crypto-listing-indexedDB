import axios from 'axios';

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

// Backward-compatible alias used across components
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

// Exact base URL; pagination is passed via params
const API_BASE_URL = 'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing';

export const fetchCryptocurrenciesPage = async (
  page: number,
  pageSize: number,
  sortBy: string = 'rank',
  sortType: 'asc' | 'desc' = 'desc'
): Promise<CryptoCurrencyListResponse> => {
  const start = (page - 1) * pageSize + 1;
  const response = await axios.get<CryptoCurrencyListResponse>(API_BASE_URL, {
    params: {
      start,
      limit: pageSize,
      sortBy,
      sortType,
      convert: 'USD,BTC,ETH',
      cryptoType: 'all',
      tagType: 'all',
      audited: false,
      aux: 'ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap',
    },
    headers: { Accept: 'application/json' },
  });
  return response.data;
};
