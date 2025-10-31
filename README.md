# Cryptocurrency List App

A responsive web application for displaying real-time cryptocurrency market data with a focus on performance and user experience. This project mimics functionality similar to CoinMarketCap, featuring data caching, pagination, and auto-refresh capabilities.

## Features

- **Real-time Cryptocurrency Data**: Displays live cryptocurrency prices, market caps, and trading volumes
- **Performance Optimized**: Implements IndexedDB caching to reduce API calls and improve load times
- **Lazy Loading**: Images and data are loaded as needed for better performance
- **Responsive Design**: Works seamlessly across mobile, tablet, and desktop devices
- **Search Functionality**: Filter cryptocurrencies by name or symbol
- **Pagination**: Initially loads top 10 cryptocurrencies, with option to load 50 more at a time
- **Auto-refresh**: Data updates automatically every 60 seconds
- **Skeleton Loading**: Provides smooth loading experiences with shimmer effects
- **State Management**: Uses Zustand for efficient state management

## Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: Axios
- **Database**: IndexedDB (client-side storage)
- **Type Safety**: TypeScript
- **Images**: Next.js Image with lazy loading

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reusable UI components
├── services/              # API and data services
├── store/                 # Zustand stores
├── utils/                 # Utility functions
└── types/                 # TypeScript type definitions
```

### Key Components

1. **API Service** (`src/services/api.ts`): Handles all API communication with CoinMarketCap
2. **IndexedDB Service** (`src/services/indexedDB.ts`): Manages client-side data caching
3. **State Store** (`src/store/cryptoStore.ts`): Centralized state management using Zustand
4. **CryptoListPage** (`src/components/CryptoListPage.tsx`): Main page component with all functionality
5. **CryptoItem** (`src/components/CryptoItem.tsx`): Individual cryptocurrency display item
6. **Utility Functions** (`src/utils/formatters.ts`): Number formatting utilities

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-list
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to [http://localhost:3000](http://localhost:3000) to view the application

### Environment Variables (if needed)
If you need to use an API key for CoinMarketCap in production:
```bash
# .env.local
NEXT_PUBLIC_COINMARKETCAP_API_KEY=your_api_key_here
```

## Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Creates a production build
- `npm run start`: Starts the production server
- `npm run lint`: Runs ESLint for code quality checks
- `npm test`: Runs unit tests (if configured)

## Performance Optimizations

1. **Client-side Caching**: Uses IndexedDB to store cryptocurrency data, reducing API calls
2. **Data Pagination**: Initially loads top 10 cryptocurrencies, with incremental loading
3. **Image Optimization**: Next.js Image component with lazy loading for logos
4. **Skeleton Loading**: Provides visual feedback during data loading
5. **Debounced Search**: Prevents excessive filtering during typing
6. **Auto-refresh**: Efficiently updates data without full page reloads

## API Integration

The application fetches cryptocurrency data from CoinMarketCap's API. Due to potential API key requirements for production use, the implementation includes a fallback approach and proper error handling.

## Responsive Design

The UI is built with Tailwind CSS and follows mobile-first principles:
- Mobile: Single-column layout with horizontal scrolling tables on small screens
- Tablet: Optimized two-column stats display
- Desktop: Full feature layout with multi-column data tables

## State Management Strategy

Zustand is used for state management with the following approach:
- Centralized cryptocurrency data store
- Loading and error states
- Search and filtering capabilities
- Pagination state management
- Auto-refresh controls

## Testing Strategy

Unit tests are implemented for:
- Utility functions (formatters)
- API service methods
- Component logic (can be extended)

## Deployment

The application can be deployed to any platform that supports Next.js applications:
- Vercel (recommended for Next.js)
- Netlify
- AWS, GCP, or other cloud platforms
- Traditional web servers (after building with `npm run build`)

## Known Limitations & Considerations

- The demo API endpoint may require an API key for production use
- Crypto logo images use placeholder services and may not be available for all coins
- IndexedDB data is cleared when users clear their browser data
- Auto-refresh intervals can be adjusted based on API rate limits

## Future Enhancements

- Implement server-side rendering for better SEO
- Add more charting and visualization options
- Include detailed pages for individual cryptocurrencies
- Implement user preferences and favorites
- Add more sorting options
- Include historical data visualization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.