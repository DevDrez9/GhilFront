import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioSucursalService } from '../services/inventarioSucursalService';
import type { CreateInventarioSucursalDto, InventarioSucursalResponseDto } from "~/models/inventarioSucursal";

type InventarioSucursalApiResponse = {
  inventarios: InventarioSucursalResponseDto[];
  total: number;
  
};

// 🛑 1. Define la interfaz de opciones que ahora incluye el filtro de sucursal
interface InventarioQueryOptions {
    searchTerm?: string;
    sucursalId?: number; // Este es el ID que viene del ComboBox
}

export const useInventarioSucursal = (options: InventarioQueryOptions) => {
  const queryClient = useQueryClient();

   const inventarioQuery = useQuery<InventarioSucursalApiResponse, Error>({
        // La clave de consulta debe incluir las opciones para que se refetchee
        queryKey: ['inventarioSucursal', options], 
        
        // 🛑 Lógica de bifurcación en queryFn
        queryFn: async () => {
            if (options.sucursalId !== undefined) {
                // Si hay ID de sucursal, usamos el servicio específico.
                // NOTA: Tu servicio getInventarioBySucursal NO maneja 'search'.
                // Si necesitas buscar dentro de la sucursal, debes actualizar ese servicio.
                const inventario = await inventarioSucursalService.getInventarioBySucursal(options.sucursalId);
                
                // Mapeamos la respuesta para que coincida con InventarioSucursalApiResponse
                return {
                    inventarios: inventario,
                    total: inventario.length, // O tu lógica real de total si la API lo devuelve.
                } as InventarioSucursalApiResponse;
            }
            
            // Si no hay ID de sucursal, usamos el servicio general que maneja la búsqueda.
            return inventarioSucursalService.getInventarioSucursal(options.searchTerm);
        },
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

  // Query para obtener un item de inventario de sucursal por ID
  const useInventarioIdSucursal = (sucursalId: number) => {
    return useQuery<InventarioSucursalResponseDto[], Error>({
      queryKey: ['inventarioSucursalItem', sucursalId],
      queryFn: () => inventarioSucursalService.getInventarioBySucursal(sucursalId),
      enabled: !!sucursalId,
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
    useInventarioIdSucursal,

    useInventarioSucursal,

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
    inventario: inventarioQuery.data?.inventarios || [],
    total: inventarioQuery.data?.total || 0,
    isLoading: inventarioQuery.isLoading,
    isError: inventarioQuery.isError,
    error: inventarioQuery.error,
    refetch: inventarioQuery.refetch,
  };
};