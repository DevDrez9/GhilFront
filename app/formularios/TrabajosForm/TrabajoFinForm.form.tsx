import React, { useEffect, useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";

import { useTrabajos } from "~/hooks/useTrabajos";
import { CompletarTrabajoDto, TrabajoResponseDto } from "~/models/trabajo";
import { CalidadProducto } from "~/models/trabajos-finalizados";
import ComboBox1 from "~/componentes/ComboBox1";
import "./TranajoFinForm.style.css"
import { useAlert } from "~/componentes/alerts/AlertContext";

// Asegúrate de importar tus componentes UI (Boton1, InputText1, ComboBox1, etc.)
// y tus DTOs/Enums correctamente.

interface FinalizarTrabajoFormState {
  fechaFinalizacion: string;
  calidad: string; // Usamos string para el nombre del enum en el formulario
  notas: string; // Notas de texto libre
  tiendaId: string;
  costo: number;
}

interface FinalizarTrabajoFormProps {
  visible: boolean;
  onClose: () => void;
  trabajo: any; // Ajusta al tipo TrabajoResponseDto real
}

const calidadOptions = Object.keys(CalidadProducto)
    .filter(key => isNaN(Number(key)))
    .map(name => ({
        value: name,
        label: name.charAt(0) + name.slice(1).toLowerCase()
    }));

const FinalizarTrabajoForm: React.FC<FinalizarTrabajoFormProps> = ({ visible, onClose, trabajo }) => {
    const { completeTrabajo, isCompleting, completeError } = useTrabajos();

    const containerClasses = [
        "contenedorFormFinalizarTrabajo",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // --- ESTADO PARA LAS CANTIDADES POR TALLA ---
    const [cantidadesPorTalla, setCantidadesPorTalla] = useState<Record<string, number>>({});
    
    // --- ESTADO DEL RESTO DEL FORMULARIO ---
    const [formData, setFormData] = useState<FinalizarTrabajoFormState>({
        fechaFinalizacion: new Date().toISOString().substring(0, 10),
        calidad: "EXCELENTE", // Valor por defecto seguro
        notas: "",
        tiendaId: "",
        costo: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- EFECTO DE INICIALIZACIÓN ---
    useEffect(() => {
        if (trabajo) {
            // 1. Intentar parsear las tallas desde trabajo.notas (donde dijiste que viene la info inicial)
            let tallasIniciales: Record<string, number> = {};
            try {
                if (trabajo.notas && trabajo.notas.trim().startsWith('{')) {
                    tallasIniciales = JSON.parse(trabajo.notas);
                } else {
                    // Si no hay JSON, asumimos una talla única con la cantidad total
                    tallasIniciales = { "UNICA": trabajo.cantidad || 0 };
                }
            } catch (e) {
                tallasIniciales = { "UNICA": trabajo.cantidad || 0 };
            }
            setCantidadesPorTalla(tallasIniciales);

            // 2. Inicializar resto de datos
            setFormData({
                fechaFinalizacion: new Date().toISOString().substring(0, 10),
                calidad: "EXCELENTE",
                notas: "", // Limpiamos notas porque ya extrajimos las tallas
                tiendaId: String(trabajo.tiendaId || ""),
                costo: trabajo.cantidad * (trabajo.parametrosTela?.fotoReferenciaUrl || 0) // Asumiendo que fotoReferenciaUrl tiene el costo unitario
            });
        }
    }, [trabajo]);

    // --- MANEJADORES ---

    const handleChange = (field: keyof FinalizarTrabajoFormState, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCantidadTallaChange = (talla: string, valor: string) => {
        const numero = parseFloat(valor);
        setCantidadesPorTalla(prev => ({
            ...prev,
            [talla]: isNaN(numero) ? 0 : numero
        }));
    };

    // Calcular total dinámico para mostrar
    const totalUnidades = Object.values(cantidadesPorTalla).reduce((a, b) => a + b, 0);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (totalUnidades <= 0) newErrors.cantidades = "La cantidad total producida debe ser mayor a 0";
        if (!formData.fechaFinalizacion) newErrors.fechaFinalizacion = "La fecha es obligatoria";
        if (!formData.calidad) newErrors.calidad = "La calidad es obligatoria";
        
        // Validar cada talla individualmente si es necesario
        Object.entries(cantidadesPorTalla).forEach(([talla, cantidad]) => {
             if (cantidad < 0) newErrors[`talla_${talla}`] = "No puede ser negativo";
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 1. Importar el hook
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación
    if (validate()) {
      try {
        // 2. Preparar datos
        const calidadNumerica = CalidadProducto[formData.calidad as keyof typeof CalidadProducto];

        const dataToSend = {
            // 💡 JSON stringified para el stock por talla
            cantidadProducida: JSON.stringify(cantidadesPorTalla), 
            fechaFinalizacion: formData.fechaFinalizacion,
            calidad: calidadNumerica,
            notas: formData.notas.trim() || undefined,
            tiendaId: formData.tiendaId ? Number(formData.tiendaId) : undefined,
            costo: Number(formData.costo)
        };

        // 3. Ejecutar la finalización
        // Nota: Si completeTrabajo usa mutateAsync (React Query), esto lanzará error si falla, activando el catch.
        await completeTrabajo({ 
            id: trabajo.id, 
            data: dataToSend 
        });

        // 4. ÉXITO
        
        await showAlert("Trabajo finalizado correctamente.", "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error al finalizar:", error);
        
        // 5. ERROR
        const msg = error?.message || "Error inesperado al finalizar el trabajo.";
        showAlert(msg, "error");
      }
    } else {
        // Validación fallida (opcional, ya muestras errores inline)
        showAlert("Por favor corrige los errores en el formulario.", "warning");
    }
  };

    const calcularCostoEstimado = (cantidad: number, costoUnitario: number) => {
        return (cantidad * costoUnitario).toFixed(2);
    };

    return (
        <div className={containerClasses}>
            <div className="cuerpoFinalizarTrabajoForm">
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}> Atras </Boton1>

                <h2>Finalizar Trabajo: {trabajo.codigoTrabajo}</h2>

                <div className="formFinalizarTrabajo">
                    <div className="info-resumen" style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                        <p>Planificado: <strong>{trabajo.cantidad} u.</strong></p>
                        <p>Producido Real: <strong>{totalUnidades} u.</strong></p>
                        <p>Costo Unit. Ref: <strong>{trabajo.parametrosTela?.fotoReferenciaUrl} Bs.</strong></p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        
                        {/* SECCIÓN DE TALLAS DINÁMICAS */}
                        <div className="tallas-container" style={{ marginBottom: '20px' }}>
                            <h4 style={{ marginBottom: '10px' }}>Desglose por Talla</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {Object.keys(cantidadesPorTalla).map((talla) => (
                                    <div key={talla} style={{ flex: '1 1 100px' }}>
                                        <InputText1
                                            label={`Talla ${talla}`}
                                            value={String(cantidadesPorTalla[talla])}
                                            onChange={(val) => handleCantidadTallaChange(talla, val)}
                                            type="number"
                                            width={120}
                                            // Si usas componentes personalizados, asegúrate de pasar props de error si los soportan
                                        />
                                    </div>
                                ))}
                            </div>
                            {errors.cantidades && <small style={{ color: 'red' }}>{errors.cantidades}</small>}
                        </div>

                        <div className="form-row">
                            <InputText1
                                label="Fecha de Finalización *"
                                value={formData.fechaFinalizacion}
                                onChange={(val) => handleChange("fechaFinalizacion", val)}
                                errorMessage={errors.fechaFinalizacion}
                                required
                                type="date"
                                width={220}
                            />

                            <ComboBox1 
                                label="Calidad *"
                                value={formData.calidad} 
                                onChange={(val) => handleChange("calidad", val)}
                                options={calidadOptions}
                                placeholder="Seleccione Calidad"
                                errorMessage={errors.calidad}
                                required
                                width={220}
                            />
                        </div>

                        <div className="form-row">
                            <InputText1
                                label="Costo Total Real (Bs)"
                                value={String(formData.costo)}
                                onChange={(val) => handleChange("costo", val)}
                                type="number"
                                width={450}
                            />
                        </div>
                        
                        <div className="form-row">
                            <InputText1
                                label="Notas Adicionales (Opcional)"
                                value={formData.notas}
                                onChange={(val) => handleChange("notas", val)}
                                type="text"
                                width={450}
                                placeholder="Comentarios sobre la producción..."
                            />
                        </div>
                        
                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isCompleting}
                            style={{ marginTop: '20px' }}
                        >
                            {isCompleting ? "Finalizando..." : "Confirmar Finalización"}
                        </Boton1>

                        {completeError && (
                            <div className="error-alert" style={{ marginTop: '10px', color: 'red' }}>
                                Error: {completeError.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FinalizarTrabajoForm;