// src/lib/authPersister.js
export const createAuthPersister = () => {
  return {
    persistClient: async (client) => {
      try {
        const authData = {
          queries: client.getQueryCache().getAll().filter(query => 
            query.queryKey[0] === 'auth'
          ),
          timestamp: Date.now(),
        };
        
        localStorage.setItem('react-query-auth-cache', JSON.stringify(authData));
      } catch (error) {
        console.warn('Error persisting auth data:', error);
      }
    },

    restoreClient: async () => {
      try {
        const cached = localStorage.getItem('react-query-auth-cache');
        if (cached) {
          const { queries, timestamp } = JSON.parse(cached);
          
          // Verificar que el cache no sea muy viejo (max 24 horas)
          const isCacheValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
          if (isCacheValid) {
            return { queries };
          }
        }
      } catch (error) {
        console.warn('Error restoring auth data:', error);
      }
      return { queries: [] };
    },

    removeClient: async () => {
      try {
        localStorage.removeItem('react-query-auth-cache');
      } catch (error) {
        console.warn('Error removing auth cache:', error);
      }
    },
  };
};