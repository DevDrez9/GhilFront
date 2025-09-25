// src/hooks/useParametrosFisicosTelas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parametrosFisicosTelaService } from '../services/parametrosFisicosTelaService';
import type { CreateParametrosFisicosTelaDto, ParametrosFisicosTelaFilters, ParametrosFisicosTelaResponseDto } from '~/models/parametrosFisicosTela';


export const useParametrosFisicosTelas = (filters?: ParametrosFisicosTelaFilters) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los parámetros
  const parametrosQuery = useQuery<ParametrosFisicosTelaResponseDto[], Error>({
    queryKey: ['parametrosFisicosTelas', filters],
    queryFn: () => parametrosFisicosTelaService.getParametrosFisicosTelas(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un parámetro por ID
  const useParametro = (id: number) => {
    return useQuery<ParametrosFisicosTelaResponseDto, Error>({
      queryKey: ['parametroFisicosTela', id],
      queryFn: () => parametrosFisicosTelaService.getParametrosFisicosTelaById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para crear parámetro
  const createParametroMutation = useMutation<
    ParametrosFisicosTelaResponseDto,
    Error,
    CreateParametrosFisicosTelaDto
  >({
    mutationFn: parametrosFisicosTelaService.createParametrosFisicosTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosFisicosTelas'] });
    },
  });

  // Mutation para actualizar parámetro
  const updateParametroMutation = useMutation<
    ParametrosFisicosTelaResponseDto,
    Error,
    { id: number; data: Partial<CreateParametrosFisicosTelaDto> }
  >({
    mutationFn: ({ id, data }) => parametrosFisicosTelaService.updateParametrosFisicosTela(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosFisicosTelas'] });
      queryClient.invalidateQueries({ queryKey: ['parametroFisicosTela'] });
    },
  });

  // Mutation para eliminar parámetro
  const deleteParametroMutation = useMutation<void, Error, number>({
    mutationFn: parametrosFisicosTelaService.deleteParametrosFisicosTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosFisicosTelas'] });
    },
  });

  return {
    // Queries
    parametrosQuery,
    useParametro,
    
    // Mutations - Crear
    createParametro: createParametroMutation.mutate,
    createParametroAsync: createParametroMutation.mutateAsync,
    isCreating: createParametroMutation.isPending,
    createError: createParametroMutation.error,
    
    // Mutations - Actualizar
    updateParametro: updateParametroMutation.mutate,
    updateParametroAsync: updateParametroMutation.mutateAsync,
    isUpdating: updateParametroMutation.isPending,
    updateError: updateParametroMutation.error,
    
    // Mutations - Eliminar
    deleteParametro: deleteParametroMutation.mutate,
    deleteParametroAsync: deleteParametroMutation.mutateAsync,
    isDeleting: deleteParametroMutation.isPending,
    deleteError: deleteParametroMutation.error,
    
    // Estados
    parametros: parametrosQuery.data || [],
    isLoading: parametrosQuery.isLoading,
    isError: parametrosQuery.isError,
    error: parametrosQuery.error,
    refetch: parametrosQuery.refetch,
  };
};