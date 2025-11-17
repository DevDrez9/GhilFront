import React, { createContext, useContext, useState, type ReactNode } from 'react';
import Boton1 from '~/componentes/Boton1'; // ✅ Reusamos tu botón
import './AlertStyle.css';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');
  
  // Guardamos la promesa resolve para poder usar await showAlert()
  const [resolveCallback, setResolveCallback] = useState<(() => void) | null>(null);

  const showAlert = (msg: string, type: AlertType = 'info') => {
    setMessage(msg);
    setType(type);
    setVisible(true);
    
    // Retornamos una promesa que se resuelve cuando el usuario cierra la alerta
    return new Promise<void>((resolve) => {
      setResolveCallback(() => resolve);
    });
  };

  const handleClose = () => {
    setVisible(false);
    if (resolveCallback) {
      resolveCallback();
      setResolveCallback(null);
    }
  };

  // Iconos según el tipo
  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {visible && (
        <div className="alert-overlay">
          <div className={`alert-modal ${type}`}>
            <span className="alert-icon">{getIcon()}</span>
            <p className="alert-message">{message}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Boton1 
                onClick={handleClose} 
                variant={type === 'error' ? 'danger' : 'primary'} 
                size="medium"
              >
                Aceptar
              </Boton1>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

// Hook personalizado para usarlo fácil
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert debe usarse dentro de un AlertProvider");
  }
  return context;
};