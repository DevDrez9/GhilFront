import React, { useMemo, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import Boton1 from '~/componentes/Boton1';
import ComboBox1 from '~/componentes/ComboBox1';
import { exportToPDF } from '~/utils/exportUtils'; 
import { useSucursales } from '~/hooks/useSucursales'; 
import { useInventarioSucursal } from '~/hooks/useInventarioSucursal';
import { useOutletContext } from 'react-router';

// --- DTOs y Tipos (Asumidos) ---
interface SucursalResponseDto {
    id: number;
    nombre: string;
}
interface InventarioItemDto {
    id: number;
    // ✅ Asumimos que el hook ahora devuelve 'any' o 'Record<string, number>'
    stock: any; 
    stockMinimo: number;
    sucursalId: number;
    producto: {
        id: number;
        nombre: string;
        codigo: string;
        precio: string; // Asumimos que el precio está en el producto
    };
}
interface ComboBoxOption {
    value: string;
    label: string;
    data: any; 
}

interface LayoutContext {
    user: any;
    tienda: any;
}

// --- UTILIDADES ---
const formatCurrency = (amount: string | number) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 

/**
 * ✅ FUNCIÓN HELPER (Importar o definir aquí)
 * Calcula el stock total a partir de un objeto de stock por tallas.
 */
const calcularStockTotal = (stock: any): number => {
    if (typeof stock === 'object' && stock !== null && !Array.isArray(stock)) {
        return Object.values<number>(stock as Record<string, number>).reduce((sum, current) => sum + (current || 0), 0);
    }
    // Fallback por si acaso algún dato sigue siendo numérico
    if (typeof stock === 'number') {
        return stock;
    }
    return 0;
};

// Estilos
const tableHeaderStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' };
const tableCellStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '8px' };
// -------------------


const ReporteInventarioSucursal: React.FC = () => {
    const { user, tienda } = useOutletContext<LayoutContext>();
    const reporteRef = useRef(null); 
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedSucursalId, setSelectedSucursalId] = useState<number | undefined>(undefined);

    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    
    // --- HOOKS DE DATOS ---
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 

    const queryOptions = useMemo(() => ({
        searchTerm: debouncedSearch,
        sucursalId: selectedSucursalId,
    }), [debouncedSearch, selectedSucursalId]);

    // Asumimos que el hook 'useInventarioSucursal' devuelve el DTO con stock como objeto
    const {
        inventario = [],
        total = 0,
        isLoading: isLoadingInventario,
        isError,
        error,
    } = useInventarioSucursal(queryOptions); 
    
    const isLoading = isLoadingSucursales || isLoadingInventario;
    
    // --- LÓGICA DE FILTROS ---
    
    const sucursalComboBoxOptions: ComboBoxOption[] = useMemo(() => {
        const defaultOption: ComboBoxOption = { value: 'todas', label: 'Todas las Sucursales', data: { id: undefined } };
        const options = sucursales.map((suc) => ({
            value: suc.id.toString(),
            label: suc.nombre,
            data: suc
        }));
        return [defaultOption, ...options];
    }, [sucursales]);

    const handleSucursalChange = (value: string) => {
        if (value === 'todas') {
            setSelectedSucursalId(undefined);
        } else if (value) {
            setSelectedSucursalId(Number(value)); 
        } else {
            setSelectedSucursalId(undefined); 
        }
    };

    const currentSucursalOption = useMemo(() => {
        const valueToFind = selectedSucursalId === undefined ? 'todas' : selectedSucursalId.toString();
        return sucursalComboBoxOptions.find(opt => opt.value === valueToFind) || null;
    }, [selectedSucursalId, sucursalComboBoxOptions]);
    
    let titleScope: string;
    if (selectedSucursalId === undefined) {
        titleScope = `Todas las Sucursales (${total} productos)`;
    } else {
        const sucursal = sucursales.find((s) => s.id === selectedSucursalId);
        titleScope = sucursal ? `${sucursal.nombre} (${total} productos)` : `Sucursal ID: ${selectedSucursalId}`;
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        setDebouncedSearch(value); // Simulación de debounce
    };

    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `reporte_inventario_sucursal_${date}.pdf`;
            exportToPDF(reporteRef.current, filename, `Reporte de Inventario por Sucursal: ${titleScope}`);
        }
    };
    
    if (isLoading) {
        return <div style={{ padding: '20px' }}><p>Cargando datos...</p></div>;
    }
    
    return (
        <div className="reporteInventarioSucursalContainer" style={{ padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{fontSize:"30px", fontWeight:"bold"}}>📦 Inventario por Sucursal: {titleScope}</h2>
                <Boton1 
                    variant="primary" 
                    size="medium" 
                    onClick={handleDownloadPDF}
                    disabled={isLoading || inventario.length === 0} 
                >
                    Descargar PDF
                </Boton1>
            </div>

            {/* FILTROS */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                <div style={{ width: '300px' }}>
                    <ComboBox1 
                        label="Seleccionar Sucursal" 
                        options={sucursalComboBoxOptions} 
                        onChange={handleSucursalChange} 
                        value={currentSucursalOption?.value || 'todas'} 
                        placeholder="Seleccione la sucursal" 
                        width="100%" 
                        disabled={isLoading} 
                    />
                </div>
            </div>
            
            {/* CONTENIDO DE LA TABLA (PARA CAPTURA PDF) */}
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}>
                
                {isError && <p style={{ color: 'red' }}>Error: {error?.message}</p>}
                {!isLoading && inventario.length === 0 && <p>No se encontraron productos.</p>}

                {!isLoading && inventario.length > 0 && (
                    <div> 
                        <div style={{display:"flex", alignItems:"center"}}>
                            <img style={{height: '150px'}} src={ "http://localhost:3000/"+tienda.configWeb.logoUrl} alt={tienda.nombre}/>
                            <h3 style={{fontSize:"30px", fontWeight:"bold", marginLeft:"15px"} }> {tienda.nombre}</h3>
                        </div> 
                        <h2 style={{fontSize:"18px", fontWeight:"bold"}}> Reporte Inventario Sucursal: {titleScope} </h2>
                        
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={tableHeaderStyle}>ID</th>
                                    <th style={tableHeaderStyle}>Producto</th>
                                    {/* ✅ CAMBIO: Columna de Stock actualizada */}
                                    <th style={{...tableHeaderStyle, textAlign: 'center'}}>Stock (Total / Tallas)</th>
                                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Mínimo</th>
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
                                            <td style={tableCellStyle}>{item.producto?.nombre}</td>
                                            
                                            {/* ✅ CAMBIO: Mostrar Total y Desglose de Tallas */}
                                            <td style={{...tableCellStyle, textAlign: 'center', verticalAlign: 'top'}}>
                                                <strong style={{ fontSize: '1.2em' }}>{totalStock}</strong>
                                                <div style={{ fontSize: '0.85em', color: '#555', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                                                    {Object.keys(stockObj).length > 0 ? (
                                                        Object.entries(stockObj).map(([talla, qty]) => (
                                                            <span key={talla} style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                                {talla}: {qty}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: 'gray' }}>(N/A)</span>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            <td style={{...tableCellStyle, textAlign: 'right'}}>{item.stockMinimo || '-'}</td>
                                            <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.producto?.precio)}</td>
                                            
                                            {/* ✅ CAMBIO: Usar totalStock para el cálculo */}
                                            <td style={tableCellStyle}>
                                                <span style={{ 
                                                    color: totalStock === 0 ? 'red' : totalStock <= item.stockMinimo ? 'orange' : 'green' 
                                                }}>
                                                    {totalStock === 0 ? 'Sin Stock' : totalStock <= item.stockMinimo ? 'Bajo Stock' : 'OK'}
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

export default ReporteInventarioSucursal;