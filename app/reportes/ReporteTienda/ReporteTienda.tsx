import React, { useRef, useState, type CSSProperties } from 'react';
import { useOutletContext } from 'react-router';
import Boton1 from '~/componentes/Boton1'; 
import { useInventarioTienda } from '~/hooks/useInventarioTienda';
import { exportToPDF } from '~/utils/exportUtils';

// --- Asegúrate de importar la función ---
// import { calcularStockTotal } from '~/utils/calculos'; 
// O pégala aquí arriba (como en el ejemplo anterior)

const formatCurrency = (amount: number | string) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 

interface LayoutContext {
    user: any;
    tienda: any;
}

// ✅ Función de Ayuda (Helper) - Pégala aquí si no la importas
const calcularStockTotal = (stock: any): number => {
    if (typeof stock === 'object' && stock !== null && !Array.isArray(stock)) {
        return Object.values<number>(stock as Record<string, number>).reduce((sum, current) => sum + (current || 0), 0);
    }
    if (typeof stock === 'number') return stock;
    return 0;
};

const ReporteInventarioDetalle: React.FC = () => {
    const { user, tienda } = useOutletContext<LayoutContext>();
    
    const reporteRef = useRef(null); 
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); 

    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    const {
        inventario,
        total,
        isLoading,
        isError,
        error,
    } = useInventarioTienda(debouncedSearch); // Asumiendo que el hook acepta string

    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `reporte_inventario_detalle_${date}.pdf`;
            exportToPDF(reporteRef.current, filename, `Reporte Detallado de Inventario - (${total} productos)`);
        }
    };

    // ... (handleSearchChange) ...

    return (
        <div className="contenedorReporteDetalle" style={{ padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{fontSize:"30px", fontWeight:"bold"}}>📋 Reporte Almacén de productos</h2>
                <Boton1 
                    variant="primary" 
                    size="medium" 
                    onClick={handleDownloadPDF}
                    disabled={isLoading || inventario.length === 0} 
                >
                    Descargar PDF ({total} ítems)
                </Boton1>
            </div>
            
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '30px' }}>
                
                {isLoading && <p>Cargando inventario...</p>}
                {isError && <p style={{ color: 'red' }}>Error: {error?.message}</p>}
                {!isLoading && inventario.length === 0 && <p>No se encontraron productos.</p>}

                {!isLoading && inventario.length > 0 && (
                    <div> 
                        <div style={{display:"flex", alignItems:"center"}}>
                            <img style={{height: '150px'}} src={ (import.meta.env.VITE_API_URL + '/')+tienda.configWeb.logoUrl} alt={tienda.nombre}/>
                            <h3 style={{fontSize:"30px", fontWeight:"bold", marginLeft:"15px"} }> {tienda.nombre}</h3>
                        </div>
                        <h2 style={{fontSize:"18px", fontWeight:"bold"}}> Reporte Almacén de productos </h2>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={tableHeaderStyle}>ID</th>
                                    <th style={tableHeaderStyle}>Producto</th>
                                    <th style={{...tableHeaderStyle, textAlign: 'center'}}>Stock (Total y Tallas)</th> {/* ✅ Título Cambiado */}
                                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Precio Venta</th>
                                    <th style={tableHeaderStyle}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventario.map((item) => {
                                    // 1. Calcular total
                                    const totalStock = calcularStockTotal(item.stock);
                                    // 2. Obtener el objeto de stock
                                    const stockObj = (typeof item.stock === 'object' && item.stock !== null) 
                                                      ? (item.stock as Record<string, number>) 
                                                      : {};

                                    return (
                                        <tr key={item.id}>
                                            <td style={tableCellStyle}>{item.id}</td>
                                            <td style={tableCellStyle}>{item.producto.nombre}</td>
                                            
                                            {/* ✅ CAMBIO: Mostrar Total y Desglose de Tallas */}
                                            <td style={{...tableCellStyle, textAlign: 'center'}}>
                                                <strong style={{ fontSize: '1.2em' }}>{totalStock}</strong>
                                                <div style={{ fontSize: '0.85em', color: '#555', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                                                    {Object.keys(stockObj).length > 0 ? (
                                                        Object.entries(stockObj).map(([talla, qty]) => (
                                                            <span key={talla} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                                {talla}: {qty}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: 'gray' }}>(Sin desglose)</span>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.producto.precio)}</td>
                                            
                                            {/* ✅ CAMBIO: Usar totalStock para el cálculo */}
                                            <td style={tableCellStyle}>
                                                <span style={{ color: totalStock === 0 ? 'red' : totalStock <= item.stockMinimo ? 'orange' : 'green' }}>
                                                    {totalStock === 0 ? 'Sin Stock' : totalStock <= item.stockMinimo ? 'Bajo Stock' : 'Disponible'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        <h2 style={{color:"gray", margin:"10px 0"}}>Generado: {fechaFormateada}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Estilos (sin cambios) ---
const tableHeaderStyle: CSSProperties = { 
    border: '1px solid #dee2e6', 
    padding: '10px', 
    textAlign: 'left'
};
const tableCellStyle: CSSProperties = { 
    border: '1px solid #dee2e6', 
    padding: '8px' 
};

export default ReporteInventarioDetalle;