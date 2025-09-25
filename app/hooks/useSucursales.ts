import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sucursalService } from '../services/sucursalService';
import type { CreateSucursalDto, SucursalResponseDto } from '~/models/sucursal';

type SucursalApiResponse = {
  sucursales: SucursalResponseDto[];
  total: number;
};

export const useSucursales = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todas las sucursales
  const sucursalesQuery = useQuery<SucursalApiResponse, Error>({
    queryKey: ['sucursales', search],
    queryFn: () => sucursalService.getSucursales(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener una sucursal por ID
  const useSucursal = (id: number) => {
    return useQuery<SucursalResponseDto, Error>({
      queryKey: ['sucursal', id],
      queryFn: () => sucursalService.getSucursalById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar una sucursal
  const deleteSucursalMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => sucursalService.deleteSucursal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
  });

  // Mutation para crear una nueva sucursal
  const createSucursalMutation = useMutation<
    SucursalResponseDto,
    Error,
    CreateSucursalDto
  >({
    mutationFn: sucursalService.createSucursal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
  });

  // Mutation para actualizar una sucursal
  const updateSucursalMutation = useMutation<
    SucursalResponseDto,
    Error,
    { id: number; data: Partial<CreateSucursalDto> }
  >({
    mutationFn: ({ id, data }) => sucursalService.updateSucursal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sucursales'] });
    },
  });

  return {
    // Queries
    sucursalesQuery,
    useSucursal,

    // Mutations
    deleteSucursal: deleteSucursalMutation.mutate,
    deleteSucursalAsync: deleteSucursalMutation.mutateAsync,
    isDeleting: deleteSucursalMutation.isPending,
    deleteError: deleteSucursalMutation.error,

    createSucursal: createSucursalMutation.mutate,
    createSucursalAsync: createSucursalMutation.mutateAsync,
    isCreating: createSucursalMutation.isPending,
    createError: createSucursalMutation.error,

    updateSucursal: updateSucursalMutation.mutate,
    updateSucursalAsync: updateSucursalMutation.mutateAsync,
    isUpdating: updateSucursalMutation.isPending,

    // Estados y datos
    sucursales: sucursalesQuery.data?.sucursales || [],
    total: sucursalesQuery.data?.total || 0,
    isLoading: sucursalesQuery.isLoading,
    isError: sucursalesQuery.isError,
    error: sucursalesQuery.error,
    refetch: sucursalesQuery.refetch,
  };
};