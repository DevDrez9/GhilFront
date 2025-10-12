// src/hooks/useCostureros.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CostureroResponseDto, CreateCostureroDto } from '~/models/costureros';
import { costureroService } from '~/services/costurerosService';


export const useCostureros = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los costureros
  const costurerosQuery = useQuery<CostureroResponseDto[], Error>({
    queryKey: ['costureros', search],
    queryFn: () => costureroService.getCostureros(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un costurero por ID
  const useCosturero = (id: number) => {
    return useQuery<CostureroResponseDto, Error>({
      queryKey: ['costurero', id],
      queryFn: () => costureroService.getCostureroById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar costurero
  const deleteCostureroMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => costureroService.deleteCosturero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costureros'] });
    },
  });

  // Mutation para crear costurero
  const createCostureroMutation = useMutation<
    CostureroResponseDto,
    Error,
    CreateCostureroDto
  >({
    mutationFn: costureroService.createCosturero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costureros'] });
    },
  });

  // Mutation para actualizar costurero
  const updateCostureroMutation = useMutation<
    CostureroResponseDto,
    Error,
    { id: number; data: Partial<CreateCostureroDto> }
  >({
    mutationFn: ({ id, data }) => costureroService.updateCosturero(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costureros'] });
    },
  });

  return {
    // Queries
    costurerosQuery,
    useCosturero,
    
    // Mutations
    deleteCosturero: deleteCostureroMutation.mutate,
    deleteCostureroAsync: deleteCostureroMutation.mutateAsync,
    isDeleting: deleteCostureroMutation.isPending,
    deleteError: deleteCostureroMutation.error,
    
    createCosturero: createCostureroMutation.mutate,
    createCostureroAsync: createCostureroMutation.mutateAsync,
    isCreating: createCostureroMutation.isPending,
    createError: createCostureroMutation.error,
    
    updateCosturero: updateCostureroMutation.mutate,
    updateCostureroAsync: updateCostureroMutation.mutateAsync,
    isUpdating: updateCostureroMutation.isPending,
    updateError: updateCostureroMutation.error,   
    
    // Estados
    costureros: costurerosQuery.data || [],
    isLoading: costurerosQuery.isLoading,
    isError: costurerosQuery.isError,
    error: costurerosQuery.error,
    refetch: costurerosQuery.refetch,
  };
};