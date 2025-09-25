import React, { useState, type InputHTMLAttributes } from 'react';

interface InputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  width?: string | number;
}

const InputText1: React.FC<InputTextProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  errorMessage = '',
  width = '80%',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const containerStyle = {
    ...styles.container,
    width: width
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label 
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()} 
          style={{
            ...styles.label,
            ...(isFocused ? styles.labelFocused : {}),
            ...(errorMessage ? styles.labelError : {})
          }}
        >
          {label}
          {required && <span style={styles.required}> *</span>}
        </label>
      )}
      
      <input
        id={label ? label.replace(/\s+/g, '-').toLowerCase() : undefined}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(isFocused ? styles.inputFocused : {}),
          ...(errorMessage ? styles.inputError : {}),
          ...(disabled ? styles.inputDisabled : {})
        }}
        {...props}
      />
      
      {errorMessage && (
        <div style={styles.errorText}>{errorMessage}</div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    transition: 'color 0.3s ease'
  },
  labelFocused: {
    color: '#4a90e2'
  },
  labelError: {
    color: '#d32f2f'
  },
  input: {
    width: '100%',
    padding: '5px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box' as 'border-box',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputFocused: {
    border: '#4a90e2',
    boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.2)'
  },
  inputError: {
    border: '#d32f2f'
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed'
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

export default InputText1;