import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { AutoTextarea } from './AutoTextarea';

interface FormRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date' | 'number';
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  required?: boolean;
}

export function FormRow({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = false,
  errorMessage,
  id,
  min,
  max,
  required = false,
}: FormRowProps) {
  const [isBlurred, setIsBlurred] = useState(false);
  const showCheck =
    isBlurred && value !== undefined && value !== null && value.toString().trim() !== '';

  const inputClass = `form-input w-full px-3 py-2 ${error ? 'is-error' : ''} ${
    value && value.toString().trim() !== '' ? 'is-filled' : ''
  } ${disabled ? 'is-disabled' : ''}`;

  return (
    <div className="flex items-start gap-4 mb-3">
      <label
        htmlFor={id}
        className="w-48 text-sm font-medium text-gray-700 flex-shrink-0 mt-2"
        style={{ fontWeight: 'var(--weight-medium)' }}
      >
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <div className="flex-1">
        <div className="relative">
          {type === 'text' ? (
            <AutoTextarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setIsBlurred(true)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error && errorMessage ? `${id}-error` : undefined}
              className={`${inputClass} pr-10`}
            />
          ) : (
            <input
              id={id}
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setIsBlurred(true)}
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error && errorMessage ? `${id}-error` : undefined}
              className={`${inputClass} pr-10`}
            />
          )}
          <div
            className={`absolute right-3 top-2.5 pointer-events-none transition-opacity duration-[150ms] ease-in-out ${
              showCheck ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <IconCheck size={16} color="var(--color-success)" />
          </div>
        </div>
        {error && errorMessage && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
