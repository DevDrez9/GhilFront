import React, { useState, useMemo, useEffect } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import ComboBox1 from "~/componentes/ComboBox1";
import { useVentas } from "~/hooks/useVentas";
import { useInventarioSucursal } from "~/hooks/useInventarioSucursal";
import { CreateVentaDto, CreateVentaItemDto, EstadoVenta, MetodoPago } from "~/models/ventas";
import { useSucursales } from "~/hooks/useSucursales";
import "./VentasForm.style.css";
import { useAlert } from "~/componentes/alerts/AlertContext";

// --- Tipos ---
interface NewItemState {
    selectedInventarioId: string; // ID del registro de inventario (para buscar stock)
    selectedProductoId: string;   // ID del producto real (para el DTO)
    talla: string;                // Talla seleccionada
    cantidad: string;
    precioUnitario: string;
}

interface VentaFormState {
    cliente: string;
    telefono: string;
    direccion: string;
    metodoPago: MetodoPago;
    sucursalId: string;
}

interface CrearVentaFormProps {
    visible: boolean;
    onClose: () => void;
}

interface SucursalResponseDto {
    id: number;
    nombre: string;
    direccion: string;
}

const IMPUESTO_RATE = 0;
const metodoPagoOptions = Object.values(MetodoPago).map(m => ({ value: m, label: m.replace('_', ' ') }));

const CrearVentaForm: React.FC<CrearVentaFormProps> = ({ visible, onClose }) => {
    const { createVenta, isCreating, createError } = useVentas();
    
    // --- ESTADOS PRINCIPALES ---
    const [formData, setFormData] = useState<VentaFormState>({
        cliente: "",
        telefono: "",
        direccion: "",
        metodoPago: MetodoPago.EFECTIVO,
        sucursalId: "",
    });
    
    const [ventaItems, setVentaItems] = useState<CreateVentaItemDto[]>([]);
    const [newItem, setNewItem] = useState<NewItemState>({
        selectedInventarioId: "",
        selectedProductoId: "",
        talla: "",
        cantidad: "1",
        precioUnitario: "",
    });

    // Estado para las tallas disponibles del producto seleccionado
    const [tallasDisponibles, setTallasDisponibles] = useState<Record<string, number>>({});
    const [stockTallaSeleccionada, setStockTallaSeleccionada] = useState<number>(0);

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // --- HOOKS DE DATOS ---
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    const sucursalIdStr = formData.sucursalId;
    const sucursalIdNum = Number(sucursalIdStr);
    const options = useMemo(() => ({ sucursalId: sucursalIdNum }), [sucursalIdNum]);
    const { inventario = [], isLoading } = useInventarioSucursal(options); 

    // --- OPCIONES ---
    const sucursalOptions = useMemo(() => {
        return (sucursales as SucursalResponseDto[]).map(s => ({
            value: String(s.id),
            label: `${s.nombre} (ID: ${s.id})`,
        }));
    }, [sucursales]);

    const productoOptions = useMemo(() => {
        return inventario.map(i => ({
            value: String(i.id), // ID de inventario para buscar fácil
            label: `${i.producto.nombre} - Bs.${i.producto.precio}`,
        }));
    }, [inventario]);
    
    // Objeto de inventario seleccionado
    const selectedInventarioItem = useMemo(() => {
        const id = Number(newItem.selectedInventarioId);
        return inventario.find(i => i.id === id);
    }, [inventario, newItem.selectedInventarioId]);

    // Opciones de Talla (Basadas en el stock del producto seleccionado)
    const tallaOptions = useMemo(() => {
        return Object.entries(tallasDisponibles)
            .filter(([_, qty]) => qty > 0) // Solo mostramos tallas con stock
            .map(([talla, qty]) => ({
                value: talla,
                label: `${talla} (Disp: ${qty})`
            }));
    }, [tallasDisponibles]);

    // --- CÁLCULOS ---
    const { subtotal, impuestos, total } = useMemo(() => {
        const sub = ventaItems.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);
        const tax = sub * IMPUESTO_RATE;
        const tot = sub + tax;
        return { subtotal: sub, impuestos: tax, total: tot };
    }, [ventaItems]);

    // --- EFECTOS ---
    
    // Reset al cambiar sucursal
    useEffect(() => {
        setVentaItems([]);
        setNewItem({ selectedInventarioId: "", selectedProductoId: "", talla: "", cantidad: "1", precioUnitario: "" });
        setTallasDisponibles({});
    }, [formData.sucursalId]);

    // Al seleccionar producto: Cargar tallas y precio
    useEffect(() => {
        if (selectedInventarioItem) {
            try {
                // Parsear el stock JSON
                const stockObj = typeof selectedInventarioItem.stock === 'string' 
                    ? JSON.parse(selectedInventarioItem.stock) 
                    : selectedInventarioItem.stock;
                
                setTallasDisponibles(stockObj || {});
                
                setNewItem(prev => ({ 
                    ...prev, 
                    selectedProductoId: String(selectedInventarioItem.productoId),
                    precioUnitario: String(selectedInventarioItem.producto.precio),
                    talla: "" // Reset talla
                }));
            } catch (e) {
                setTallasDisponibles({});
            }
        } else {
            setTallasDisponibles({});
            setNewItem(prev => ({ ...prev, precioUnitario: "" }));
        }
    }, [selectedInventarioItem]);

    // Al seleccionar talla: Actualizar stock máximo permitido
    useEffect(() => {
        if (newItem.talla && tallasDisponibles) {
            setStockTallaSeleccionada(tallasDisponibles[newItem.talla] || 0);
        } else {
            setStockTallaSeleccionada(0);
        }
    }, [newItem.talla, tallasDisponibles]);

    // --- MANEJADORES ---
    const handleFormChange = (field: keyof VentaFormState, value: string | MetodoPago) => {
        setFormData(prev => ({ ...prev, [field]: String(value) }));
    };

    const handleNewItemChange = (field: keyof NewItemState, value: string) => {
        setNewItem(prev => ({ ...prev, [field]: value }));
    };

    // Asegúrate de que `const { showAlert } = useAlert();` esté al inicio del componente

  const handleAddItem = () => {
    const cantidad = Number(newItem.cantidad);
    const precio = Number(newItem.precioUnitario);

    // 1. Validaciones de Campos
    if (!newItem.selectedProductoId || !newItem.talla) {
      showAlert("Por favor, seleccione un producto y una talla.", "warning");
      return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      showAlert("La cantidad ingresada no es válida.", "warning");
      return;
    }

    // 2. Validación de Stock por Talla
    if (cantidad > stockTallaSeleccionada) {
      
      showAlert(`Stock insuficiente para la talla ${newItem.talla}. Solo hay ${stockTallaSeleccionada} unidades disponibles.`, "error");
      return;
    }

    // 3. Crear DTO
    const newItemDto: CreateVentaItemDto = {
      productoId: Number(newItem.selectedProductoId),
      cantidad: cantidad,
      precio: precio,
      talla: newItem.talla
    };

    // 4. Actualizar estado
    setVentaItems(prev => [...prev, newItemDto]);
    
    // 5. Resetear campos (mantenemos el producto, reseteamos talla y cantidad)
    setNewItem(prev => ({ ...prev, talla: "", cantidad: "1" }));
  };

    const handleRemoveItem = (index: number) => {
        setVentaItems(prev => prev.filter((_, i) => i !== index));
    };

    // --- SUBMIT ---
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.cliente.trim()) newErrors.cliente = "El nombre del cliente es obligatorio.";
        if (sucursalIdNum <= 0 || isNaN(sucursalIdNum)) newErrors.sucursalId = "Debe seleccionar una Sucursal.";
        if (ventaItems.length === 0) newErrors.items = "Debe agregar al menos un ítem.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

   // 1. Asegúrate de tener el hook al inicio del componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación
    if (validate()) {
      try {
        // 2. Preparar DTO
        const dataToSend: CreateVentaDto = {
            cliente: formData.cliente.trim(),
            telefono: formData.telefono.trim() || undefined,
            direccion: formData.direccion.trim() || undefined,
            estado: ventaItems.length > 0 ? EstadoVenta.CONFIRMADA : EstadoVenta.PENDIENTE,
            metodoPago: formData.metodoPago,
            tiendaId: 1, 
            sucursalId: sucursalIdNum,
            subtotal: subtotal,
            impuestos: impuestos,
            total: total,
            items: ventaItems,
        };
        
        // 3. Ejecutar creación
        await createVenta(dataToSend);
        
        

        // 4. ÉXITO
        await showAlert(`Venta registrada correctamente por Bs.${total.toFixed(2)}.`, "success");
        
        onClose();

      } catch (error: any) {
        console.error("Error en submit:", error);
        
        // 5. ERROR
        const msg = error?.message || "No se pudo registrar la venta.";
        showAlert(msg, "error");
      }

    } else {
      // 6. Validación fallida
      showAlert("Faltan datos. Revisa el cliente, la sucursal y los ítems.", "warning");
    }
  };

    const containerClasses = ["contenedorFormVenta", visible ? "visible" : "noVisible"].filter(Boolean).join(" ");
    const isDisabled = isCreating || isLoadingSucursales || isLoading;

    return (
        <div className={containerClasses}>
            <div className="cuerpoVentaForm">
                <Boton1 type="button" size="medium" variant="info" onClick={onClose}> Atrás </Boton1>
                <h2>Registrar Nueva Venta</h2>
                
                <div className="formVenta">
                    <form onSubmit={handleSubmit}>
                        {/* SECCIÓN CLIENTE Y SUCURSAL */}
                        <fieldset className="seccionCliente">
                            <legend>Datos Generales</legend>
                            <div className="form-row">
                                <ComboBox1
                                    label="Sucursal *"
                                    value={formData.sucursalId}
                                    onChange={(val) => handleFormChange("sucursalId", val)}
                                    options={sucursalOptions}
                                    placeholder={isLoadingSucursales ? "Cargando..." : "Seleccione Sucursal"}
                                    required
                                    disabled={isLoadingSucursales || isCreating}
                                    width={220}
                                />
                                <ComboBox1
                                    label="Método de Pago"
                                    value={formData.metodoPago}
                                    onChange={(val) => handleFormChange("metodoPago", val as MetodoPago)}
                                    options={metodoPagoOptions}
                                    required
                                    width={220}
                                />
                            </div>
                            <InputText1 label="Cliente *" value={formData.cliente} onChange={(val) => handleFormChange("cliente", val)} errorMessage={errors.cliente} required width={450} />
                            <div className="form-row">
                                <InputText1 label="Teléfono" value={formData.telefono} onChange={(val) => handleFormChange("telefono", val)} width={220} type="number"/>
                                <InputText1 label="Dirección" value={formData.direccion} onChange={(val) => handleFormChange("direccion", val)} width={220} />
                            </div>
                        </fieldset>

                        {/* SECCIÓN ITEMS */}
                        <fieldset className="seccionItems" disabled={!formData.sucursalId}>
                            <legend>Carrito de Compras</legend>
                            <div className="form-row-items" style={{ alignItems: 'flex-end', gap: '10px' }}>
                                
                                {/* PRODUCTO */}
                                <ComboBox1
                                    label="Producto"
                                    value={newItem.selectedInventarioId}
                                    onChange={(val) => handleNewItemChange("selectedInventarioId", val)}
                                    options={productoOptions}
                                    placeholder={isLoading ? "Cargando..." : "Buscar producto"}
                                    width={250}
                                />

                                {/* TALLA (NUEVO) */}
                                <ComboBox1
                                    label="Talla"
                                    value={newItem.talla}
                                    onChange={(val) => handleNewItemChange("talla", val)}
                                    options={tallaOptions}
                                    placeholder="Talla"
                                    disabled={!newItem.selectedInventarioId}
                                    width={150}
                                />

                                <InputText1
                                    label="Cant."
                                    value={newItem.cantidad}
                                    onChange={(val) => handleNewItemChange("cantidad", val)}
                                    type="number" min={1}
                                    disabled={!newItem.talla}
                                    width={80}
                                />

                                <div style={{ paddingBottom: '10px', fontSize: '0.9em' }}>
                                    <strong>Bs. {newItem.precioUnitario || '0.00'}</strong>
                                </div>

                                <Boton1 onClick={handleAddItem} type="button" disabled={!newItem.talla || !newItem.cantidad}>
                                    +
                                </Boton1>
                            </div>

                            {/* TABLA */}
                            {ventaItems.length > 0 ? (
                                <div className="tablaItemsVenta-container">
                                    <table className="tablaItemsVenta">
                                        <thead>
                                            <tr>
                                                <th style={{textAlign:'left'}}>Producto</th>
                                                <th style={{textAlign:'center'}}>Talla</th>
                                                <th style={{textAlign:'center'}}>Cant.</th>
                                                <th style={{textAlign:'right'}}>Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventaItems.map((item, index) => {
                                                // Buscar nombre para mostrar
                                                const prodName = inventario.find(i => i.productoId === item.productoId)?.producto.nombre || "Producto";
                                                return (
                                                    <tr key={index}>
                                                        <td><strong>{prodName}</strong></td>
                                                        <td style={{textAlign:'center'}}><span className="badge-talla">{item.talla}</span></td>
                                                        <td style={{textAlign:'center'}}>{item.cantidad}</td>
                                                        <td style={{textAlign:'right'}}>Bs.{(item.cantidad * item.precio).toFixed(2)}</td>
                                                        <td style={{textAlign:'center'}}>
                                                            <button type="button" onClick={() => handleRemoveItem(index)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>X</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="alerta-items">🛒 Carrito vacío. {errors.items && <span style={{color:'red'}}>{errors.items}</span>}</p>
                            )}
                        </fieldset>

                        {/* TOTALES */}
                        <div className="resumenTotales">
                            <div>Subtotal: <strong>Bs.{subtotal.toFixed(2)}</strong></div>
                            
                            <div style={{fontSize:'1.2em', color:'#007bff'}}>Total: <strong>Bs.{total.toFixed(2)}</strong></div>
                        </div>

                        <Boton1 type="submit" fullWidth size="large" disabled={isDisabled || ventaItems.length === 0} style={{ marginTop: '20px' }}>
                            {isCreating ? "Procesando..." : "Confirmar Venta"}
                        </Boton1>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CrearVentaForm;