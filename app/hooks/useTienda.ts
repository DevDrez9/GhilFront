// ~/hooks/useTienda.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiendaService } from '~/services/tiendaService';
import { TiendaDto, TiendaResponseDto } from '~/models/tienda';

export const TIENDA_QUERY_KEY = ['tienda-principal'];

export const useTienda = () => {
    const queryClient = useQueryClient();
    
    // 1. Consulta: Obtiene la tienda (o null si no existe)
    const tiendaQuery = useQuery<TiendaResponseDto | null, Error>({
        queryKey: TIENDA_QUERY_KEY,
        queryFn: tiendaService.getTienda,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
        retry: 1,
    });
    
    // 2. Mutación de Creación
    const createMutation = useMutation<TiendaResponseDto, Error, TiendaDto>({
        mutationFn: tiendaService.createTienda,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY });
        },
    });

    // 3. Mutación de Actualización
    const updateMutation = useMutation<TiendaResponseDto, Error, { id: number, data: TiendaDto }>({
        mutationFn: ({ id, data }) => tiendaService.updateTienda(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY });
        },
    });

    return {
        // Lectura
        tienda: tiendaQuery.data,
        isLoading: tiendaQuery.isLoading,
        isInitialLoading: tiendaQuery.isInitialLoading,

        // Mutaciones
        createTienda: createMutation.mutateAsync,
        updateTienda: updateMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending,
        mutationError: createMutation.error || updateMutation.error,
        
        // ID del registro
        tiendaId: tiendaQuery.data?.id,
    };
};