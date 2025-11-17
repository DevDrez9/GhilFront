import { useState } from "react";
import "./ParametroFisicosTela.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useParametrosFisicosTelas } from "~/hooks/useParametrosFisicosTelas";
import { useAlert } from "~/componentes/alerts/AlertContext";

interface ParametroFisicosTelaFormProps {
  visible: boolean;
  onClose: () => void;
}

const ParametroFisicosTelaForm: React.FC<ParametroFisicosTelaFormProps> = ({ visible, onClose }) => {
  const { createParametro, isCreating, createError } =
    useParametrosFisicosTelas();

  const containerClasses = [
    "contenedorFormParametros",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formDataParametrosFisicosTela, setFormData] = useState({
    nombre: "",
    descripcion: "",
    anchoTela: 0,
    tubular: false,
    notasTela: "",
  });
  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formDataParametrosFisicosTela,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataParametrosFisicosTela.nombre)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // 1. Importar el hook
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validación inicial
    if (!validate()) {
      showAlert("Por favor, revisa los campos del formulario.", "warning");
      return;
    }

    try {
      // 2. Intentar crear
      await createParametro(formDataParametrosFisicosTela);

      // 3. SI LLEGA AQUÍ, FUE EXITOSO (No necesitas verificar isCreating)
      await showAlert("Presentación creada correctamente.", "success");
      
      onClose();
      // Recarga la página (aunque lo ideal sería recargar solo los datos con el hook)
      window.location.reload(); 

    } catch (error: any) {
      // 4. SI FALLA, CAE AQUÍ
      console.error(error);
      const msg = error?.message || "No se pudo guardar el parámetro/presentación.";
      showAlert(msg, "error");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoProveedorForm">
          <h2>Nuevo Parametro tela</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onClose();
            }}
          >
            {" "}
            Atras{" "}
          </Boton1>

          <div className="formProveedor">
            <form onSubmit={handleSubmit}>
              <h2>Datos Parametros</h2>
              <Switch1
                label="Tubular"
                checked={formDataParametrosFisicosTela.tubular}
                onChange={(value) => handleSwitchChange("tubular", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre "
                value={formDataParametrosFisicosTela.nombre}
                onChange={(val) => handleChange("nombre", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width={450}
              />
              <InputText1
                label="Ancho Tela (cm)"
                value={formDataParametrosFisicosTela.anchoTela+""}
                onChange={(val) => handleChange("anchoTela", val)}
                width={450}
                type="number"
              />
              <InputText1
                label="Descripcion"
                value={formDataParametrosFisicosTela.descripcion}
                onChange={(val) => handleChange("descripcion", val)}
                width={450}
                type="text"
              />
              <InputText1
                label="Notas"
                value={formDataParametrosFisicosTela.notasTela}
                onChange={(val) => handleChange("notasTela", val)}
                width={450}
                type="text"
              />
             
              <Boton1 type="submit" fullWidth size="medium" onClick={() => {}}>
                Guardar Proveedor
              </Boton1>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParametroFisicosTelaForm;
