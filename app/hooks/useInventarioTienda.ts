import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioTiendaService } from '../services/inventarioTiendaService';
import type { CreateInventarioTiendaDto, InventarioTiendaResponseDto } from '~/models/inventarioTienda';

type InventarioTiendaApiResponse = {
  inventario: InventarioTiendaResponseDto[];
  total: number;
};

export const useInventarioTienda = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los items de inventario de tienda
  const inventarioQuery = useQuery<InventarioTiendaApiResponse, Error>({
    queryKey: ['inventarioTienda', search],
    queryFn: () => inventarioTiendaService.getInventarioTienda(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un item de inventario de tienda por ID
  const useInventarioTiendaItem = (id: number) => {
    return useQuery<InventarioTiendaResponseDto, Error>({
      queryKey: ['inventarioTiendaItem', id],
      queryFn: () => inventarioTiendaService.getInventarioTiendaById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar un item de inventario de tienda
  const deleteInventarioTiendaMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => inventarioTiendaService.deleteInventarioTienda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTienda'] });
    },
  });

  // Mutation para crear un nuevo item de inventario de tienda
  const createInventarioTiendaMutation = useMutation<
    InventarioTiendaResponseDto,
    Error,
    CreateInventarioTiendaDto
  >({
    mutationFn: inventarioTiendaService.createInventarioTienda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTienda'] });
    },
  });

  // Mutation para actualizar un item de inventario de tienda
  const updateInventarioTiendaMutation = useMutation<
    InventarioTiendaResponseDto,
    Error,
    { id: number; data: Partial<CreateInventarioTiendaDto> }
  >({
    mutationFn: ({ id, data }) => inventarioTiendaService.updateInventarioTienda(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventarioTienda'] });
    },
  });

  return {
    // Queries
    inventarioQuery,
    useInventarioTiendaItem,

    // Mutations
    deleteInventarioTienda: deleteInventarioTiendaMutation.mutate,
    deleteInventarioTiendaAsync: deleteInventarioTiendaMutation.mutateAsync,
    isDeleting: deleteInventarioTiendaMutation.isPending,
    deleteError: deleteInventarioTiendaMutation.error,

    createInventarioTienda: createInventarioTiendaMutation.mutate,
    createInventarioTiendaAsync: createInventarioTiendaMutation.mutateAsync,
    isCreating: createInventarioTiendaMutation.isPending,
    createError: createInventarioTiendaMutation.error,

    updateInventarioTienda: updateInventarioTiendaMutation.mutate,
    updateInventarioTiendaAsync: updateInventarioTiendaMutation.mutateAsync,
    isUpdating: updateInventarioTiendaMutation.isPending,

    // Estados y datos
    inventario: inventarioQuery.data?.inventario || [],
    total: inventarioQuery.data?.total || 0,
    isLoading: inventarioQuery.isLoading,
    isError: inventarioQuery.isError,
    error: inventarioQuery.error,
    refetch: inventarioQuery.refetch,
  };
};