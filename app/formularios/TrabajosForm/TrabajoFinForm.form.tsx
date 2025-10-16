import React, { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";

import { useTrabajos } from "~/hooks/useTrabajos";
import { CompletarTrabajoDto, TrabajoResponseDto } from "~/models/trabajo";
import { CalidadProducto } from "~/models/trabajos-finalizados";
import ComboBox1 from "~/componentes/ComboBox1";
import "./TranajoFinForm.style.css"

// Define el tipo de estado local para manejar los valores de los inputs
interface FinalizarTrabajoFormState {
  cantidadProducida: string; 
  fechaFinalizacion: string;
  calidad: CalidadProducto;
  notas: string;
  tiendaId: string;
  costo:number;
}

interface FinalizarTrabajoFormProps {
  visible: boolean;
  onClose: () => void;
  trabajo: TrabajoResponseDto;
}

const calidadOptions = Object.keys(CalidadProducto)
    // Filtramos para obtener solo las claves/nombres (ej: "EXCELENTE", no "0")
    .filter(key => isNaN(Number(key))) 
    .map(name => ({
        // El value será la CLAVE del enum como string (ej: "EXCELENTE")
        value: name, 
        // El label será el nombre formateado
        label: name.charAt(0) + name.slice(1).toLowerCase() 
    }));
const FinalizarTrabajoForm: React.FC<FinalizarTrabajoFormProps> = ({ visible, onClose, trabajo }) => {
    const { completeTrabajo, isCompleting, completeError } = useTrabajos();

    const containerClasses = [
        "contenedorFormFinalizarTrabajo",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // 🎯 Estado inicial: Asignamos el nombre del primer elemento ("EXCELENTE")
    const [formData, setFormData] = useState<FinalizarTrabajoFormState>({
        cantidadProducida: trabajo.cantidad+"" , 
        fechaFinalizacion: new Date().toISOString().substring(0, 10), 
        // Inicializamos con el nombre del valor, que es una CLAVE válida del enum.
        calidad: CalidadProducto.EXCELENTE, 
        notas: "", 
        tiendaId: String(trabajo.tiendaId),
        costo:trabajo.cantidad*trabajo.parametrosTela.fotoReferenciaUrl
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof FinalizarTrabajoFormState, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: String(value),
        }));
    };
    
    const handleNotesChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            notas: value,
        }));
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const cantidad = Number(formData.cantidadProducida);
        const tiendaId = Number(formData.tiendaId);

        if (isNaN(cantidad) || cantidad <= 0)
            newErrors.cantidadProducida = "Debe ser mayor a 0";

        if (!formData.fechaFinalizacion)
            newErrors.fechaFinalizacion = "La fecha es obligatoria";
            
        // Validación de calidad basada en si el nombre existe en las claves del enum
        if (!formData.calidad || !Object.keys(CalidadProducto).includes(formData.calidad))
            newErrors.calidad = "La calidad es obligatoria";
            
        if (formData.tiendaId.trim() !== "" && (isNaN(tiendaId) || tiendaId <= 0))
            newErrors.tiendaId = "ID de Tienda inválido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                // 🎯 CONVERSIÓN CRUCIAL: Convertir el NOMBRE del enum (string) a su VALOR NUMÉRICO
                const calidadNumerica = CalidadProducto[formData.calidad as keyof typeof CalidadProducto];

                const dataToSend: CompletarTrabajoDto = {
                    cantidadProducida: Number(formData.cantidadProducida),
                    fechaFinalizacion: formData.fechaFinalizacion,
                    calidad: calidadNumerica, // 🎯 ¡Aquí se envía el número (0, 1, 2, 3)!
                    notas: formData.notas.trim() || undefined,
                    tiendaId: formData.tiendaId.trim() !== "" ? Number(formData.tiendaId) : undefined,
                    costo:Number(formData.costo)
                    
                };

                console.log(trabajo.id+" " +dataToSend)
                
               await completeTrabajo({ 
                    id: trabajo.id,
                    data: dataToSend 
                },{
          onSuccess: () => {
            alert("Trabajo finalizado correctamente");
          
        },
        onError: (error) => {
            alert(error.message);
        }
       });
                
                onClose();
            } catch (error) {
                alert("No se pudo finalizar el trabajo.");
                console.error("Error al finalizar:", error);
            }
        }
    };
    const calcularCostoEstimado=(cantidad, costoUnitario)=>{
        return cantidad*costoUnitario;
    }


    return (
        <>
            <div className={containerClasses}>
                <div className="cuerpoFinalizarTrabajoForm">
                    <Boton1 type="button" size="medium" variant="info" onClick={() => {
                onClose()
            }}> Atras </Boton1>

                    <h2>Finalizar Trabajo: {trabajo.codigoTrabajo}</h2>


                    
                    

                    <div className="formFinalizarTrabajo">

                        <p>Cantidad Solicitada: <strong>{trabajo.cantidad}</strong></p>
                     <p>Costo Estimado: <strong>{calcularCostoEstimado(trabajo.cantidad,trabajo.parametrosTela.fotoReferenciaUrl)} Bs.</strong></p>
                     <p>Fecha Finalizacion Estimado: <strong>{trabajo.fechaFinEstimada 
            ? new Date(trabajo.fechaFinEstimada).toLocaleDateString()
            : ""}</strong></p>
                        <form onSubmit={handleSubmit}>
                            
                            <div className="form-row">
                                <InputText1
                                    label="Cantidad Producida * "
                                    value={formData.cantidadProducida}
                                    onChange={(val) => handleChange("cantidadProducida", val)}
                                    errorMessage={errors.cantidadProducida}
                                    required
                                    type="number"
                                    width={220}
                                />
                               
                                
                                <InputText1
                                    label="Fecha de Finalización Real *"
                                    value={formData.fechaFinalizacion}
                                    onChange={(val) => handleChange("fechaFinalizacion", val)}
                                    errorMessage={errors.fechaFinalizacion}
                                    required
                                    type="date"
                                    width={220}
                                />
                            </div>

                            <div className="form-row">
                                {/* COMBOBOX PARA CALIDAD */}
                                <ComboBox1 
                                    label="Calidad *"
                                    // El valor aquí es la CLAVE (string): "EXCELENTE"
                                    value={formData.calidad} 
                                    onChange={(val) => handleChange("calidad", val)}
                                    options={calidadOptions}
                                    placeholder="Seleccione Calidad"
                                    errorMessage={errors.calidad}
                                    required
                                    width={220}
                                />
                                
                              {/*  <InputText1
                                    label="Tienda ID (Registro Final)"
                                    value={formData.tiendaId}
                                    onChange={(val) => handleChange("tiendaId", val)}
                                    errorMessage={errors.tiendaId}
                                    type="number"
                                    width={220}
                                />*/}
                            </div>
                            <InputText1
                                label="Costo Real (Bs)"
                                value={formData.costo+""}
                                onChange={(val) => handleChange("costo", val)}
                                type="number"
                               
                                width={450}
                            />

                            
                            {/* NOTAS */}
                            <InputText1
                                label="Notas de Finalización (Opcional)"
                                value={formData.notas}
                                onChange={handleNotesChange}
                                type="text"
                               
                                width={450}
                            />
                            
                           
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
                                <div className="error-alert">Error: {completeError.message}</div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinalizarTrabajoForm;