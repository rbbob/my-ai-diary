import React, { useState, useEffect } from 'react';
import { BsExclamationTriangle } from 'react-icons/bs';

const FormInput = ({
  type = 'text',
  value,
  onChange,
  onValidation,
  validator,
  placeholder,
  className = '',
  disabled = false,
  label,
  required = false,
  maxLength,
  showCharCount = false,
  debounceMs = 300,
  ...props
}) => {
  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // デバウンス付きバリデーション
  useEffect(() => {
    if (!validator || !touched) return;

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = typeof validator === 'function' 
          ? validator(value) 
          : { isValid: true, errors: [] };
        
        setErrors(result.errors || []);
        onValidation?.(result);
      } catch (error) {
        setErrors(['検証中にエラーが発生しました']);
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, validator, touched, debounceMs, onValidation]);

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const hasErrors = errors.length > 0;
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
    ${hasErrors && touched 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={`${inputClasses} resize-none`}
            rows={3}
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={inputClasses}
            {...props}
          />
        )}
        
        {isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 文字数カウンタ */}
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            value?.length > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {value?.length || 0} / {maxLength}
          </span>
        </div>
      )}

      {/* エラーメッセージ */}
      {hasErrors && touched && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600">
              <BsExclamationTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormInput;