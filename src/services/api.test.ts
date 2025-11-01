import { fetchCryptocurrenciesPage } from '@/services/api';

// Mock axios to avoid making real API calls during testing
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCryptocurrencies', () => {
    it('should call the API with correct parameters', async () => {
      const mockResponse = {
        data: {
          status: {
            timestamp: '2023-01-01T00:00:00.000Z',
            error_code: 0,
            error_message: null,
            elapsed: 10,
            credit_count: 1,
          },
          data: {
            crypto_currencies: [],
            total_count: 0,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await fetchCryptocurrenciesPage(1, 10, 'rank', 'desc');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.coinmarketcap.com/dataapi/v3/cryptocurrency/listing',
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
          }),
        })
      );
    });

    it('should handle errors properly', async () => {
      const mockError = new Error('Network error');
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(fetchCryptocurrenciesPage(1, 10, 'rank', 'desc')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
