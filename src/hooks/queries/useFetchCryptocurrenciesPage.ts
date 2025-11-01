import { CryptoCurrencyListResponse } from '@/app/types/cryptoTypes/cryptoTypes';
import { api } from '@/config/apiConfig';


export const fetchCryptocurrenciesPage = async (
  page: number,
  pageSize: number,
  sortBy: string = 'rank',
  sortType: 'asc' | 'desc' = 'desc'
): Promise<CryptoCurrencyListResponse> => {
  const start = (page - 1) * pageSize + 1;
  const response = await api.get<CryptoCurrencyListResponse>('', {
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
  return response as unknown as CryptoCurrencyListResponse;
};
