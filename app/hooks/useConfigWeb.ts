// ~/hooks/useConfigWeb.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configWebService } from '~/services/configWebService';
import { CreateConfigWebDto,type ConfigWebResponseDto,type UpdateConfigWebBase64Dto } from '~/models/configWeb';

export const CONFIG_QUERY_KEY = ['configuracion-web'];

export const useConfigWeb = () => {
    const queryClient = useQueryClient();
    
    // 1. Consulta: Obtiene la configuración (o null si no existe)
    const configQuery = useQuery<ConfigWebResponseDto | null, Error>({
        queryKey: CONFIG_QUERY_KEY,
        queryFn: configWebService.getConfiguracion,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
        retry: 1, // Intentar una vez más
    });
    
    // 2. Mutación de Creación
    const createMutation = useMutation<ConfigWebResponseDto, Error, UpdateConfigWebBase64Dto>({
        mutationFn: configWebService.createConfiguracion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
        },
    });

    // 3. Mutación de Actualización
    const updateMutation = useMutation<ConfigWebResponseDto, Error, { id: number, data: UpdateConfigWebBase64Dto }>({
        mutationFn: ({ id, data }) => configWebService.updateConfiguracion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
        },
    });

    return {
        // Lectura
        config: configQuery.data,
        isLoading: configQuery.isLoading,
        isError: configQuery.isError,
        isInitialLoading: configQuery.isInitialLoading,

        // Mutaciones
        createConfig: createMutation.mutateAsync,
        updateConfig: updateMutation.mutateAsync,
        isMutating: createMutation.isPending || updateMutation.isPending,
        mutationError: createMutation.error || updateMutation.error,
        
        // ID del registro (para saber si existe)
        configId: configQuery.data?.id,
    };
};