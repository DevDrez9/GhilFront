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

export const useTrabajos = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los trabajos
  const trabajosQuery = useQuery<TrabajoApiResponse, Error>({
    queryKey: ['trabajos', search],
    queryFn: () => trabajoService.getTrabajos(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un trabajo por ID
  const useTrabajo = (id: number) => {
    return useQuery<TrabajoResponseDto, Error>({
      queryKey: ['trabajo', id],
      queryFn: () => trabajoService.getTrabajoById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar trabajo
  const deleteTrabajoMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => trabajoService.deleteTrabajo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  // Mutation para crear trabajo
  const createTrabajoMutation = useMutation<
    TrabajoResponseDto,
    Error,
    CreateTrabajoDto
  >({
    mutationFn: trabajoService.createTrabajo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  // Mutation para actualizar trabajo
  const updateTrabajoMutation = useMutation<
    TrabajoResponseDto,
    Error,
    { id: number; data: Partial<CreateTrabajoDto> }
  >({
    mutationFn: ({ id, data }) => trabajoService.updateTrabajo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
    },
  });

  const completeTrabajoMutation = useMutation<
    TrabajoResponseDto,       // Devuelve el trabajo actualizado
    Error,                    // Tipo de error
    CompleteTrabajoVariables  // Espera el ID y el DTO
  >({
    mutationFn: ({ id, data }) => trabajoService.completeTrabajo(id, data),
    
    onSuccess: (updatedTrabajo) => {
      // Invalida la lista de trabajos
      queryClient.invalidateQueries({ queryKey: ['trabajos'] });
      // Opcionalmente, actualiza el trabajo individual en caché
      queryClient.setQueryData(['trabajos', updatedTrabajo.id], updatedTrabajo); 
    },
    
    onError: (error) => {
      console.error("Error al finalizar el trabajo:", error.message);
    }
  });
  

  return {
    // Queries
    trabajosQuery,
    useTrabajo,
    
    // Mutations
    deleteTrabajo: deleteTrabajoMutation.mutate,
    deleteTrabajoAsync: deleteTrabajoMutation.mutateAsync,
    isDeleting: deleteTrabajoMutation.isPending,
    deleteError: deleteTrabajoMutation.error,
    
    createTrabajo: createTrabajoMutation.mutate,
    createTrabajoAsync: createTrabajoMutation.mutateAsync,
    isCreating: createTrabajoMutation.isPending,
    createError: createTrabajoMutation.error,
    
    updateTrabajo: updateTrabajoMutation.mutate,
    updateTrabajoAsync: updateTrabajoMutation.mutateAsync,
    isUpdating: updateTrabajoMutation.isPending,
    
    // Estados y datos
    trabajos: trabajosQuery.data?.trabajos || [],
    total: trabajosQuery.data?.total || 0,
    isLoading: trabajosQuery.isLoading,
    isError: trabajosQuery.isError,
    error: trabajosQuery.error,
    refetch: trabajosQuery.refetch,

    // NUEVAS EXPOSICIONES: Completar Trabajo
     completeTrabajo: completeTrabajoMutation.mutateAsync, 
    isCompleting: completeTrabajoMutation.isPending,
    completeError: completeTrabajoMutation.error,
  };
};