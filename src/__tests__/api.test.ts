// Mock api config to avoid making real API calls during testing
jest.mock('@/config/apiConfig', () => ({
  api: {
    get: jest.fn(),
  },
}));

import { fetchCryptocurrenciesPage } from '@/hooks/queries/useFetchCryptocurrenciesPage';
import { api } from '@/config/apiConfig';

const mockedApi = api as jest.Mocked<typeof api>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCryptocurrenciesPage', () => {
    it('should call the API with correct parameters', async () => {
      const mockResponse = {
        data: {
          cryptoCurrencyList: [],
          totalCount: '0',
        },
        status: {
          timestamp: '2023-01-01T00:00:00.000Z',
          error_code: '0',
          error_message: '',
          elapsed: '10',
          credit_count: 1,
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      await fetchCryptocurrenciesPage(1, 10, 'rank', 'desc');

      expect(api.get).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          params: expect.objectContaining({
            start: 1,
            limit: 10,
            sortBy: 'rank',
            sortType: 'desc',
            convert: 'USD,BTC,ETH',
            cryptoType: 'all',
            tagType: 'all',
            audited: false,
            aux: expect.any(String),
          }),
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should handle errors properly', async () => {
      const mockError = new Error('Network error');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(fetchCryptocurrenciesPage(1, 10, 'rank', 'desc')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
