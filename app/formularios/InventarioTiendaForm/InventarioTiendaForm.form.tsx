import React, { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";
// 🎯 Reemplaza con tus paths reales

import { useProductos } from "~/hooks/useProductos"; 
import { useInventarioTienda } from "~/hooks/useInventarioTienda";
import type { ProductoResponseDto } from "~/models/producto.model";
import type { CreateInventarioTiendaDto } from "~/models/inventarioTienda";
import "./InventarioTiendaForm.style.css"


// Tipo de estado local para el formulario (usa strings para inputs)
interface InventarioTiendaFormState {
    productoId: string; 
    tiendaId: string;   
    stock: string;      
    stockMinimo: string;
}

interface CreateInventarioTiendaFormProps {
    visible: boolean;
    onClose: () => void;
}

const CreateInventarioTiendaForm: React.FC<CreateInventarioTiendaFormProps> = ({ visible, onClose }) => {
    // 🎯 Asume que useInventario tiene la mutación
    const { createInventarioTienda, isCreating, createError } = useInventarioTienda(); 
    // 🎯 Asume que useProductos trae una lista de productos
    const { productos, isLoading } = useProductos(); 

    const containerClasses = [
        "contenedorFormInventario",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");

    // ----------------------------------------------------
    // OPCIONES DEL COMBOBOX
    // ----------------------------------------------------
    const productoOptions = productos.map((p: ProductoResponseDto) => ({
        value: String(p.id),
        label: `${p.nombre} (${p.precio})`,
    }));

    // ----------------------------------------------------
    // ESTADO INICIAL
    // ----------------------------------------------------
    const [formData, setFormData] = useState<InventarioTiendaFormState>({
        productoId: "",
        tiendaId: "",
        stock: "",
        stockMinimo: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof InventarioTiendaFormState, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: String(value), // Siempre guarda como string en el estado local
        }));
    };

    // ----------------------------------------------------
    // VALIDACIÓN Y SUBMIT
    // ----------------------------------------------------

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const tiendaId = Number(formData.tiendaId);
        const stock = Number(formData.stock);
        const stockMinimo = Number(formData.stockMinimo);

        if (!formData.productoId)
            newErrors.productoId = "Debe seleccionar un producto.";

        if (isNaN(tiendaId) || tiendaId <= 0)
            newErrors.tiendaId = "ID de Tienda inválido.";
        
        // Validación de campos opcionales
        if (formData.stock.trim() !== "" && (isNaN(stock) || stock < 0))
            newErrors.stock = "El Stock debe ser un número válido.";

        if (formData.stockMinimo.trim() !== "" && (isNaN(stockMinimo) || stockMinimo < 0))
            newErrors.stockMinimo = "El Stock Mínimo debe ser un número válido.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            try {
                // 🎯 CONSTRUCCIÓN DEL DTO FINAL: Conversión a Number y manejo de opcionales

                // Función auxiliar para convertir string a number o undefined si es vacío/inválido
                const parseOptionalNumber = (value: string): number | undefined => {
                    const num = Number(value.trim());
                    return value.trim() === "" || isNaN(num) ? undefined : num;
                };

                const dataToSend: CreateInventarioTiendaDto = {
                    productoId: Number(formData.productoId), // Requerido
                    tiendaId: Number(formData.tiendaId),     // Requerido
                    stock: parseOptionalNumber(formData.stock),           // Opcional
                    stockMinimo: parseOptionalNumber(formData.stockMinimo), // Opcional
                };
                
                await createInventarioTienda(dataToSend);
                
                alert("Inventario creado con éxito.");
                onClose();
            } catch (error) {
                alert("No se pudo crear el registro de inventario.");
                console.error("Error al crear inventario:", error);
            }
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------

    return (
        <div className={containerClasses}>
            <div className="cuerpoInventarioTiendaForm">
                <h2>Nuevo Registro de Inventario</h2>
                
                {isLoading && <p>Cargando productos...</p>}

                <div className="formInventarioTienda">
                    <form onSubmit={handleSubmit}>
                        
                        {/* PRODUCTO ID (COMBOBOX) */}
                        <ComboBox1
                            label="Producto *"
                            value={formData.productoId}
                            onChange={(val) => handleChange("productoId", val)}
                            options={productoOptions}
                            placeholder="Seleccione un Producto"
                            errorMessage={errors.productoId}
                            required
                            disabled={isLoading || isCreating}
                            width={450}
                        />

                        <div className="form-row">
                            {/* TIENDA ID */}
                            <InputText1
                                label="ID de Tienda *"
                                value={formData.tiendaId}
                                onChange={(val) => handleChange("tiendaId", val)}
                                errorMessage={errors.tiendaId}
                                required
                                type="number"
                                width={220}
                            />
                            
                            {/* STOCK (Opcional) */}
                            <InputText1
                                label="Stock Inicial (Opcional)"
                                value={formData.stock}
                                onChange={(val) => handleChange("stock", val)}
                                errorMessage={errors.stock}
                                type="number"
                                width={220}
                            />
                        </div>

                        {/* STOCK MÍNIMO (Opcional) */}
                        <InputText1
                            label="Stock Mínimo (Opcional)"
                            value={formData.stockMinimo}
                            onChange={(val) => handleChange("stockMinimo", val)}
                            errorMessage={errors.stockMinimo}
                            type="number"
                            width={450}
                        />

                        <Boton1
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isCreating || isLoading}
                            style={{ marginTop: '20px' }}
                        >
                            {isCreating ? "Guardando..." : "Crear Registro"}
                        </Boton1>

                        {createError && (
                            <div className="error-alert">Error: {createError.message}</div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateInventarioTiendaForm;