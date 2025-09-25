import React, { useState, type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  width?: string | number;
  rows?: number;
}

const TextArea1: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  errorMessage = '',
  width = '80%',
  rows = 4,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      
      <textarea
        id={label ? label.replace(/\s+/g, '-').toLowerCase() : undefined}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        style={{
          ...styles.textarea,
          ...(isFocused ? styles.textareaFocused : {}),
          ...(errorMessage ? styles.textareaError : {}),
          ...(disabled ? styles.textareaDisabled : {})
        }}
        {...props}
      />
      
      {errorMessage && (
        <div style={styles.errorText}>{errorMessage}</div>
      )}
      
      {!disabled && (
        <div style={styles.charCount}>
          {value.length} caracteres
        </div>
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
  textarea: {
    width: '100%',
    padding: '5px 16px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box' as 'border-box',
    transition: 'all 0.3s ease',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  textareaFocused: {
    borderColor: '#4a90e2',
    boxShadow: '0 0 0 3px rgba(74, 144, 226, 0.2)'
  },
  textareaError: {
    borderColor: '#d32f2f'
  },
  textareaDisabled: {
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
  },
  charCount: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'right' as 'right',
    marginTop: '4px'
  }
};

export default TextArea1;