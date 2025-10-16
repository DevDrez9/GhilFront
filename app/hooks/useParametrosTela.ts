import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { CreateParametrosTelaDto, ParametrosTelaResponseDto } from '~/models/ParametrosTela';
import { parametrosTelaService } from '~/services/parametrosTelaService';


type ParametrosTelaApiResponse = {
  parametros: ParametrosTelaResponseDto[];
  total: number;
};

export const useParametrosTela = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los parámetros de tela
  const parametrosTelaQuery = useQuery<ParametrosTelaApiResponse, Error>({
    queryKey: ['parametrosTela', search],
    queryFn: () => parametrosTelaService.getParametrosTela(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un parámetro de tela por ID
  const useParametroTela = (id: number) => {
    return useQuery<ParametrosTelaResponseDto, Error>({
      queryKey: ['parametroTela', id],
      queryFn: () => parametrosTelaService.getParametroTelaById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar parámetro de tela
  const deleteParametroTelaMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => parametrosTelaService.deleteParametroTela(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosTela'] });
    },
  });

  // Mutation para crear parámetro de tela
  const createParametroTelaMutation = useMutation<
    ParametrosTelaResponseDto,
    Error,
    CreateParametrosTelaDto
  >({
    mutationFn: parametrosTelaService.createParametroTela,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosTela'] });
    },
  });

  // Mutation para actualizar parámetro de tela
  const updateParametroTelaMutation = useMutation<
    ParametrosTelaResponseDto,
    Error,
    { id: number; data: Partial<CreateParametrosTelaDto> }
  >({
    mutationFn: ({ id, data }) => parametrosTelaService.updateParametroTela(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametrosTela'] });
    },
  });

  return {
    // Queries
    parametrosTelaQuery,
    useParametroTela,
    
    // Mutations
    deleteParametroTela: deleteParametroTelaMutation.mutate,
    deleteParametroTelaAsync: deleteParametroTelaMutation.mutateAsync,
    isDeleting: deleteParametroTelaMutation.isPending,
    deleteError: deleteParametroTelaMutation.error,
    
    createParametroTela: createParametroTelaMutation.mutate,
    createParametroTelaAsync: createParametroTelaMutation.mutateAsync,
    isCreating: createParametroTelaMutation.isPending,
    createError: createParametroTelaMutation.error,
    
    updateParametroTela: updateParametroTelaMutation.mutate,
    updateParametroTelaAsync: updateParametroTelaMutation.mutateAsync,
    isUpdating: updateParametroTelaMutation.isPending,
    updateError: updateParametroTelaMutation.error,
    
    // Estados y datos
    parametros: parametrosTelaQuery.data?.parametros || [],
    total: parametrosTelaQuery.data?.total || 0,
    isLoading: parametrosTelaQuery.isLoading,
    isError: parametrosTelaQuery.isError,
    error: parametrosTelaQuery.error,
    refetch: parametrosTelaQuery.refetch,
  };
};