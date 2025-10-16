import { useTelas } from "~/hooks/useTelas";
import "./TelasSubPage.style.css"
import { useState } from "react";
import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import TelasForm from "~/formularios/TelasForm/TelasForm.form";
import type { TelaResponseDto } from "~/models/telas.model";
import TelasFormUpDate from "~/formularios/TelasForm/TelasFormUpDate.form";

const TelasSubPage = () => {
    const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipoTela: '',
  });

  const { 
    telas, 
    isLoading, 
    isError, 
    error,
    deleteTela,
    isDeleting ,
    deleteError
  } = useTelas(filters);


  const defaultTela: TelaResponseDto = {
    id:0,
      nombreComercial: "",
  tipoTela:"",
  composicion:"",
  gramaje:0,
  acabado:"",
  rendimiento:0,
  colores:"",
  nota:"",
  estado:"",
  proveedorId:0,
  createdAt:null,
  updatedAt:null
    };

  const [telasEdit, setTelasEdit] = useState(defaultTela);
  const [mostrarFormTelas, setMostrarForm] = useState(false);
    const [mostrarFormUpDateTelas, setMostrarFormUpDate] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la tela "${nombre}"?`)) {
      try {
        await deleteTela(id);
        if(deleteError){
          alert(deleteError.message)
         
        }else{
 alert('Tela eliminada correctamente');
        }
       
      } catch (error) {
        alert('Error al eliminar tela');
      }
    }
  };

  if (isLoading) return <div>Cargando telas...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

   


    const handleNuevo = () => {
    setMostrarForm(!mostrarFormTelas);
  };

    const handleCloseEdit = () => {
    setMostrarFormUpDate(!mostrarFormUpDateTelas);
  };

  
  
   
  
    const handleEdit = (proveedor: TelaResponseDto) => {
      setTelasEdit(proveedor);
      setMostrarFormUpDate(true);
    };

    return(<>
     <div className="cuerpoProveedores">
<TelasForm
          visible={mostrarFormTelas}
          onClose={handleNuevo}
        ></TelasForm>

         <TelasFormUpDate
          visible={mostrarFormUpDateTelas}
          onClose={handleCloseEdit}
          tela={telasEdit}
        ></TelasFormUpDate>
        <div className="titulo">
          <p>Tipo de Telas</p>

          <Boton1 variant="info" onClick={() =>{handleNuevo()} }>
            + Agregar
          </Boton1>
        </div>
{/*
        <div className="buscador">
          <InputText1
            value={""}
            onChange={function (value: string): void {
              throw new Error("Function not implemented.");
            }}
            width="400px"
            label="Buscar Tela"
            placeholder="Nombre"
          />
          <Boton1
            variant="secondary"
            size="medium"
            style={{ height: 40, marginLeft: 10 }}
          >
            Buscar
          </Boton1>
        </div>
    */}
        
    {/* Lista de telas */}

      <div style={{ display: 'grid', gap: '15px', marginTop:"50px"  }}>
        {telas.map((tela) => (
          <div key={tela.id} style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{tela.nombreComercial}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>{tela.tipoTela} • {tela.composicion}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  <div><strong>Gramaje:</strong> {tela.gramaje} g/m²</div>
                  <div><strong>Estado:</strong> 
                    <span style={{ 
                      color: tela.estado === 'ACTIVO' ? 'green' : 'red',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {tela.estado}
                    </span>
                  </div>
                  <div><strong>Colores:</strong> {tela.colores}</div>
                  
                  {tela.rendimiento && (
                    <div><strong>Rendimiento:</strong> {tela.rendimiento} mts/Kg</div>
                  )}
                  
                  {tela.proveedor && (
                    <div><strong>Proveedor:</strong> {tela.proveedor.nombre}</div>
                  )}
                </div>

                {tela.nota && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Notas:</strong> {tela.nota}
                  </div>
                )}

                {tela.parametrosFisicos && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
                    <strong>Parámetros Físicos:</strong> 
                    <div>Ancho: {tela.parametrosFisicos.anchoTela} cm • 
                    {tela.parametrosFisicos.tubular ? ' Tubular' : ' Plano'}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '100px' }}>
                <button 
                  onClick={() => handleDelete(tela.id, tela.nombreComercial)}
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
                </button>
                
                <button 
                  onClick={() => handleEdit(tela)}
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
{/*
                <button 
                  onClick={() => window.location.href = `/telas/${tela.id}/inventario`}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Inventario
                </button>*/}
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <span>Creado: {new Date(tela.createdAt).toLocaleDateString()}</span>
              <span style={{ marginLeft: '15px' }}>
                Actualizado: {new Date(tela.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {telas.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No se encontraron telas
        </div>
      )}
     </div>
        </>
  );
}

export default TelasSubPage;