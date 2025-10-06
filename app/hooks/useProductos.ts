import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '../services/productoService';
import type { CreateProductoDto, ProductoResponseDto, UpdateProductoDto } from '~/models/producto.model';

type ProductosApiResponse = {
  productos: ProductoResponseDto[];
  total: number;
};

export const useProductos = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todos los productos
  const productosQuery = useQuery<ProductosApiResponse, Error>({
    queryKey: ['productos', search],
    queryFn: () => productoService.getProductos(search),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query para obtener un producto por ID
  const useProducto = (id: number) => {
    return useQuery<ProductoResponseDto, Error>({
      queryKey: ['producto', id],
      queryFn: () => productoService.getProductoById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para eliminar producto
  const deleteProductoMutation = useMutation<void, Error, number>({
    mutationFn: (id: number) => productoService.deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  // Mutation para crear producto
  const createProductoMutation = useMutation<
    ProductoResponseDto,
    Error,
    CreateProductoDto
  >({
    mutationFn: productoService.createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  // Mutation para actualizar producto
  const updateProductoMutation = useMutation<
    ProductoResponseDto,
    Error,
    { id: number; data: UpdateProductoDto }
  >({
    mutationFn: ({ id, data }) => productoService.updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  return {
    // Queries
    productosQuery,
    useProducto,
    
    // Mutations
    deleteProducto: deleteProductoMutation.mutate,
    deleteProductoAsync: deleteProductoMutation.mutateAsync,
    isDeleting: deleteProductoMutation.isPending,
    deleteError: deleteProductoMutation.error,
    
    createProducto: createProductoMutation.mutate,
    createProductoAsync: createProductoMutation.mutateAsync,
    isCreating: createProductoMutation.isPending,
    createError: createProductoMutation.error,
    
    updateProducto: updateProductoMutation.mutate,
    updateProductoAsync: updateProductoMutation.mutateAsync,
    updateError: updateProductoMutation.error,
    isUpdating: updateProductoMutation.isPending,
    
    // Estados y datos
    productos: productosQuery.data?.productos || [],
    total: productosQuery.data?.total || 0,
    isLoading: productosQuery.isLoading,
    isError: productosQuery.isError,
    error: productosQuery.error,
    refetch: productosQuery.refetch,
  };
};