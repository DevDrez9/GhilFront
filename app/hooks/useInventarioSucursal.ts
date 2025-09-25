import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioSucursalService } from '../services/inventarioSucursalService';
import type { CreateInventarioSucursalDto, InventarioSucursalResponseDto } from "~/models/inventarioSucursal";

type InventarioSucursalApiResponse = {
  inventario: InventarioSucursalResponseDto[];
  total: number;
};

export const useInventarioSucursal = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los items de inventario de sucursal
  const inventarioQuery = useQuery<InventarioSucursalApiResponse, Error>({
    queryKey: ['inventarioSucursal', search],
    queryFn: () => inventarioSucursalService.getInventarioSucursal(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un item de inventario de sucursal por ID
  const useInventarioSucursalItem = (id: number) => {
    return useQuery<InventarioSucursalResponseDto, Error>({
      queryKey: ['inventarioSucursalItem', id],
      queryFn: () => inventarioSucursalService.getInventarioSucursalById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar un item de inventario de sucursal
  const deleteInventarioSucursalMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => inventarioSucursalService.deleteInventarioSucursal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioSucursal'] });
    },
  });

  // Mutation para crear un nuevo item de inventario de sucursal
  const createInventarioSucursalMutation = useMutation<
    InventarioSucursalResponseDto,
    Error,
    CreateInventarioSucursalDto
  >({
    mutationFn: inventarioSucursalService.createInventarioSucursal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioSucursal'] });
    },
  });

  // Mutation para actualizar un item de inventario de sucursal
  const updateInventarioSucursalMutation = useMutation<
    InventarioSucursalResponseDto,
    Error,
    { id: number; data: Partial<CreateInventarioSucursalDto> }
  >({
    mutationFn: ({ id, data }) => inventarioSucursalService.updateInventarioSucursal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioSucursal'] });
    },
  });

  return {
    // Queries
    inventarioQuery,
    useInventarioSucursalItem,

    // Mutations
    deleteInventarioSucursal: deleteInventarioSucursalMutation.mutate,
    deleteInventarioSucursalAsync: deleteInventarioSucursalMutation.mutateAsync,
    isDeleting: deleteInventarioSucursalMutation.isPending,
    deleteError: deleteInventarioSucursalMutation.error,

    createInventarioSucursal: createInventarioSucursalMutation.mutate,
    createInventarioSucursalAsync: createInventarioSucursalMutation.mutateAsync,
    isCreating: createInventarioSucursalMutation.isPending,
    createError: createInventarioSucursalMutation.error,

    updateInventarioSucursal: updateInventarioSucursalMutation.mutate,
    updateInventarioSucursalAsync: updateInventarioSucursalMutation.mutateAsync,
    isUpdating: updateInventarioSucursalMutation.isPending,

    // Estados y datos
    inventario: inventarioQuery.data?.inventario || [],
    total: inventarioQuery.data?.total || 0,
    isLoading: inventarioQuery.isLoading,
    isError: inventarioQuery.isError,
    error: inventarioQuery.error,
    refetch: inventarioQuery.refetch,
  };
};