// En ~/hooks/useUsuarios.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '~/services/usuarioService';
import { UsuarioResponseDto,type UsuarioApiResponse,type UsuarioQueryOptions, CreateUsuarioDto } from '~/models/usuario';

interface UseUsuariosOptions extends UsuarioQueryOptions {
    enabled?: boolean;
}

export const useUsuarios = (options: UseUsuariosOptions = {}) => {
    const queryClient = useQueryClient();
    const { enabled = true, ...queryOptions } = options;

    // --- CONSULTA: Obtener Usuarios ---
       const usuariosQuery = useQuery<UsuarioApiResponse, Error>({
        queryKey: ['usuarios', JSON.stringify(queryOptions)],
        queryFn: () => usuarioService.getUsuarios(queryOptions),
        enabled: enabled,
        
        // ✅ Mapeo simple: La data es el array de usuarios.
        // Solo aplicamos el constructor para las instancias de clase (fechas, etc.)
        select: (data) => data.map(u => new UsuarioResponseDto(u)),
        
        staleTime: 5 * 60 * 1000,
    });
    // --- MUTACIÓN: Crear Usuario ---
   const createUsuarioMutation = useMutation<
    UsuarioResponseDto, 
    Error,              
    CreateUsuarioDto    
  >({
    mutationFn: (data) => usuarioService.createUsuario(data),
    
    onSuccess: () => {
      // Invalida la lista de usuarios para que la tabla se refresque
      queryClient.invalidateQueries({ queryKey: ['usuarios'] }); 
    },
    
    onError: (error) => {
      console.error("Error al crear el usuario:", error.message);
    }
  });

    return {
        // Queries
       usuarios: usuariosQuery.data || [], 
        total: usuariosQuery.data?.length || 0, 
        
        isLoading: usuariosQuery.isLoading,
        isError: usuariosQuery.isError,
        error: usuariosQuery.error,
        refetch: usuariosQuery.refetch,

        // Mutations
        createUsuario: createUsuarioMutation.mutateAsync,
        isCreating: createUsuarioMutation.isPending,
        createError: createUsuarioMutation.error,
        // Añadir mutaciones de update y delete si las implementas
    };
};