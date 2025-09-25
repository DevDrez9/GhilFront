// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Crear el persister para localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Configurar QueryClient con opciones optimizadas para auth
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 24 * 60 * 60 * 1000, // ✅ Cambiado cacheTime -> gcTime
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// Persistir el cliente de query
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 24 * 60 * 60 * 1000, // 24 horas máximo en cache
  buster: 'v1',
});