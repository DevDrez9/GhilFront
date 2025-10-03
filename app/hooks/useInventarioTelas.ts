// src/hooks/useInventarioTelas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioTelasService } from '../services/inventarioTelasService';
import type { CreateInventarioTelaDto, InventarioTelaFilters, InventarioTelaResponseDto } from '~/models/inventarioTelas';


export const useInventarioTelas = (filters?: InventarioTelaFilters) => {
  const queryClient = useQueryClient();

  // Query para obtener todo el inventario
  const inventarioQuery = useQuery<InventarioTelaResponseDto[], Error>({
    queryKey: ['inventarioTelas', filters],
    queryFn: () => inventarioTelasService.getInventarioTelas(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
  const createManyInventarioTelaMutation = useMutation<
    InventarioTelaResponseDto[], // Tipo de dato que devuelve la función (un array)
    Error,                       // Tipo de dato del error
    CreateInventarioTelaDto[]    // Tipo de dato que espera la función (un array de DTOs)
  >({
    mutationFn: inventarioTelasService.createMany,
    
    onSuccess: () => {
      // ✅ Si la creación es exitosa, invalida la caché de la lista principal de inventario.
      queryClient.invalidateQueries({ queryKey: ['inventarioTelas'] });
    },
    
    onError: (error) => {
      // ❌ Muestra el error en la consola si ocurre
      console.error("Error al crear el inventario de tela masivo:", error.message);
    }
  });

  // Query para obtener un item del inventario por ID
  const useInventarioItem = (id: number) => {
    return useQuery<InventarioTelaResponseDto, Error>({
      queryKey: ['inventarioTela', id],
      queryFn: () => inventarioTelasService.getInventarioTelaById(id),
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };

  // Query para estadísticas
  const statsQuery = useQuery<any, Error>({
    queryKey: ['inventarioStats'],
    queryFn: inventarioTelasService.getInventarioStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Mutation para crear item en el inventario
  const createInventarioMutation = useMutation<
    InventarioTelaResponseDto,
    Error,
    CreateInventarioTelaDto
  >({
    mutationFn: inventarioTelasService.createInventarioTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTelas'] });
      queryClient.invalidateQueries({ queryKey: ['inventarioStats'] });
    },
  });

  // Mutation para actualizar item del inventario
  const updateInventarioMutation = useMutation<
    InventarioTelaResponseDto,
    Error,
    { id: number; data: Partial<CreateInventarioTelaDto> }
  >({
    mutationFn: ({ id, data }) => inventarioTelasService.updateInventarioTela(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTelas'] });
      queryClient.invalidateQueries({ queryKey: ['inventarioTela'] });
      queryClient.invalidateQueries({ queryKey: ['inventarioStats'] });
    },
  });

  // Mutation para eliminar item del inventario
  const deleteInventarioMutation = useMutation<void, Error, number>({
    mutationFn: inventarioTelasService.deleteInventarioTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTelas'] });
      queryClient.invalidateQueries({ queryKey: ['inventarioStats'] });
    },
  });

  return {
    // Queries
    inventarioQuery,
    useInventarioItem,
    statsQuery,
    
    // Mutations - Crear
    createInventario: createInventarioMutation.mutate,
    createInventarioAsync: createInventarioMutation.mutateAsync,
    isCreating: createInventarioMutation.isPending,
    createError: createInventarioMutation.error,
    
    // Mutations - Actualizar
    updateInventario: updateInventarioMutation.mutate,
    updateInventarioAsync: updateInventarioMutation.mutateAsync,
    isUpdating: updateInventarioMutation.isPending,
    updateError: updateInventarioMutation.error,
    
    // Mutations - Eliminar
    deleteInventario: deleteInventarioMutation.mutate,
    deleteInventarioAsync: deleteInventarioMutation.mutateAsync,
    isDeleting: deleteInventarioMutation.isPending,
    deleteError: deleteInventarioMutation.error,
    
    // Estados
    inventario: inventarioQuery.data || [],
    isLoading: inventarioQuery.isLoading,
    isError: inventarioQuery.isError,
    error: inventarioQuery.error,
    refetch: inventarioQuery.refetch,

    // Stats
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,


      createManyInventarioTela: createManyInventarioTelaMutation.mutateAsync,
    
  };
};