// src/hooks/useTelas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telasService } from '../services/telasService';
import type { CreateTelaDto, TelaFilters, TelaResponseDto } from '~/models/telas.model';

export const useTelas = (filters?: TelaFilters) => {
  const queryClient = useQueryClient();

  // Query para obtener todas las telas
  const telasQuery = useQuery<TelaResponseDto[], Error>({
    queryKey: ['telas', filters],
    queryFn: () => telasService.getTelas(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener una tela por ID
  const useTela = (id: number) => {
    return useQuery<TelaResponseDto, Error>({
      queryKey: ['tela', id],
      queryFn: () => telasService.getTelaById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para crear tela
  const createTelaMutation = useMutation<
    TelaResponseDto,
    Error,
    CreateTelaDto
  >({
    mutationFn: telasService.createTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telas'] });
    },
  });

  // Mutation para actualizar tela
  const updateTelaMutation = useMutation<
    TelaResponseDto,
    Error,
    { id: number; data: Partial<CreateTelaDto> }
  >({
    mutationFn: ({ id, data }) => telasService.updateTela(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telas'] });
      queryClient.invalidateQueries({ queryKey: ['tela'] });
    },
  });

  // Mutation para eliminar tela
  const deleteTelaMutation = useMutation<void, Error, number>({
    mutationFn: telasService.deleteTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telas'] });
    },
  });

  return {
    // Queries
    telasQuery,
    useTela,
    
    // Mutations - Crear
    createTela: createTelaMutation.mutate,
    createTelaAsync: createTelaMutation.mutateAsync,
    isCreating: createTelaMutation.isPending,
    createError: createTelaMutation.error,
    
    // Mutations - Actualizar
    updateTela: updateTelaMutation.mutate,
    updateTelaAsync: updateTelaMutation.mutateAsync,
    isUpdating: updateTelaMutation.isPending,
    updateError: updateTelaMutation.error,
    
    // Mutations - Eliminar
    deleteTela: deleteTelaMutation.mutate,
    deleteTelaAsync: deleteTelaMutation.mutateAsync,
    isDeleting: deleteTelaMutation.isPending,
    deleteError: deleteTelaMutation.error,
    
    // Estados
    telas: telasQuery.data || [],
    isLoading: telasQuery.isLoading,
    isError: telasQuery.isError,
    error: telasQuery.error,
    refetch: telasQuery.refetch,
  };
};