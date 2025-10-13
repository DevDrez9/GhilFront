// En ~/hooks/usePedidos.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CarritoResponseDto, CarritoEstado } from '~/models/carrito';
import { carritoService } from '~/services/carritoService';

// Interfaz para las opciones de consulta
interface CarritosQueryOptions {
    tiendaId: number;
    estadoFiltro: CarritoEstado;
}

export const usePedidos = (options: CarritosQueryOptions) => {
    const queryClient = useQueryClient();
    const { tiendaId, estadoFiltro } = options;

    // --- CONSULTA: Obtener Carritos/Pedidos ---
    const pedidosQuery = useQuery<CarritoResponseDto[], Error>({
        queryKey: ['pedidos', tiendaId, estadoFiltro], 
        queryFn: () => carritoService.findCarritosByTiendaAndState(tiendaId, estadoFiltro),
        enabled: !!tiendaId, 
        staleTime: 60 * 1000, 
    });
    
    // --- MUTACIÓN: Finalizar Pedido ---
    const completeMutation = useMutation<CarritoResponseDto, Error, number>({
        mutationFn: (id: number) => carritoService.complete(id),
        onSuccess: () => {
            // Invalida la lista de pedidos para recargar
            queryClient.invalidateQueries({ queryKey: ['pedidos'] }); 
        },
        onError: (error) => {
            console.error("Error al finalizar el pedido:", error);
        }
    });

    return {
        data: pedidosQuery.data || [],
        isLoading: pedidosQuery.isLoading,
        isError: pedidosQuery.isError,
        error: pedidosQuery.error,

        completePedidoAsync: completeMutation.mutateAsync,
        isCompleting: completeMutation.isPending,
        completionError: completeMutation.error,
    };
};