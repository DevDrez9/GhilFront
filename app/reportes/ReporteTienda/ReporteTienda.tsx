import React, { useRef, useState, type CSSProperties } from 'react';
import { useOutletContext } from 'react-router';
// 🛑 Reemplaza estas con tus rutas reales de componentes
import Boton1 from '~/componentes/Boton1'; 
import { useInventarioTienda } from '~/hooks/useInventarioTienda';

import { exportToPDF } from '~/utils/exportUtils'; // Requerido para PDF

// Asumimos que formatCurrency está disponible globalmente o se importa
const formatCurrency = (amount) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 
// 🚨 Reutiliza o define la interfaz
interface LayoutContext {
    user,tienda
}


const ReporteInventarioDetalle: React.FC = () => {
    const { user, tienda } = useOutletContext<LayoutContext>();
    
    const reporteRef = useRef(null); 
    const [search, setSearch] = useState('');
    // Usaremos un debounce simple para simular el que usarías en producción
    const [debouncedSearch, setDebouncedSearch] = useState(''); 

     const fechaActual = new Date();
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11, por eso se suma 1
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;

    // Aquí deberías tener tu lógica de debounce (e.g., usando useDebounce hook)
    // Por simplicidad, en este ejemplo, no estamos haciendo el debounce real aquí.
    const {
        inventario,
        total,
        isLoading,
        isError,
        error,
        // Ignoramos deleteInventarioTienda y isDeleting para el reporte
    } = useInventarioTienda(debouncedSearch); 

    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `reporte_inventario_detalle_${date}.pdf`;
            
            exportToPDF(reporteRef.current, filename, `Reporte Detallado de Inventario - (${total} productos)`);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        // 🚨 Aquí iría la llamada a la función de debounce para actualizar debouncedSearch
        setDebouncedSearch(e.target.value); 
    };

    return (
        <div className="contenedorReporteDetalle" style={{ padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{fontSize:"30px", fontWeight:"bold"}}>📋 Reporte Almacen de productos</h2>
                <Boton1 
                    variant="primary" 
                    size="medium" 
                    onClick={handleDownloadPDF}
                    disabled={isLoading || inventario.length === 0} 
                >
                    Descargar PDF ({total} ítems)
                </Boton1>
            </div>

            {/* FILTRO DE BÚSQUEDA 
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Buscar producto por nombre/código..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                    disabled={isLoading}
                />
            </div>
            */}
            
            {/* CONTENIDO PARA CAPTURA PDF */}
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '30px' }}>
                
                
                {isLoading && <p>Cargando inventario...</p>}
                
                {isError && (
                    <p style={{ color: 'red' }}>Error al cargar el inventario: {error?.message || "Error desconocido."}</p>
                )}

                {!isLoading && inventario.length === 0 && (
                    <p>No se encontraron productos en inventario que coincidan con la búsqueda.</p>
                )}

                {!isLoading && inventario.length > 0 && (

                    
                    <div> 

                            <div style={{display:"flex", alignItems:"center"}}>
<img style={{height: '150px'}} src={ "http://localhost:3000/"+tienda.configWeb.logoUrl}/>
<h3 style={{fontSize:"30px",  fontWeight:"bold",  marginLeft:"15px"} }> {tienda.nombre}</h3>
                    </div>
                         <h2 style={{fontSize:"18px", fontWeight:"bold"}}> Reporte Almacen de productos </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={tableHeaderStyle}>ID Inventario</th>
                              {/*  <th style={tableHeaderStyle}>Código Producto</th>*/}
                                <th style={tableHeaderStyle}>Nombre Producto</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Stock Actual</th>
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
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.producto.precio)}</td>
                                    <td style={tableCellStyle}>
                                        <span style={{ color: item.stock === 0 ? 'red' : item.stock <= item.stockMinimo ? 'orange' : 'green' }}>
                                            {item.stock === 0 ? 'Sin Stock' : item.stock <= item.stockMinimo ? 'Bajo Stock' : 'Disponible'}
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

const tableHeaderStyle: CSSProperties = { 
    border: '1px solid #dee2e6', 
    padding: '10px', 
    textAlign: 'left' // Aquí el tipado es validado correctamente
};
const tableCellStyle: CSSProperties = { 
    border: '1px solid #dee2e6', 
    padding: '8px' 
};

export default ReporteInventarioDetalle;