import { useState } from "react";
// Importar los componentes base
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
// 🎯 Importar tu componente ComboBox1
import ComboBox1 from "~/componentes/ComboBox1"; 

// Importar los hooks y modelos
import { useInventarioTelas } from "~/hooks/useInventarioTelas";
// ASUME que estos hooks existen y devuelven data:
import { useParametrosFisicosTelas } from "~/hooks/useParametrosFisicosTelas"; 
import { useProveedores } from "~/hooks/useProveedores"; 
import type { CreateInventarioTelaDto } from "~/models/inventarioTelas";
import "./InventarioTela.style.css"
import { useTelas } from "~/hooks/useTelas";

interface InventarioTelaFormProps {
  visible: boolean;
  onClose: () => void;
}

// Estructura de un item en el estado del formulario
type InventarioItem = CreateInventarioTelaDto & { 
    localKey: number; 
    errors?: Record<string, string>;
};

// Función para crear un nuevo item de inventario vacío
const createEmptyItem = (): InventarioItem => ({
    localKey: Date.now() + Math.random(), 
    proveedorId: 0,
    telaId: 0,
    cantidadRollos: 0,
    presentacion: '',
    tipoTela: '',
    color: '',
    precioKG: 0,
    pesoGrupo: 0,
    importe: undefined,
});

const COLORES_DISPONIBLES= [
    { value: '', label: 'Seleccionar Color' }, // Opción por defecto
    { value: 'rojo', label: 'Rojo' },
    { value: 'azul', label: 'Azul' },
    { value: 'verde', label: 'Verde' },
    { value: 'negro', label: 'Negro' },
];



const InventarioTelaForm: React.FC<InventarioTelaFormProps> = ({ visible, onClose }) => {
  const { createManyInventarioTela, isCreating, createError } = useInventarioTelas();

  const containerClasses = [
    "contenedorFormInventarioTela",
    visible ? "visible" : "noVisible",
  ].filter(Boolean).join(" ");

  // ----------------------------------------------------
  // CONSUMO DE DATOS Y OPCIONES PARA COMBOBOX
  // ----------------------------------------------------
  
  // Asumimos que useProveedores no necesita un debouncedSearch si trae toda la data.
  const { parametros } = useParametrosFisicosTelas(); 
  const { proveedores } = useProveedores("");  
  const { telas } = useTelas();           
  
  // Mapeo de datos para ComboBox1: { value: string, label: string }[]
  
  // Proveedores
  const proveedorOptions = proveedores.map(p => ({ 
      value: String(p.id), 
      label: p.nombre 
  }));
  
  // Telas (Usamos el ID como valor y el ID/Nombre como label)
  const telaOptions = telas.map(p => ({ 
      value: String(p.id), 
      label: p.nombreComercial
  }));
  
  // Presentación (Usamos el campo 'nombre' como presentación, y eliminamos duplicados)
  const presentacionOptions = Array.from(new Set(parametros.map(p => p.nombre)))
      .map(nombre => ({ value: nombre, label: nombre }));

  // ----------------------------------------------------
  // ESTADO Y MANEJADORES
  // ----------------------------------------------------

  const [inventarioItems, setInventarioItems] = useState<InventarioItem[]>([
    createEmptyItem(), 
  ]);
  
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleItemChange = (key: number, field: keyof InventarioItem, value: string | number) => {
    setInventarioItems(prevItems =>
      prevItems.map(item => {
        if (item.localKey === key) {
          const newItem = {
            ...item,
            [field]: value,
          };
          
          // Lógica especial para 'telaId' (ID Numérico)
          if (field === 'telaId') {
              const selectedTelaId = Number(value); // El valor viene como string del ComboBox
              newItem.telaId = selectedTelaId;
              
              // 🎯 Buscar el parámetro para obtener el nombre (presentacion)
              const parametroSeleccionado = parametros.find(p => p.id === selectedTelaId);
              
              if (parametroSeleccionado) {
                  // Asignamos el campo 'nombre' del DTO de parámetro al campo 'presentacion'
                  newItem.presentacion = parametroSeleccionado.nombre;
              } else {
                  newItem.presentacion = ''; // Limpiar si no se encuentra
              }
          }
          
          // Lógica especial para 'proveedorId' (ID Numérico)
          if (field === 'proveedorId') {
              newItem.proveedorId = Number(value);
          }

          // Lógica especial para 'presentacion' (String)
          if (field === 'presentacion') {
              newItem.presentacion = String(value);
          }
          
          // Cálculo automático de importe: Importe = PrecioKG * PesoGrupo
          if (field === 'precioKG' || field === 'pesoGrupo') {
              const precio = field === 'precioKG' ? Number(value) : Number(item.precioKG);
              const peso = field === 'pesoGrupo' ? Number(value) : Number(item.pesoGrupo);
              
              if (precio > 0 && peso > 0) {
                  newItem.importe = precio * peso;
              } else {
                  newItem.importe = undefined;
              }
          }

          return newItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setInventarioItems(prevItems => [...prevItems, createEmptyItem()]);
  };

  const removeItem = (key: number) => {
    setInventarioItems(prevItems => prevItems.filter(item => item.localKey !== key));
  };
  
  // ----------------------------------------------------
  // VALIDACIÓN Y SUBMIT
  // ----------------------------------------------------

  const validate = (): boolean => {
    setGlobalError(null);
    let allValid = true;

    const validatedItems = inventarioItems.map(item => {
        const newErrors: Record<string, string> = {};
        
        // La validación ahora debe verificar que los IDs seleccionados sean > 0.
        if (!item.proveedorId || item.proveedorId <= 0) newErrors.proveedorId = "Req.";
        if (!item.telaId || item.telaId <= 0) newErrors.telaId = "Req.";
        if (!item.presentacion.trim()) newErrors.presentacion = "Req.";
        
        // Resto de validaciones
        if (!item.cantidadRollos || Number(item.cantidadRollos) <= 0) newErrors.cantidadRollos = "Inv.";
        if (!item.precioKG || Number(item.precioKG) <= 0) newErrors.precioKG = "Inv.";
        if (!item.pesoGrupo || Number(item.pesoGrupo) <= 0) newErrors.pesoGrupo = "Inv.";
        
        if (!item.color.trim()) newErrors.color = "Req.";
        
        if (Object.keys(newErrors).length > 0) {
            allValid = false;
        }
        
        return { ...item, errors: newErrors };
    });
    
    setInventarioItems(validatedItems);
    
    if (inventarioItems.length === 0) {
        setGlobalError("Debe agregar al menos un registro de inventario.");
        allValid = false;
    }

    return allValid;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSend: CreateInventarioTelaDto[] = inventarioItems.map(item => {
          // Limpieza de decimales: convertir a string, reemplazar coma por punto, y luego a Number
          const cleanPrecioKG = String(item.precioKG).replace(',', '.');
          const cleanPesoGrupo = String(item.pesoGrupo).replace(',', '.');
          
          return {
            proveedorId: item.proveedorId, // Ya es Number
            telaId: item.telaId,           // Ya es Number
            cantidadRollos: Number(item.cantidadRollos),
            presentacion: item.presentacion, 
            tipoTela: item.tipoTela,
            color: item.color,
            precioKG: Number(cleanPrecioKG),
            pesoGrupo: Number(cleanPesoGrupo),
            importe: item.importe ? Number(String(item.importe).replace(',', '.')) : undefined, 
          };
        });

        await createManyInventarioTela(dataToSend);
        onClose();
      } catch (error) {
        // ... (manejo de errores)
      }
    } 
  };

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------

  return (
    <div className={containerClasses}>
      <div className="cuerpoInventarioTelaForm">
        <h2>Registro Masivo de Inventario de Tela</h2>

        <Boton1 type="button" size="medium" variant="info" onClick={onClose} style={{ marginBottom: '20px' }}>
          Atrás
        </Boton1>

        <div className="formInventarioTela">
          <form onSubmit={handleSubmit}>
            
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '1200px', minHeight:"500px"}}>
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Proveedor *</th>
                    <th style={{ width: 100 }}>Tela ID *</th>
                    <th style={{ width: 120 }}>Presentación *</th>
                    <th style={{ width: 80 }}>Rollos *</th>
                    {/*<th style={{ width: 100 }}>Tipo Tela *</th>*/}
                    <th style={{ width: 100 }}>Color *</th>
                    <th style={{ width: 100 }}>Precio KG *</th>
                    <th style={{ width: 100 }}>Peso Grupo *</th>
                    <th style={{ width: 100 }}>Importe</th>
                    <th style={{ width: 50 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioItems.map((item) => (
                    <tr key={item.localKey}>
                      
                      {/* PROVEEDOR ID (COMBOBOX) */}
                      <td>
                        <ComboBox1
                          value={String(item.proveedorId) || ''}
                          onChange={(val) => handleItemChange(item.localKey, 'proveedorId', val)}
                          options={proveedorOptions}
                          placeholder="Prov."
                          width="100%"
                          errorMessage={item.errors?.proveedorId}
                        />
                      </td>
                      
                      {/* TELA ID (COMBOBOX) */}
                      <td>
                        <ComboBox1
                          value={String(item.telaId) || ''}
                          onChange={(val) =>{ handleItemChange(item.localKey, 'telaId', val)
                             handleItemChange(item.localKey, "tipoTela",item.presentacion)
                          }}
                          options={telaOptions}
                          placeholder="Tela"
                          width="100%"
                          errorMessage={item.errors?.telaId}
                        />
                      </td>
                      
                      {/* PRESENTACION (COMBOBOX DEBIDO A LA ESTRUCTURA DEL HOOK) */}
                      <td>
                        <ComboBox1 
                            value={item.presentacion} 
                            onChange={(val) => handleItemChange(item.localKey, 'presentacion', val)} 
                            options={presentacionOptions}
                            placeholder="Pres."
                            width="100%"
                            errorMessage={item.errors?.presentacion}
                            // Si la presentación se elige automáticamente con Tela ID, hazlo solo lectura:
                            // disabled={!!item.telaId && item.telaId > 0} 
                        />
                      </td>

                      {/* CANTIDAD ROLLOS */}
                      <td>
                        <InputText1 
                          value={item.cantidadRollos+"" || ''} 
                          onChange={(val) => handleItemChange(item.localKey, 'cantidadRollos', val)} 
                          type="number" 
                          width="100%"
                          errorMessage={item.errors?.cantidadRollos}
                        />
                      </td>
                      
                      {/* TIPO TELA */}
                     {/* <td>
                        <InputText1 
                          value={item.tipoTela} 
                          onChange={(val) => handleItemChange(item.localKey, 'tipoTela', val)} 
                          type="text" 
                          width="100%"
                          errorMessage={item.errors?.tipoTela}
                        />
                      </td>*/}
                      
                      {/* COLOR */}
                      <td>
    {/* 🎯 Usamos el componente Combobox1 */}
    <ComboBox1 
        // El valor actual de la opción seleccionada
        value={item.color} 
        
        // La lista de opciones disponibles
        options={COLORES_DISPONIBLES} 
        
        // La función de manejo de cambios. 
        // Asegúrate de que Combobox1 devuelve solo el 'value' (string o number).
        onChange={(val) => handleItemChange(item.localKey, 'color', val)} 
        
        width="100%"
        errorMessage={item.errors?.color}
    />
</td>
                      
                      {/* PRECIO KG */}
                      <td>
                        <InputText1 
                          value={item.precioKG+"" || ''} 
                          onChange={(val) => handleItemChange(item.localKey, 'precioKG', val)} 
                          type="number" 
                          step="0.01" 
                          width="100%"
                          errorMessage={item.errors?.precioKG}
                        />
                      </td>
                      
                      {/* PESO GRUPO */}
                      <td>
                        <InputText1 
                          value={item.pesoGrupo+"" || ''} 
                          onChange={(val) => handleItemChange(item.localKey, 'pesoGrupo', val)} 
                          type="number" 
                          step="0.01" 
                          width="100%"
                          errorMessage={item.errors?.pesoGrupo}
                        />
                      </td>
                      
                      {/* IMPORTE (Solo Lectura) */}
                      <td>
    <InputText1 
     
      value={item.importe !== undefined ? item.importe.toFixed(2) : ''} 
      type="text" 
      readOnly
      width="100%"
      
      // 🎯 SOLUCIÓN AL ERROR: Añade una función vacía para satisfacer la prop requerida.
      onChange={() => {}} 
    />
</td>
                      
                      {/* ACCIÓN */}
                      <td>
                        <Boton1 
                          type="button" 
                          variant="danger" 
                          size="small" 
                          onClick={() => removeItem(item.localKey)}
                          disabled={inventarioItems.length === 1}
                          style={{ margin: 'auto', display: 'block' }}
                        >
                          X
                        </Boton1>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Boton1 
              type="button" 
              variant="secondary" 
              onClick={addItem}
              style={{ marginTop: '15px' }}
            >
              + Agregar Fila
            </Boton1>

            {/* Manejo de Errores */}
            {(globalError || createError) && (
              <div className="error-alert" style={{ marginTop: '15px' }}>
                {globalError || `Error API: ${createError?.message}`}
              </div>
            )}

            <Boton1 
              type="submit" 
              fullWidth 
              size="large" 
              disabled={isCreating}
              style={{ marginTop: '20px' }}
            >
              {isCreating ? "Guardando..." : `Guardar ${inventarioItems.length} Registros`}
            </Boton1>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventarioTelaForm;