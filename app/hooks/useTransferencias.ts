// ~/hooks/useTransferencias.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateTransferenciaInventarioDto } from '~/models/transferencia';
import { transferenciaService, type TransferenciaResponseDto } from '~/services/transferenciasSerice';

export const useTransferencias = () => {
  const queryClient = useQueryClient();
  
  const createTransferenciaMutation = useMutation<
    TransferenciaResponseDto,       
    Error,                          
    CreateTransferenciaInventarioDto
  >({
    mutationFn: (data) => transferenciaService.createTransferencia(data),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferencias'] }); 
      queryClient.invalidateQueries({ queryKey: ['inventario-almacen'] }); 
    },
    
    onError: (error) => {
      console.error("Error al crear la transferencia:", error.message);
    }
  });

  return {
    createTransferencia: createTransferenciaMutation.mutateAsync,
    isCreating: createTransferenciaMutation.isPending,
    createError: createTransferenciaMutation.error,
  };
};