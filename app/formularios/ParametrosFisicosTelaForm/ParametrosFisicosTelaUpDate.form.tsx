import { useEffect, useState } from "react";
import "./ParametroFisicosTela.style.css";
import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useParametrosFisicosTelas } from "~/hooks/useParametrosFisicosTelas";
import type { ParametrosFisicosTelaResponseDto } from "~/models/parametrosFisicosTela";

interface ParametroFisicosTelaUpDateFormProps {
  visible: boolean;
  onCloseUpDate: () => void;
   parametro: ParametrosFisicosTelaResponseDto
}

const ParametroFisicosTelaUpDateForm: React.FC<ParametroFisicosTelaUpDateFormProps> = ({ visible, onCloseUpDate,parametro }) => {
  const { updateParametro, isCreating, createError } =
    useParametrosFisicosTelas();


  const containerClasses = [
    "contenedorFormParametros",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

    console.log(parametro.nombre)

    const [formDataParametrosFisicosTelaUpDate, setFormDataParametros] = useState({
    nombre: parametro.nombre,
    descripcion: parametro.descripcion ?? "",
    anchoTela: parametro.anchoTela,
    tubular: parametro.tubular,
    notasTela: parametro.notasTela ?? "",
  });

  // Actualizar el estado cuando cambie el parámetro
  useEffect(() => {
    setFormDataParametros({
      nombre: parametro.nombre,
      descripcion: parametro.descripcion ?? "",
      anchoTela: parametro.anchoTela,
      tubular: parametro.tubular,
      notasTela: parametro.notasTela ?? "",
    });
  }, [parametro]); // Se ejecuta cuando cambia el parámetro

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormDataParametros((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleChange = (field: string, value: string | boolean) => {
    setFormDataParametros({
      ...formDataParametrosFisicosTelaUpDate,
      [field]: value,
    });
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formDataParametrosFisicosTelaUpDate.nombre)
      newErrors.nombreError = "El tipo de empresa es obligatorio";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
         await updateParametro({id: parametro.id,data:formDataParametrosFisicosTelaUpDate});

        onCloseUpDate();
      } catch {
        alert("No se pudo guardar el proveedor");
      }

      //
    } else {
      console.log("no valido ");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoProveedorForm">
          <h2>Editar Parametro tela</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onCloseUpDate();
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
                checked={formDataParametrosFisicosTelaUpDate.tubular}
                onChange={(value) => handleSwitchChange("tubular", value)}
                width="200px"
                size="medium"
              />
              <InputText1
                label="Nombre "
                value={formDataParametrosFisicosTelaUpDate.nombre}
                onChange={(val) => handleChange("nombre", val)}
                errorMessage={errors.nombreError}
                required
                type="text"
                width={450}
              />
              <InputText1
                label="Ancho Tela (cm)"
                value={formDataParametrosFisicosTelaUpDate.anchoTela.toString()}
                onChange={(val) => handleChange("anchoTela", val)}
                width={450}
                type="number"
              />
              <InputText1
                label="Descripcion"
                value={formDataParametrosFisicosTelaUpDate.descripcion}
                onChange={(val) => handleChange("descripcion", val)}
                width={450}
                type="text"
              />
              <InputText1
                label="Notas"
                value={formDataParametrosFisicosTelaUpDate.notasTela}
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

export default ParametroFisicosTelaUpDateForm;
