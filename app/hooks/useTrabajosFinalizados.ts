import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trabajoFinalizadoService } from '../services/trabajoFinalizadoService';
import type { CreateTrabajoFinalizadoDto, TrabajoFinalizadoResponseDto } from '~/models/trabajos-finalizados';


type TrabajosFinalizadosApiResponse = {
  trabajos: TrabajoFinalizadoResponseDto[];
  total: number;
};

export const useTrabajosFinalizados = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los trabajos terminados
  const trabajosFinalizadosQuery = useQuery<TrabajosFinalizadosApiResponse, Error>({
    queryKey: ['trabajosFinalizados', search],
    queryFn: () => trabajoFinalizadoService.getTrabajosFinalizados(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un trabajo terminado por ID
  const useTrabajoFinalizado = (id: number) => {
    return useQuery<TrabajoFinalizadoResponseDto, Error>({
      queryKey: ['trabajoFinalizado', id],
      queryFn: () => trabajoFinalizadoService.getTrabajoFinalizadoById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar un trabajo terminado
  const deleteTrabajoFinalizadoMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => trabajoFinalizadoService.deleteTrabajoFinalizado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajosFinalizados'] });
    },
  });

  // Mutation para crear un trabajo terminado
  const createTrabajoFinalizadoMutation = useMutation<
    TrabajoFinalizadoResponseDto,
    Error,
    CreateTrabajoFinalizadoDto
  >({
    mutationFn: trabajoFinalizadoService.createTrabajoFinalizado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajosFinalizados'] });
    },
  });

  // Mutation para actualizar un trabajo terminado
  const updateTrabajoFinalizadoMutation = useMutation<
    TrabajoFinalizadoResponseDto,
    Error,
    { id: number; data: Partial<CreateTrabajoFinalizadoDto> }
  >({
    mutationFn: ({ id, data }) => trabajoFinalizadoService.updateTrabajoFinalizado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajosFinalizados'] });
    },
  });

  return {
    // Queries
    trabajosFinalizadosQuery,
    useTrabajoFinalizado,

    // Mutations
    deleteTrabajoFinalizado: deleteTrabajoFinalizadoMutation.mutate,
    deleteTrabajoFinalizadoAsync: deleteTrabajoFinalizadoMutation.mutateAsync,
    isDeleting: deleteTrabajoFinalizadoMutation.isPending,
    deleteError: deleteTrabajoFinalizadoMutation.error,

    createTrabajoFinalizado: createTrabajoFinalizadoMutation.mutate,
    createTrabajoFinalizadoAsync: createTrabajoFinalizadoMutation.mutateAsync,
    isCreating: createTrabajoFinalizadoMutation.isPending,
    createError: createTrabajoFinalizadoMutation.error,

    updateTrabajoFinalizado: updateTrabajoFinalizadoMutation.mutate,
    updateTrabajoFinalizadoAsync: updateTrabajoFinalizadoMutation.mutateAsync,
    isUpdating: updateTrabajoFinalizadoMutation.isPending,

    // Estados y datos
    trabajos: trabajosFinalizadosQuery.data?.trabajos || [],
    total: trabajosFinalizadosQuery.data?.total || 0,
    isLoading: trabajosFinalizadosQuery.isLoading,
    isError: trabajosFinalizadosQuery.isError,
    error: trabajosFinalizadosQuery.error,
    refetch: trabajosFinalizadosQuery.refetch,
  };
};