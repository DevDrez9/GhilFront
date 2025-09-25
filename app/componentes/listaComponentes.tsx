import { useState } from "react";
import ComboBox1 from "./ComboBox1";
import InputText1 from "./InputText1";
import TextArea1 from "./TextArea1";
import Switch1 from "./switch1";
import Boton3Puntos from "./Boton3Puntos";
import Boton1 from "./Boton1";

const ListaComponentes = () => {
     const [formData, setFormData] = useState({
    companyType: '',
    industry: '',
    country: '',
    status: '',
    description:'',
     isActive: false,
  });

     const companyTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'PYME' },
    { value: 'corporate', label: 'Corporación' },
    { value: 'nonprofit', label: 'Organización sin fines de lucro' },
    { value: 'government', label: 'Gubernamental' }
  ];


   const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

   const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

   const [clickCount, setClickCount] = useState(0);
    const handleButtonClick = () => {
    setClickCount(prev => prev + 1);
  };
  

    return(<>
    <InputText1 label="Nombre de la empresa"
          type="text" value="" onChange={function (value: string): void {
        throw new Error("Function not implemented.");
      } }></InputText1>

        <ComboBox1
          label="Tipo de empresa"
          options={companyTypes}
          value={formData.companyType}
          onChange={(value) => handleInputChange('companyType', value)}
          placeholder="Seleccione el tipo de empresa"
          width="80%"
        />

          <TextArea1
          label="Descripción de la empresa"
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describa su empresa, su historia y sus valores..."
          width="100%"
          rows={5}
        />

        <Switch1
          label="Empresa activa"
          checked={formData.isActive}
          onChange={(value) => handleSwitchChange('isActive', value)}
          width="80%"
          size="medium"
        />
       
       <Boton1 variant="info" onClick={handleButtonClick}>Información</Boton1>

    </>);
}   


export default ListaComponentes;
