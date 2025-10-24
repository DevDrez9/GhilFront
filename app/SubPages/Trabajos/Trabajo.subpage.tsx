// En ~/componentes/Trabajos/Trabajos.tsx

import { useState, useMemo } from "react";
import type { TrabajoResponseDto } from "~/models/trabajo";
import { useTrabajos } from "~/hooks/useTrabajos";
import Boton1 from "~/componentes/Boton1";
import TrabajoForm from "~/formularios/TrabajosForm/TrabajosForm.form";
import FinalizarTrabajoForm from "~/formularios/TrabajosForm/TrabajoFinForm.form";
import "./Trabajo.style.css";

// Define los tipos de estado para un mejor control y autocompletado.
type EstadoTrabajo = "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO";

/**
 * Componente visual que muestra una barra de progreso basada en el estado del trabajo.
 */
const ProgressBar = ({ estado }: { estado: EstadoTrabajo }) => {
  const estados: EstadoTrabajo[] = ["PENDIENTE", "EN_PROCESO", "COMPLETADO"];
  const estadoActualIndex = estados.indexOf(estado);

  const getStatusColor = (index: number) => {
    if (estado === "CANCELADO") return "#dc3545"; // Rojo para cancelado
    if (index <= estadoActualIndex) return "#28a745"; // Verde para etapas completadas
    return "#e0e0e0"; // Gris para etapas pendientes
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
      {estados.map((step, index) => (
        <div key={step} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            height: '8px',
            backgroundColor: getStatusColor(index),
            borderRadius: '4px',
            transition: 'background-color 0.3s'
          }}></div>
          <small style={{
            marginTop: '4px',
            color: index <= estadoActualIndex && estado !== "CANCELADO" ? '#333' : '#999',
            fontWeight: index === estadoActualIndex ? 'bold' : 'normal'
          }}>
            {step.replace('_', ' ')}
          </small>
        </div>
      ))}
    </div>
  );
};

/**
 * Componente principal para gestionar y visualizar la lista de trabajos.
 */
const Trabajos = () => {
  // Estado para el filtro seleccionado en el dropdown.
  const [filtroEstado, setFiltroEstado] = useState<EstadoTrabajo | "TODOS">("TODOS");

  // Llama al hook `useTrabajos` pasándole el filtro de estado.
  // Si el filtro es "TODOS", se pasa `undefined` para que la API devuelva todos los trabajos.
  const {
    trabajos, // Esta lista ya viene filtrada desde el backend.
    total,
    isLoading,
    isError,
    error,
    deleteTrabajo,
    isDeleting,
    iniciarTrabajo,
    isStarting,
  } = useTrabajos({
    estado: filtroEstado === 'TODOS' ? undefined : filtroEstado,
  });

  // Estados para controlar la visibilidad de los modales (formularios).
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [trabajoParaFinalizar, setTrabajoParaFinalizar] = useState<TrabajoResponseDto | null>(null);

  // --- MANEJADORES DE ACCIONES ---

  const handleIniciar = async (id: number) => {
    if (window.confirm("¿Estás seguro de iniciar este trabajo?")) {
      try {
        await iniciarTrabajo(id);
        alert("Trabajo iniciado correctamente.");
      } catch (err: any) {
        alert(`Error al iniciar el trabajo: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de cancelar (eliminar) este trabajo?")) {
      try {
        await deleteTrabajo(id);
        alert("Trabajo eliminado correctamente.");
      } catch (err: any) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  // --- RENDERIZADO DEL COMPONENTE ---

  if (isLoading) return <p>Cargando trabajos...</p>;
  if (isError) return <p>Error al cargar los datos: {error?.message}</p>;

  return (
    <>
      <div className="cuerpoTrabajos">
        
        {/* Renderizado condicional de los formularios modales */}
        <TrabajoForm
          visible={mostrarFormNuevo}
          onClose={() => setMostrarFormNuevo(false)}
        />
        {trabajoParaFinalizar && (
        <FinalizarTrabajoForm
          visible={!!trabajoParaFinalizar}
          trabajo={trabajoParaFinalizar}
          onClose={() => setTrabajoParaFinalizar(null)}
        />)}

        <div className="titulo">
          <p>Trabajos</p>
          <Boton1 variant="info" onClick={() => setMostrarFormNuevo(true)}>
            + Agregar
          </Boton1>
        </div>

        {/* Selector para filtrar por estado */}
        <div style={{ margin: "20px 0", maxWidth: "300px" }}>
          <label htmlFor="estado-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Filtrar por estado:</label>
          <select
            id="estado-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoTrabajo | "TODOS")}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="TODOS">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="COMPLETADO">Completado</option>
            
          </select>
        </div>

        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {trabajos.map((trabajo) => {
            // --- NUEVO: Obtenemos la URL de la imagen de forma segura ---
            const imageUrl ="http://localhost:3000/uploads/productos/" +trabajo.parametrosTela?.producto?.imagenes?.[0]?.url;

            return (
              <div
                key={trabajo.id}
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {/* --- MODIFICADO: Contenedor principal ahora incluye la imagen --- */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  
                  {/* --- NUEVO: Contenedor de la imagen (se muestra solo si imageUrl existe) --- */}
                  {imageUrl && (
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={imageUrl}
                        alt={`Imagen de ${trabajo.parametrosTela?.nombreModelo}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "8px",
                          objectFit: "cover", // Asegura que la imagen cubra el espacio sin deformarse
                          border: "1px solid #eee"
                        }}
                      />
                    </div>
                  )}

                  {/* Contenedor para los detalles y los botones (ocupa el espacio restante) */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>
                          {trabajo.codigoTrabajo}
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "14px" }}>
                          <div><strong>Modelo:</strong> {trabajo.parametrosTela?.nombreModelo}</div>
                          <div><strong>Costurero:</strong> {trabajo.costurero ? `${trabajo.costurero.nombre} ${trabajo.costurero.apellido}` : 'Sin asignar'}</div>
                          <div><strong>Cantidad Solicitada:</strong> {trabajo.cantidad}</div>
                          <div><strong>Peso Total Tela:</strong> {trabajo.pesoTotal} kg</div>
                          {trabajo.trabajoFinalizado && (
                            <div><strong>Cantidad Producida:</strong> {trabajo.trabajoFinalizado.cantidadProducida}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" }}>
                        {trabajo.estado === "PENDIENTE" && (
                          <button onClick={() => handleIniciar(trabajo.id)} disabled={isStarting} className="btn-accion btn-iniciar">
                            {isStarting ? "Iniciando..." : "Iniciar Proceso"}
                          </button>
                        )}
                        {trabajo.estado === "EN_PROCESO" && (
                          <button onClick={() => setTrabajoParaFinalizar(trabajo)} className="btn-accion btn-finalizar">
                            Finalizar
                          </button>
                        )}
                        <button onClick={() => handleDelete(trabajo.id)} disabled={isDeleting} className="btn-accion btn-eliminar">
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </div>
                    
                    {/* La barra de progreso ahora está dentro de este contenedor flex */}
                    <ProgressBar estado={trabajo.estado as EstadoTrabajo} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje cuando no se encuentran trabajos */}
        {trabajos.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "20px" }}>
            <h3>No se encontraron trabajos</h3>
            <p>No hay resultados que coincidan con el filtro seleccionado.</p>
          </div>
        )}

        {/* Indicador del total de trabajos */}
        {trabajos.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "20px", padding: "15px", backgroundColor: "#e7f3ff", borderRadius: "8px" }}>
            Mostrando {trabajos.length} trabajos de un total de {total}
          </div>
        )}
      </div>

      {/* Estilos para los botones de acción. Idealmente, esto iría en `Trabajo.style.css` */}
      <style>{`
        .btn-accion {
          padding: 8px 12px;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: background-color 0.2s, opacity 0.2s;
        }
        .btn-accion:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .btn-iniciar { background-color: #007bff; }
        .btn-iniciar:hover:not(:disabled) { background-color: #0056b3; }
        .btn-finalizar { background-color: #28a745; }
        .btn-finalizar:hover:not(:disabled) { background-color: #218838; }
        .btn-eliminar { background-color: #dc3545; }
        .btn-eliminar:hover:not(:disabled) { background-color: #c82333; }
      `}</style>
    </>
  );
};

export default Trabajos;