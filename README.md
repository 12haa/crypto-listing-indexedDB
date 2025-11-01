# Cryptocurrency List App

A responsive web application for displaying real-time cryptocurrency market data with a focus on performance and user experience. This project mimics functionality similar to CoinMarketCap, featuring intelligent data caching, pagination, and auto-refresh capabilities.

## Features

- **Real-time Cryptocurrency Data**: Displays live cryptocurrency prices, market caps, trading volumes, and 24h change percentages
- **Performance Optimized**: Implements IndexedDB caching with snapshot-first approach for instant UI rendering
- **Sticky Top 10**: Shows cached top 10 cryptocurrencies immediately while fresh data loads in the background
- **Smart Pagination**: Page-based navigation with configurable page sizes (default 10 items per page, expandable up to 200)
- **Load More**: Incremental loading with "Load More" button for additional items
- **Responsive Design**: Works seamlessly across mobile, tablet, and desktop devices
- **Search Functionality**: Real-time search with debouncing (300ms) to filter cryptocurrencies by name or symbol
- **Auto-refresh**: Data updates automatically every 30 seconds
- **Skeleton Loading**: Provides smooth loading experiences with shimmer effects
- **Error Handling**: Comprehensive error handling with user-friendly error messages
- **State Management**: Uses Zustand for efficient, centralized state management
- **Data Fetching**: TanStack Query (React Query) for intelligent caching and request management

## Architecture

### Technology Stack

- **Framework**: Next.js 16.0.1 with App Router
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.16
- **State Management**: Zustand 5.0.8
- **Data Fetching**:
  - TanStack Query (React Query) 5.90.6 for intelligent caching and request deduplication
  - Axios 1.13.1 for HTTP requests
- **Database**: IndexedDB via idb 8.0.3 (client-side storage)
- **Type Safety**: TypeScript 5
- **Testing**: Jest 30.2.0 with ts-jest
- **Linting**: ESLint 9 with Next.js config

### Project Structure

```
src/
├── __tests__/              # Test files
│   ├── api.test.ts        # API service tests
│   └── formatters.test.ts # Utility function tests
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (with QueryProvider)
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── elements/          # Small reusable components
│   │   ├── PaginationButton.tsx
│   │   ├── SearchBar.tsx
│   │   └── TableHeader.tsx
│   ├── modules/           # Feature components
│   │   ├── CryptoItem.tsx         # Individual crypto row (with sticky behavior)
│   │   ├── CryptoItemSkeleton.tsx # Loading skeleton
│   │   ├── Pagination.tsx         # Pagination controls
│   │   └── StatsBar.tsx           # Statistics display
│   └── sections/          # Page-level components
│       └── CryptoListPage.tsx     # Main page component
├── config/                # Configuration files
│   └── apiConfig.ts       # Axios API instance configuration
├── hooks/                 # Custom React hooks
│   └── queries/           # Data fetching hooks
│       └── useFetchCryptocurrenciesPage.ts  # React Query hook for fetching crypto data
├── providers/             # React context providers
│   └── QueryProvider.tsx  # TanStack Query client provider
├── services/              # Business logic services
│   └── indexedDB.ts       # IndexedDB operations and caching
├── store/                 # Zustand stores
│   └── cryptoStore.ts     # Main application state store
├── types/                 # TypeScript type definitions
│   ├── cryptoTypes/       # Cryptocurrency types
│   │   └── cryptoTypes.ts
│   ├── services/         # Service layer types
│   │   └── indexedDBTypes.ts
│   ├── store/            # Store types
│   │   └── cryptoStoreTypes.ts
│   └── index.ts          # Type exports
└── utils/                 # Utility functions
    └── formatters.ts      # Number and currency formatters
```

### Key Components

1. **Query Provider** (`src/providers/QueryProvider.tsx`):

   - TanStack Query client provider wrapper
   - Configures React Query with 1-minute stale time
   - Disables automatic refetch on window focus
   - Wraps the entire application in the root layout

2. **API Configuration** (`src/config/apiConfig.ts`):

   - Configured Axios instance with base URL and response interceptors
   - Handles API response transformation

3. **API Hook** (`src/hooks/queries/useFetchCryptocurrenciesPage.ts`):

   - React Query hook using `useQuery` for fetching cryptocurrency pages
   - Implements query key-based caching: `['cryptocurrenciesPage', page, pageSize, sortBy, sortType]`
   - Exports both the hook for component use and a function for Zustand store integration
   - Supports conditional fetching via `enabled` parameter

4. **IndexedDB Service** (`src/services/indexedDB.ts`):

   - Manages client-side data caching with:
   - Page-based data storage
   - Top 10 snapshot caching
   - Metadata storage for total count
   - Provides persistence layer alongside React Query cache

5. **State Store** (`src/store/cryptoStore.ts`):

   - Centralized state management using Zustand
   - Integrates with React Query via `queryClient.fetchQuery`
   - Implements snapshot-first data loading
   - Automatic data refresh every 30 seconds
   - Search and filtering functionality
   - Pagination management
   - Loading and error states
   - Manages both React Query cache and IndexedDB persistence

6. **CryptoListPage** (`src/components/sections/CryptoListPage.tsx`):

   - Main page component orchestrating all features
   - Handles search with debouncing
   - Manages auto-refresh lifecycle
   - Displays skeletons during initial loading
   - Coordinates between Zustand store and React Query

7. **CryptoItem** (`src/components/modules/CryptoItem.tsx`):

   - Individual cryptocurrency display item with:
   - Sticky/cached data support for top 10
   - Smooth transitions from cached to fresh data
   - Loading state indicators

8. **Utility Functions** (`src/utils/formatters.ts`):
   - Number formatting utilities for currency, percentages, and large numbers
   - Includes K, M, B suffixes for large values

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

3. Set up environment variables (optional):
   Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_BASE_URL=your_api_base_url_here
```

**Note**: The API base URL defaults to an empty string if not provided. You may need to configure this based on your API endpoint.

4. Run the development server:

```bash
npm run dev
```

5. Open your browser to [http://localhost:3000](http://localhost:3000) to view the application

### Environment Variables

The application uses the following environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the CoinMarketCap API (optional, defaults to empty string)

For IndexedDB configuration (optional, has defaults):

- `DB_NAME`: Database name (defaults to 'CryptoDB')
- `DB_VERSION`: Database version (defaults to 4)
- `STORE_NAME`: Store name for cryptocurrencies (defaults to 'cryptocurrencies')
- `META_STORE`: Meta store name (defaults to 'meta')

## Scripts

- `npm run dev`: Starts the development server on port 3000
- `npm run build`: Creates an optimized production build
- `npm run start`: Starts the production server
- `npm run lint`: Runs ESLint for code quality checks
- `npm test`: Runs Jest test suite with ts-jest

## Performance Optimizations

1. **Snapshot-First Loading**: Shows cached top 10 data immediately while fetching fresh data in background
2. **Dual-Layer Caching**:
   - React Query for in-memory cache with 1-minute stale time
   - IndexedDB for persistent cache across sessions
3. **Request Deduplication**: React Query automatically prevents duplicate API calls
4. **Smart Pagination**: Page-based navigation with efficient data fetching (fetches only needed pages)
5. **Debounced Search**: 300ms debounce prevents excessive filtering during typing
6. **Skeleton Loading**: Provides visual feedback during data loading transitions
7. **Auto-refresh**: Efficiently updates data every 30 seconds without full page reloads
8. **Conditional Fetching**: React Query's `enabled` option prevents unnecessary requests
9. **Query Key Optimization**: Intelligent query keys ensure proper cache invalidation and reuse
10. **Background Refetching**: React Query handles background updates automatically based on stale time

## Data Flow

1. **Initial Load**:

   - Check IndexedDB for cached top 10 snapshot
   - Display cached data immediately if available (snapshot-first approach)
   - If no cached data exists, show skeleton loaders
   - Fetch fresh data from API using React Query (`queryClient.fetchQuery`)
   - React Query handles request deduplication and caching
   - Update UI with fresh data and store in IndexedDB
   - React Query cache and IndexedDB work together for optimal performance

2. **Pagination**:

   - Calculate required data pages based on current page and displayed count
   - Check IndexedDB cache first for page data
   - If cache miss, use React Query to fetch from API with automatic caching
   - React Query manages query invalidation and refetching
   - Store fetched data in IndexedDB for persistence across sessions
   - React Query cache handles in-memory requests for faster subsequent access

3. **Search**:

   - Filter in-memory data array from Zustand store
   - Debounced (300ms) to reduce computation during typing
   - Works across all loaded pages
   - Search is client-side only for instant feedback

4. **Auto-refresh**:
   - Updates current page data every 30 seconds via Zustand store
   - Uses React Query's `fetchQuery` for fresh data
   - Updates both React Query cache and IndexedDB
   - Refreshes top 10 snapshot if on page 1
   - React Query's stale time (1 minute) prevents unnecessary refetches

## API Integration

The application fetches cryptocurrency data from CoinMarketCap's API endpoint using a hybrid caching strategy:

### React Query Integration

- **Query-based Caching**: Each page request is cached using query keys: `['cryptocurrenciesPage', page, pageSize, sortBy, sortType]`
- **Request Deduplication**: React Query automatically deduplicates simultaneous requests for the same data
- **Stale Time**: Data is considered fresh for 1 minute, reducing unnecessary API calls
- **Background Refetching**: Can be configured for automatic background updates
- **Error Handling**: Built-in retry and error state management

### API Hook Features

The `useFetchCryptocurrenciesPage` hook supports:

- Pagination (start, limit parameters)
- Sorting (sortBy, sortType)
- Multiple currency conversions (USD, BTC, ETH)
- Extended auxiliary data fields
- Conditional fetching via `enabled` parameter
- Returns: `{ data, isLoading, error }`

### Dual Caching Strategy

1. **React Query Cache**: In-memory cache for fast access during session
2. **IndexedDB**: Persistent cache that survives page refreshes

This dual-layer approach provides:

- Instant access to cached data on subsequent visits
- Reduced API calls through intelligent caching
- Offline capability with IndexedDB persistence
- Optimal performance with React Query's request management

## Responsive Design

The UI is built with Tailwind CSS 4 and follows mobile-first principles:

- **Mobile**: Single-column stats layout with horizontally scrollable tables
- **Tablet**: Three-column stats grid with optimized table display
- **Desktop**: Full-width layout with complete feature visibility

## State Management Strategy

The application uses a hybrid state management approach combining Zustand and React Query:

### Zustand Store (`cryptoStore.ts`)

- **Centralized Store**: Single source of truth for UI state and data display
- **Snapshot Management**: Separate storage for top 10 items for instant display
- **Loading States**: Separate states for initial loading (`initialLoading`) and pagination loading (`loading`)
- **Error Handling**: Centralized error state management
- **Search State**: Debounced search term with filtered results
- **Pagination State**: Current page, page size, and displayed count tracking
- **Auto-refresh**: Interval management for background updates
- **Integration with React Query**: Uses `queryClient.fetchQuery` to leverage React Query's caching while maintaining Zustand for UI state

### React Query Cache

- **Query Caching**: Automatic caching of API responses
- **Request Management**: Deduplication and batching of requests
- **Cache Invalidation**: Smart cache invalidation strategies
- **Background Updates**: Automatic background refetching based on stale time

### Data Persistence

- **IndexedDB**: Long-term persistence across browser sessions
- **React Query Cache**: Fast in-memory cache for current session
- **Coordination**: Zustand coordinates between React Query cache and IndexedDB for optimal user experience

## Testing Strategy

Unit tests are implemented using Jest and ts-jest:

- **API Tests** (`src/__tests__/api.test.ts`):

  - API call parameter validation
  - Error handling verification
  - Response structure validation

- **Formatter Tests** (`src/__tests__/formatters.test.ts`):
  - Currency formatting (K, M, B suffixes)
  - Percentage formatting
  - Number formatting utilities

Tests can be run with `npm test` and are configured to work with TypeScript and Next.js path aliases.

## Type Safety

The project uses TypeScript with strict mode enabled. All types are centrally organized in `src/types/`:

- `cryptoTypes/`: Cryptocurrency data structures (`CryptoCurrency`, `CryptoCurrencyListResponse`, `Quote`, etc.)
- `services/`: Service layer type definitions (IndexedDB types)
- `store/`: State management types (`CryptoState` interface)
- `index.ts`: Central type exports

Type definitions ensure:

- Type-safe API responses
- Type-safe store actions and state
- Type-safe component props
- Compile-time error checking

## Deployment

The application can be deployed to any platform that supports Next.js applications:

- **Vercel** (recommended for Next.js): One-click deployment
- **Netlify**: Supports Next.js with build configuration
- **AWS/GCP/Azure**: Container-based deployment
- **Traditional Web Servers**: Build with `npm run build` and serve the output

### Build for Production

```bash
npm run build
npm run start
```

The build output will be in the `.next` directory.

## Known Limitations & Considerations

- **API Requirements**: The API endpoint may require authentication or have rate limits in production
- **Browser Storage**: IndexedDB data is browser-specific and cleared when users clear their browser data
- **Refresh Interval**: 30-second auto-refresh may need adjustment based on API rate limits
- **Maximum Display**: Display is limited to 200 items at a time (can be increased if needed)
- **Client-Side Only**: No server-side rendering currently implemented (can be added)
- **React Query Cache**: Cache is cleared on page refresh (IndexedDB provides persistence)
- **Query Client Instance**: Store uses separate QueryClient instance (not the provider's instance) for compatibility with Zustand

## Future Enhancements

- Implement server-side rendering (SSR) or static site generation (SSG) for better SEO
- Add more charting and visualization options for price trends
- Include detailed pages for individual cryptocurrencies
- Implement user preferences and favorites (persisted in IndexedDB)
- Add more sorting options (by volume, market cap, etc.)
- Include historical data visualization
- Add price alerts and notifications
- Implement dark mode theme
- Add export functionality (CSV, JSON)
- Implement virtual scrolling for better performance with large datasets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure tests pass (`npm test`)
4. Run linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
