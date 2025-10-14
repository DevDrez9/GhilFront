import React, { useMemo, useState, useRef } from 'react';
import type { CSSProperties } from 'react';
// 🛑 Reemplaza estas rutas con las correctas en tu proyecto
import Boton1 from '~/componentes/Boton1';
import ComboBox1 from '~/componentes/ComboBox1';
import { exportToPDF } from '~/utils/exportUtils'; // Necesario para la descarga PDF
// Asumimos que estos hooks existen
import { useSucursales } from '~/hooks/useSucursales'; 
import { useInventarioSucursal } from '~/hooks/useInventarioSucursal';


// --- DTOs y Tipos (Asumidos) ---
interface SucursalResponseDto {
    id: number;
    nombre: string;
}
interface InventarioItemDto {
    id: number;
    stock: number;
    stockMinimo: number;
    precio: string; // Precio de venta
    sucursalId: number;
    producto: {
        id: number;
        nombre: string;
        codigo: string;
    };
}
interface ComboBoxOption {
    value: string;
    label: string;
    data: any; 
}

// --- UTILIDADES ---
const formatCurrency = (amount) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 

// Estilos tipados para evitar el error TS2322
const tableHeaderStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' };
const tableCellStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '8px' };
// -------------------

const ReporteInventarioSucursal: React.FC = () => {
    
    const reporteRef = useRef(null); 
    // Estado de filtros
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // 🚨 Debe implementarse el debounce real
    const [selectedSucursalId, setSelectedSucursalId] = useState<number | undefined>(undefined);

    // --- HOOKS DE DATOS ---
    // Usamos un mock para el entorno de desarrollo si useSucursales no existe aún
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 
    // MOCK temporal de Sucursales si useSucursales no funciona:
    /*
    const sucursales: SucursalResponseDto[] = [{ id: 1, nombre: 'Sucursal Central' }, { id: 2, nombre: 'Sucursal Norte' }];
    const isLoadingSucursales = false;
    */

    // 🛑 1. CONSTRUIMOS EL OBJETO DE OPCIONES UNIFICADO PARA EL HOOK
    const queryOptions = useMemo(() => ({
        searchTerm: debouncedSearch,
        sucursalId: selectedSucursalId,
    }), [debouncedSearch, selectedSucursalId]);

    // 🛑 2. LLAMAMOS AL HOOK CON EL OBJETO DE OPCIONES
    // Asumiendo que useInventarioSucursal devuelve el formato: { inventario: InventarioItemDto[], total: number, ... }
    const {
        inventario = [],
        total = 0,
        isLoading: isLoadingInventario,
        isError,
        error,
        // Eliminamos las funciones de mutación si solo es para el reporte
    } = useInventarioSucursal(queryOptions); 
    
    const isLoading = isLoadingSucursales || isLoadingInventario;
    
    // --- LÓGICA DE FILTROS ---

      const fechaActual = new Date();
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11, por eso se suma 1
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;
    
    // Opciones para el ComboBox (incluye la opción consolidada/todas)
    const sucursalComboBoxOptions: ComboBoxOption[] = useMemo(() => {
        // Opción para ver todas las sucursales juntas (si tu backend lo permite, sino omitir)
        const defaultOption: ComboBoxOption = {
            value: 'todas',
            label: 'Todas las Sucursales',
            data: { id: undefined }
        };

        const options = sucursales.map((suc) => ({
            value: suc.id.toString(),
            label: suc.nombre,
            data: suc
        }));

        return [defaultOption, ...options];
    }, [sucursales]);

    // Manejador de cambio del ComboBox
    const handleSucursalChange = (value: string) => {
        if (value === 'todas') {
            setSelectedSucursalId(undefined); // undefined para 'todas'
        } else if (value) {
            setSelectedSucursalId(Number(value)); 
        } else {
            setSelectedSucursalId(undefined); 
        }
    };

    // Valor actual para el ComboBox (Necesita el objeto completo)
    const currentSucursalOption: ComboBoxOption | null = useMemo(() => {
        const valueToFind = selectedSucursalId === undefined 
            ? 'todas' 
            : selectedSucursalId.toString();

        return sucursalComboBoxOptions.find(opt => opt.value === valueToFind) || null;
    }, [selectedSucursalId, sucursalComboBoxOptions]);
    
    // Título dinámico
    let titleScope: string;
    if (selectedSucursalId === undefined) {
        titleScope = `Todas las Sucursales (${total} productos)`;
    } else {
        const sucursal = sucursales.find((s) => s.id === selectedSucursalId);
        titleScope = sucursal ? `${sucursal.nombre} (${total} productos)` : `Sucursal ID: ${selectedSucursalId}`;
    }

    // Manejador de búsqueda
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        // 🚨 Simulación de debounce: en producción, usa un hook de debounce
        setDebouncedSearch(value); 
    };

    // --- LÓGICA DE PDF ---
    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `reporte_inventario_sucursal_${date}.pdf`;
            
            exportToPDF(reporteRef.current, filename, `Reporte de Inventario por Sucursal: ${titleScope}`);
        }
    };
    
    if (isLoading) {
        return <div style={{ padding: '20px' }}><p>Cargando datos de sucursales e inventario...</p></div>;
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
                
                {/* 1. Selector de Sucursal */}
                <div style={{ width: '300px' }}>
                    <ComboBox1 
                        label="Seleccionar Sucursal" 
                        options={sucursalComboBoxOptions} 
                        onChange={handleSucursalChange} 
                        value={currentSucursalOption.value+""} 
                        placeholder="Seleccione la sucursal" 
                        width="100%" 
                        disabled={isLoadingSucursales || isLoadingInventario} 
                    />
                </div>
                
                {/* 2. Campo de Búsqueda
                <div style={{ width: '300px' }}>
                    <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '5px' }}>Buscar Producto</label>
                    <input
                        type="text"
                        placeholder="Nombre o código..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        disabled={isLoadingInventario}
                    />
                </div>
                 */}
            </div>
            
            {/* CONTENIDO DE LA TABLA (PARA CAPTURA PDF) */}
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}>
                
                {isError && (
                    <p style={{ color: 'red' }}>Error al cargar el inventario: {error?.message || "Error desconocido."}</p>
                )}

                {!isLoading && inventario.length === 0 && (
                    <p>No se encontraron productos en inventario con los filtros seleccionados.</p>
                )}

                {!isLoading && inventario.length > 0 && (
                    <div>  <h2 style={{fontSize:"18px", fontWeight:"bold"}}> Reporte Inventario Sucursal: {titleScope} </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={tableHeaderStyle}>Codigo</th>
                               {/* <th style={tableHeaderStyle}>Código</th>*/}
                                <th style={tableHeaderStyle}>Producto</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Stock</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Mínimo</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Precio Venta</th>
                                <th style={tableHeaderStyle}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventario.map((item) => (
                                <tr key={item.id}>
                                    <td style={tableCellStyle}>{item.id}</td>
                                   {/* <td style={tableCellStyle}>{item.producto.codigo}</td>*/}
                                    <td style={tableCellStyle}>{item.producto.nombre}</td>
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{item.stock}</td>
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{item.stockMinimo || '-'}</td>
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.producto.precio)}</td>
                                    <td style={tableCellStyle}>
                                        <span style={{ 
                                            color: item.stock === 0 ? 'red' : item.stock <= item.stockMinimo ? 'orange' : 'green' 
                                        }}>
                                            {item.stock === 0 ? 'Sin Stock' : item.stock <= item.stockMinimo ? 'Bajo Stock' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
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