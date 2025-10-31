import axios from 'axios';

// Define TypeScript interfaces for our API responses
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

export interface Cryptocurrency {
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
  auditInfoList: any[]; // Define more specific type if needed
  badges: number[];
}

export interface ApiResponse {
  data: {
    cryptoCurrencyList: Cryptocurrency[];
    totalCount: number;
  };
}

const API_BASE_URL =
  'https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=100&sortBy=rank&sortType=desc&convert=USD,BTC,ETH&cryptoType=all&tagType=all&audited=false&aux=ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap';

export const fetchCryptocurrencies = async (
  start = 1,
  limit = 100,
  sortBy = 'cmc_rank',
  sortType = 'desc'
): Promise<ApiResponse> => {
  try {
    const response = await axios.get<ApiResponse>(API_BASE_URL, {
      params: {
        // start,
        // limit,
        // sortBy,
        // sortType,
        // convert: 'USD,BTC,ETH',
        // cryptoType: 'all',
        // tagType: 'all',
        // audited: false,
        // aux: 'ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap',
      },
      headers: {
        Accept: 'application/json',
        // Note: This API might require an API key for production use
        // You might need to add an API key in headers if this endpoint requires authentication
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    throw error;
  }
};
