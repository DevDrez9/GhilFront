import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriaService } from '../services/categoriaService';
import type { CreateCategoriaDto, CategoriaResponseDto, CreateSubcategoriaDto, SubcategoriaResponseDto } from '~/models/categoria';

type CategoriaApiResponse = {
  categorias: CategoriaResponseDto[]; 
  total: number;
};

export const useCategorias = (search?: string) => {
  const queryClient = useQueryClient();

  // Query para obtener todas las categorías
  

  const categoriasQuery = useQuery({
    queryKey: ['categorias', search],
    queryFn: () =>categoriaService.getCategorias(search),
    // Al ser un array directo, no necesitamos un 'select' complejo.
});

  // Query para obtener una categoría por ID
  const useCategoria = (id: number) => {
    return useQuery<CategoriaResponseDto, Error>({
      queryKey: ['categoria', id],
      queryFn: () => categoriaService.getCategoriaById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  };

  // Mutation para crear categoría
  const createCategoriaMutation = useMutation<CategoriaResponseDto, Error, CreateCategoriaDto>({
    mutationFn: categoriaService.createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // Mutation para actualizar categoría
  const updateCategoriaMutation = useMutation<
    CategoriaResponseDto,
    Error,
    { id: number; data: Partial<CreateCategoriaDto> }
  >({
    mutationFn: ({ id, data }) => categoriaService.updateCategoria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  // Mutation para eliminar categoría
  const deleteCategoriaMutation = useMutation<void, Error, number>({
    mutationFn: categoriaService.deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
  
  // **MUTATION PARA AGREGAR SUBCATEGORÍA**
 const addSubcategoriaMutation = useMutation({
    // El mutationFn ahora espera un solo objeto que es CreateSubcategoriaDto
    mutationFn: (data: CreateSubcategoriaDto) => categoriaService.addSubcategoria(data), 
    
    // Configuración de onMutate, onSuccess, etc.
    // ... (El resto de la lógica de invalidación de cache y optimismo debe ser adaptada)
});

  // **MUTATION PARA QUITAR SUBCATEGORÍA**
  const removeSubcategoriaMutation = useMutation<void, Error, { categoriaId: number, subcategoriaId: number }>({
    mutationFn: ({ subcategoriaId }) => categoriaService.removeSubcategoria(subcategoriaId),
    onSuccess: (_, { categoriaId }) => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categoria', categoriaId] });
    },
  });

  return {
    // Queries
    categoriasQuery,
    useCategoria,
    
    // Mutations de Categoría
    createCategoria: createCategoriaMutation.mutate,
    updateCategoria: updateCategoriaMutation.mutate,
    deleteCategoria: deleteCategoriaMutation.mutate,


     // ✅ ADD THESE LINES to expose the creation status
    isCreating: createCategoriaMutation.isPending,
    createError: createCategoriaMutation.error,

    // ✅ ADD THESE LINES:
    isDeleting: deleteCategoriaMutation.isPending, // isPending is the correct TanStack Query property for loading status
    deleteError: deleteCategoriaMutation.error,
    
    // Mutations de Subcategoría
    addSubcategoria: addSubcategoriaMutation.mutate,
    removeSubcategoria: removeSubcategoriaMutation.mutate,
    isAddingSub: addSubcategoriaMutation.isPending,
    isRemovingSub: removeSubcategoriaMutation.isPending,
    isErrorSub:removeSubcategoriaMutation.isError,
    errorSub:removeSubcategoriaMutation.error,  
    
    // Estados y datos
     categorias: categoriasQuery.data || [],
    total: categoriasQuery.data || 0,
    isLoading: categoriasQuery.isLoading,
    isError: categoriasQuery.isError,
    error: categoriasQuery.error,
    refetch: categoriasQuery.refetch,
  };
};