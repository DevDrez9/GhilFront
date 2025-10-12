// src/components/InventarioTelasList.tsx
import { useState } from 'react';
import { useInventarioTelas } from '~/hooks/useInventarioTelas';
import "./CompraTelasSubPage.style.css"
import Boton1 from '~/componentes/Boton1';
import InputText1 from '~/componentes/InputText1';
import InventarioTelaForm from '~/formularios/InventarioTelaForm/InventarioTelaForm.form';
import { EstadoCosturero } from '~/models/costureros';

export default function InventarioTelasList() {
  const [filters, setFilters] = useState({
    search: '',
    tipoTela: '',
    color: '',
  });

  const { 
    inventario, 
    isLoading, 
    isError, 
    error,
    deleteInventario,
    isDeleting,
    stats,
    isStatsLoading 
  } = useInventarioTelas(filters);

   const [mostrarForm, setMostrarForm] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: number, descripcion: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el item "${descripcion}" del inventario?`)) {
      try {
        await deleteInventario(id);
        alert('Item eliminado correctamente del inventario');
      } catch (error) {
        alert('Error al eliminar item del inventario');
      }
    }
  };

  const calculateTotalValue = () => {
    return inventario.reduce((total, item) => total + (item.importe || 0), 0);
  };

  const calculateTotalRolls = () => {
    return inventario.reduce((total, item) => total + item.cantidadRollos, 0);
  };

  if (isLoading) return <div>Cargando inventario...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

   const handleNuevo = () => {
    setMostrarForm(!mostrarForm);
  };


 
  return (
    <div className="cuerpoProveedores">
      <InventarioTelaForm onClose={handleNuevo} visible={mostrarForm} />
       
        <div className="titulo">
          <p>Inventario Telas</p>

          <Boton1 variant="info" onClick={() => {handleNuevo()}}>
            + Agregar
          </Boton1>
        </div>

        <div className="buscador">
          <InputText1
            value={""}
            onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            }}
            width="400px"
            label="Buscar Proveedor"
            placeholder="Nombre, Ruc, Celular"
          />
          <Boton1
            variant="secondary"
            size="medium"
            style={{ height: 40, marginLeft: 10 }}
          >
            Buscar
          </Boton1>
        </div>
      {/* Lista de inventario */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {inventario.map((item) => (
          <div key={item.id} style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            position: 'relative'
          }}>
            {/* Badge de cantidad */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: item.cantidadRollos > 0 ? '#4caf50' : '#f44336',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {item.cantidadRollos} rollos
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0' }}>
                  {item.tela?.nombreComercial || 'Tela sin nombre'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <strong>Presentación:</strong> {item.presentacion}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {item.tipoTela}
                  </div>
                  <div>
                    <strong>Color:</strong> 
                    <span style={{ 
                      display: 'inline-block',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: item.color.toLowerCase(),
                      marginLeft: '5px',
                      border: '1px solid #ccc'
                    }}></span>
                    {item.color}
                  </div>
                  <div>
                    <strong>Precio/KG:</strong> Bs{item.precioKG.toLocaleString()}
                  </div>
                  <div>
                    <strong>Peso Grupo:</strong> {item.pesoGrupo} kg
                  </div>
                  <div>
                    <strong>Importe:</strong> 
                    <span style={{ 
                      color: '#2e7d32', 
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      Bs{item.importe?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {item.proveedor && (
                  <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Proveedor:</strong> {item.proveedor.nombre}
                    {item.proveedor.contacto && ` (${item.proveedor.contacto})`}
                  </div>
                )}

                {item.tela && (
                  <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
                    <strong>Composición:</strong> {item.tela.composicion}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                
                {item.pesoGrupo==0?
                 <button 
                  onClick={() => handleDelete(item.id, item.tela?.nombreComercial || 'Item del inventario')}
                  disabled={isDeleting}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Eliminar
                </button>:null}
               
                   {/*
                <button 
                  onClick={() => window.location.href = `/inventario/${item.id}`}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Editar
                </button>
                 
                <button 
                  onClick={() => window.location.href = `/telas/${item.telaId}`}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ver Tela
                </button>*/}
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <span>Actualizado: {new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {inventario.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No se encontraron items en el inventario
        </div>
      )}
    </div>
  );
}