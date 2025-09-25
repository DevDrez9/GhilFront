// src/hooks/useProveedores.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proveedorService } from '../services/proveedorService';
import type { CreateProveedorDto, ProveedorResponseDto } from '~/models/proveedor.model';

export const useProveedores = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los proveedores
  const proveedoresQuery = useQuery<ProveedorResponseDto[], Error>({
    queryKey: ['proveedores', search],
    queryFn: () => proveedorService.getProveedores(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un proveedor por ID
  const useProveedor = (id: number) => {
    return useQuery<ProveedorResponseDto, Error>({
      queryKey: ['proveedor', id],
      queryFn: () => proveedorService.getProveedorById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // ✅ Mutation para eliminar proveedor (CORREGIDA)
  const deleteProveedorMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => proveedorService.deleteProveedor(id), // ✅ Correcto
    onSuccess: () => {
      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });

  // ✅ Mutation para crear proveedor (opcional)
  const createProveedorMutation = useMutation<
    ProveedorResponseDto,
    Error,
    CreateProveedorDto
  >({
    mutationFn: proveedorService.createProveedor,
    onSuccess: () => {
      // Invalidar la query para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });


  // ✅ Mutation para actualizar proveedor (opcional)
  const updateProveedorMutation = useMutation<
    ProveedorResponseDto,
    Error,
    { id: number; data: Partial<CreateProveedorDto> }
  >({
    mutationFn: ({ id, data }) => proveedorService.updateProveedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });

  return {
    // Queries
    proveedoresQuery,
    useProveedor,
    
    // ✅ Mutations corregidas
    deleteProveedor: deleteProveedorMutation.mutate,
    deleteProveedorAsync: deleteProveedorMutation.mutateAsync,
    isDeleting: deleteProveedorMutation.isPending,
    deleteError: deleteProveedorMutation.error,
    
    // ✅ Mutations opcionales
     createProveedor: createProveedorMutation.mutate,
    createProveedorAsync: createProveedorMutation.mutateAsync,
    isCreating: createProveedorMutation.isPending,
    createError: createProveedorMutation.error,
    
    updateProveedor: updateProveedorMutation.mutate,
    updateProveedorAsync: updateProveedorMutation.mutateAsync,
    isUpdating: updateProveedorMutation.isPending,
    
    // Estados
    proveedores: proveedoresQuery.data || [],
    isLoading: proveedoresQuery.isLoading,
    isError: proveedoresQuery.isError,
    error: proveedoresQuery.error,
    refetch: proveedoresQuery.refetch,


    
  };
};