import React, { useState, useRef, useEffect } from 'react';

interface ComboBoxProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  width?: string | number;
}

const ComboBox1: React.FC<ComboBoxProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccione una opción',
  required = false,
  disabled = false,
  errorMessage = '',
  width = '80%',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const comboBoxRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const containerStyle = {
    ...styles.container,
    width: width
  };

  return (
    <div style={containerStyle} ref={comboBoxRef}>
      {label && (
        <label 
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()} 
          style={{
            ...styles.label,
            ...(errorMessage ? styles.labelError : {})
          }}
        >
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}
      
      <div style={styles.comboBoxContainer}>
        <div
          style={{
            ...styles.comboBox,
            ...(isOpen ? styles.comboBoxOpen : {}),
            ...(errorMessage ? styles.comboBoxError : {}),
            ...(disabled ? styles.comboBoxDisabled : {})
          }}
          onClick={handleToggle}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
        </div>
        
        {isOpen && (
          <div style={styles.dropdown}>
            {options.length > 5 && (
              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={styles.searchInput}
                  autoFocus
                />
              </div>
            )}
            
            <div style={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    style={{
                      ...styles.option,
                      ...(value === option.value ? styles.optionSelected : {})
                    }}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div style={styles.noOptions}>No hay opciones disponibles</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div style={styles.errorText}>{errorMessage}</div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    position: 'relative',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  labelError: {
    color: '#d32f2f'
  },
  comboBoxContainer: {
    position: 'relative',
  },
  comboBox: {
    width: '100%',
    padding: '5px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box' as 'border-box',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  comboBoxOpen: {
    borderColor: '#4a90e2',
    boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.2)'
  },
  comboBoxError: {
    borderColor: '#d32f2f'
  },
  comboBoxDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    color: '#999'
  },
  arrow: {
    fontSize: '12px',
    color: '#666'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    marginTop: '4px',
    maxHeight: '300px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  searchContainer: {
    padding: '8px',
    borderBottom: '1px solid #eee'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as 'border-box'
  },
  optionsList: {
    overflowY: 'auto',
    maxHeight: '250px'
  },
  option: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  },
  optionSelected: {
    backgroundColor: '#e6f2ff',
    fontWeight: 600
  },
  noOptions: {
    padding: '12px 16px',
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center' as 'center'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '5px'
  },
  required: {
    color: '#d32f2f'
  }
};

export default ComboBox1;