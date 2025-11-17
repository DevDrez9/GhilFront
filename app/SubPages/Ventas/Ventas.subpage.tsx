import React, { useState } from "react";
import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import { useVentas } from "~/hooks/useVentas";
import type { VentaResponseDto } from "~/models/ventas";
import CrearVentaForm from "~/formularios/VentasForm/VentasForm.form";
import "./Ventas.style.css";

const Ventas = () => {
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [mostrarForm, setMostrarForm] = useState(false);
    
    // NUEVO: Estado para controlar qué venta está expandida (ID o null)
    const [expandedVentaId, setExpandedVentaId] = useState<number | null>(null);

    const {
        ventas,
        total,
        isLoadingVentas,
        isErrorVentas,
        errorVentas,
    } = useVentas();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setTimeout(() => setDebouncedSearch(value), 500);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setDebouncedSearch("");
    };
    
    const getEstadoStyle = (estado: string) => {
        const baseStyle = {
            padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold',
            fontSize: '12px', whiteSpace: 'nowrap' as 'nowrap', marginLeft: '10px'
        };
        switch (estado) {
            case 'PENDIENTE': return { ...baseStyle, backgroundColor: '#ffc107', color: '#333' };
            case 'COMPLETADA': return { ...baseStyle, backgroundColor: '#28a745', color: 'white' };
            case 'CANCELADA': return { ...baseStyle, backgroundColor: '#dc3545', color: 'white' };
            case 'CONFIRMADA': return { ...baseStyle, backgroundColor: '#17a2b8', color: 'white' }; // Agregado por si acaso
            default: return baseStyle;
        }
    };

    const handleNuevo = () => setMostrarForm(!mostrarForm);

    // NUEVO: Handler para abrir/cerrar detalle
    const toggleDetalle = (id: number) => {
        if (expandedVentaId === id) {
            setExpandedVentaId(null); // Cerrar si ya está abierto
        } else {
            setExpandedVentaId(id); // Abrir el nuevo
        }
    };

    if (isLoadingVentas) return <p>Cargando ventas...</p>;
    if (isErrorVentas) return <p>Error al cargar los datos: {errorVentas?.message}</p>;

    return (
        <>
            <div className="cuerpoVentas" style={{ padding: '20px' }}>
                <CrearVentaForm onClose={handleNuevo} visible={mostrarForm} />

                <div className="titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Ventas</p>
                    <Boton1 variant="info" onClick={() => handleNuevo()}>+ Venta</Boton1>
                </div>

                {/* --- Lista de Ventas --- */}
                <div style={{ display: "grid", gap: "20px" }}>
                    {ventas.map((venta) => (
                        <div
                            key={venta.id}
                            style={{
                                padding: "20px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            }}
                        >
                            {/* CABECERA DE LA TARJETA */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 10px 0", color: "#333", display: 'flex', alignItems: 'center' }}>
                                        Venta N° {venta.id} {/* Corregido: numeroVenta */}
                                        <span style={getEstadoStyle(venta.estado)}>{venta.estado}</span>
                                    </h3>
                                    <p style={{ margin: "0 0 10px 0", color: "#007bff", fontSize: "1.5em", fontWeight: "bold" }}>
                                        Total: Bs.{Number(venta.total).toFixed(2)}
                                    </p>
                                    <div style={{ fontSize: "14px", color: "#666" }}>
                                        <p style={{ margin: "4px 0" }}><strong>Cliente:</strong> {venta.cliente}</p>
                                        <p style={{ margin: "4px 0" }}><strong>Pago:</strong> {venta.metodoPago || 'N/A'}</p>
                                        <p style={{ margin: "4px 0" }}><strong>Sucursal:</strong> {venta.sucursal?.nombre || 'N/A'}</p>
                                        <p style={{ margin: "4px 0" }}><strong>Items:</strong> {venta.items.length}</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" }}>
                                    <Boton1 
                                        variant={expandedVentaId === venta.id ? "secondary" : "primary"}
                                        size="medium"
                                        onClick={() => toggleDetalle(venta.id)}
                                    >
                                        {expandedVentaId === venta.id ? "Ocultar Detalles" : "Ver Detalles"}
                                    </Boton1>
                                </div>
                            </div>
                            
                            {/* SECCIÓN DE DETALLE DESPLEGABLE */}
                            {expandedVentaId === venta.id && (
                                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #ccc", animation: "fadeIn 0.3s ease-in" }}>
                                    <h4 style={{marginTop: 0, marginBottom: "10px", fontSize: "16px"}}>Detalle de Productos</h4>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", color: "#555" }}>
                                                <th style={{ padding: "8px" }}>Producto</th>
                                                <th style={{ padding: "8px", textAlign: "center" }}>Talla</th>
                                                <th style={{ padding: "8px", textAlign: "center" }}>Cant.</th>
                                                <th style={{ padding: "8px", textAlign: "right" }}>P. Unit</th>
                                                <th style={{ padding: "8px", textAlign: "right" }}>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {venta.items.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                                <td style={{ padding: "8px" }}>{item.producto?.nombre || `ID: ${item.productoId}`}</td>
                                                    <td style={{ padding: "8px", textAlign: "center" }}>
                                                        <span style={{ background: "#eee", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>
                                                            {item.talla}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "8px", textAlign: "center" }}>{item.cantidad}</td>
                                                    <td style={{ padding: "8px", textAlign: "right" }}>{Number(item.precio).toFixed(2)}</td>
                                                    <td style={{ padding: "8px", textAlign: "right" }}>{(item.cantidad * Number(item.precio)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    {/* INFORMACIÓN ADICIONAL SI HAY */}
                                    {(venta.cliente ) && (
                                        <div style={{ marginTop: "15px", background: "#f9f9f9", padding: "10px", borderRadius: "5px", fontSize: "13px" }}>
                                            <strong>Datos de Envío/Contacto:</strong>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                                {venta.direccion && <div>📍 Dirección: {venta.direccion}</div>}
                                                {venta.telefono && <div>📞 Teléfono: {venta.telefono}</div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FOOTER DE TARJETA */}
                            <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee", fontSize: "12px", color: "#999" }}>
                                Creada: {new Date(venta.createdAt).toLocaleDateString()} a las {new Date(venta.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Manejo de lista vacía --- */}
                {ventas.length === 0 && (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "20px" }}>
                        <h3>{debouncedSearch ? "No se encontraron ventas" : "No hay ventas registradas"}</h3>
                    </div>
                )}
                
                {/* --- Contador de Total --- */}
                {ventas.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "20px", padding: "15px", backgroundColor: "#e7f3ff", borderRadius: "8px", color: "#0066cc" }}>
                        Mostrando **{ventas.length}** de **{total}** ventas
                    </div>
                )}
            </div>
            
            {/* Estilos inline para la animación simple */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Ventas;