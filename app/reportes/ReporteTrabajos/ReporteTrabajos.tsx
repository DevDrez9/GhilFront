import React, { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
// 🛑 Reemplaza estas rutas con las correctas en tu proyecto
import Boton1 from '~/componentes/Boton1'; 
import { useTrabajosFinalizados } from '~/hooks/useTrabajosFinalizados';

import { exportToPDF } from '~/utils/exportUtils'; // Requerido para PDF


// --- UTILIDADES ---
const formatCurrency = (amount) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 


// Estilos tipados para la tabla
const tableHeaderStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' };
const tableCellStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '8px' };
// -------------------

const ReporteTrabajosFinalizados: React.FC = () => {
    
    const reporteRef = useRef(null); 
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // 🚨 Debe implementarse el debounce real

    const {
        trabajos = [],
        total = 0,
        isLoading,
        isError,
        error,
        // deleteTrabajoFinalizado, // Ignoramos las funciones de mutación para el reporte
    } = useTrabajosFinalizados(debouncedSearch); 
    
    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `reporte_trabajos_finalizados_${date}.pdf`;
            
            exportToPDF(reporteRef.current, filename, `Reporte de Trabajos Finalizados - Total: ${total}`);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        // 🚨 Simulación de debounce
        setDebouncedSearch(value); 
    };

    return (
        <div className="contenedorReporteTrabajos" style={{ padding: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>✅ Reporte de Trabajos de Producción Finalizados</h2>
                <Boton1 
                    variant="primary" 
                    size="medium" 
                    onClick={handleDownloadPDF}
                    disabled={isLoading || trabajos.length === 0} 
                >
                    Descargar PDF ({total} trabajos)
                </Boton1>
            </div>

            {/* FILTRO DE BÚSQUEDA */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Buscar por costurero o código de trabajo..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                    disabled={isLoading}
                />
            </div>
            
            {/* CONTENIDO PARA CAPTURA PDF */}
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}>
                
                {isLoading && <p>Cargando trabajos finalizados...</p>}
                
                {isError && (
                    <p style={{ color: 'red' }}>Error al cargar los trabajos: {error?.message || "Error desconocido."}</p>
                )}

                {!isLoading && trabajos.length === 0 && (
                    <p>No se encontraron trabajos finalizados que coincidan con la búsqueda.</p>
                )}

                {!isLoading && trabajos.length > 0 && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={tableHeaderStyle}>Cód. Trabajo</th>
                                <th style={tableHeaderStyle}>Producto/Modelo</th>
                                <th style={tableHeaderStyle}>Costurero</th>
                               {/* <th style={tableHeaderStyle}>Fec. Inicio</th>*/}
                                <th style={tableHeaderStyle}>Fec. Finalización</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Cant. Producida</th>
                                <th style={tableHeaderStyle}>Calidad</th>
                                <th style={{...tableHeaderStyle, textAlign: 'right'}}>Costo (Total)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trabajos.map((item) => (
                                <tr key={item.id}>
                                    <td style={tableCellStyle}>{item.trabajoEnProceso.codigoTrabajo}</td>
                                    <td style={tableCellStyle}>{item.trabajoEnProceso.parametrosTela?.producto?.nombre || 'N/A'}</td>
                                    <td style={tableCellStyle}>
                                        {/* APLICACIÓN DE LA CORRECCIÓN */}
                                        {item.trabajoEnProceso?.costurero?.nombre || "N/A"} {item.trabajoEnProceso?.costurero?.apellido || ""}
                                    </td>
                                    {/*
                                    <td style={tableCellStyle}>{item.trabajoEnProceso.createdAt}</td>*/}
                                    <td style={tableCellStyle}>{item.fechaFinalizacion+""}</td>
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{item.cantidadProducida}</td>
                                    <td style={tableCellStyle}>
                                        <span style={{ color: item.calidad === 'DEFECTUOSO' ? 'red' : 'green' }}>
                                            {item.calidad}
                                        </span>
                                    </td>
                                    <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.costo)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReporteTrabajosFinalizados;