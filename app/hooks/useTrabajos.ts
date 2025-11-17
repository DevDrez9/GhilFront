import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CompletarTrabajoDto, CreateTrabajoDto, TrabajoResponseDto } from '~/models/trabajo';
import { trabajoService } from '~/services/trabajoSerice';

type TrabajoApiResponse = {
  trabajos: TrabajoResponseDto[];
  total: number;
};
type CompleteTrabajoVariables = {
    id: number;
    data: CompletarTrabajoDto; 
}

type GetTrabajosFilters = {
  estado?: string;
  search?: string;
};

type UpdateTrabajoVariables = { id: number; data: Partial<CreateTrabajoDto> };
export const useTrabajos = (filters: GetTrabajosFilters = {}) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los trabajos
  const trabajosQuery = useQuery<TrabajoApiResponse, Error>({
    // 3. ¡MUY IMPORTANTE! Añade 'filters' a la queryKey.
    //    Así, React Query sabe que si 'filters' cambia, debe recargar los datos.
    queryKey: ['trabajos', filters],
    // 4. Pasa los filtros a la función del servicio.
    queryFn: () => trabajoService.getTrabajos(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  // Mutation para crear trabajo
  const createTrabajoMutation = useMutation<TrabajoResponseDto, Error, CreateTrabajoDto>({
    mutationFn: trabajoService.createTrabajo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  // Mutation para actualizar trabajo
  const updateTrabajoMutation = useMutation<TrabajoResponseDto, Error, UpdateTrabajoVariables>({
    mutationFn: ({ id, data }) => trabajoService.updateTrabajo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  // === NUEVA MUTACIÓN PARA INICIAR TRABAJO ===
  const iniciarTrabajoMutation = useMutation<TrabajoResponseDto, Error, number>({
    mutationFn: (id) => trabajoService.iniciarTrabajo(id),
    onSuccess: (updatedTrabajo) => {
        queryClient.invalidateQueries({ queryKey: ['trabajos'] });
        queryClient.setQueryData(['trabajo', updatedTrabajo.id], updatedTrabajo);
    },
    onError: (error) => {
        console.error("Error al iniciar el trabajo:", error.message);
    }
  });

  // Mutation para completar trabajo
  const completeTrabajoMutation = useMutation<TrabajoResponseDto, Error, CompleteTrabajoVariables>({
    mutationFn: ({ id, data }) => trabajoService.completeTrabajo(id, data),
    onSuccess: (updatedTrabajo) => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      queryClient.setQueryData(['trabajo', updatedTrabajo.id], updatedTrabajo);
    },
    onError: (error) => {
      console.error("Error al finalizar el trabajo:", error.message);
    }
  });

  // Mutation para eliminar trabajo
  const deleteTrabajoMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => trabajoService.deleteTrabajo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  return {
    trabajos: trabajosQuery.data?.trabajos || [],
    total: trabajosQuery.data?.total || 0,
    isLoading: trabajosQuery.isLoading,
    isError: trabajosQuery.isError,
    error: trabajosQuery.error,
    refetch: trabajosQuery.refetch,

    createTrabajo: createTrabajoMutation.mutateAsync,
    isCreating: createTrabajoMutation.isPending,

    updateTrabajo: updateTrabajoMutation.mutateAsync,
    isUpdating: updateTrabajoMutation.isPending,

    // === EXPOSICIÓN DE LA NUEVA MUTACIÓN ===
    iniciarTrabajo: iniciarTrabajoMutation.mutateAsync,
    isStarting: iniciarTrabajoMutation.isPending,

    completeTrabajo: completeTrabajoMutation.mutateAsync,
    isCompleting: completeTrabajoMutation.isPending,
    completeError: completeTrabajoMutation.error,


    deleteTrabajo: deleteTrabajoMutation.mutateAsync,
    isDeleting: deleteTrabajoMutation.isPending,
  };
};