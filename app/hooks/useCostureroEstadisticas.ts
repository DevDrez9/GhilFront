// En ~/hooks/useCostureroEstadisticas.ts

import { useQuery } from '@tanstack/react-query';
import { costureroService } from '~/services/costurerosService';
/**
 * Hook para obtener las estadísticas de un único costurero por su ID.
 * @param costureroId - El ID del costurero. La petición solo se ejecuta si el ID es un número válido.
 */
export const useCostureroEstadisticas = (costureroId: number | null | undefined) => {
  return useQuery({
    // La queryKey incluye el ID para que React Query cachee cada resultado por separado.
    queryKey: ['costurero', costureroId, 'estadisticas'],
    
    // La función que se ejecutará para obtener los datos.
    queryFn: () => costureroService.getCostureroConEstadisticas(costureroId!),
    
    // ¡Importante! La query se habilita solo si `costureroId` tiene un valor.
    // Esto evita que se haga una llamada a la API cuando el modal está cerrado.
    enabled: !!costureroId,
    
    // Opcional: Configura por cuánto tiempo los datos se consideran "frescos".
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};