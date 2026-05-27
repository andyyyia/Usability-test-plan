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
  required = false
}: FormRowProps) {
  return (
    <div className="flex items-start gap-4 mb-3">
      <label htmlFor={id} className="w-48 text-sm font-medium text-gray-700 flex-shrink-0 mt-2" style={{ fontWeight: 'var(--weight-medium)' }}>
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      <div className="flex-1">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error && errorMessage ? `${id}-error` : undefined}
          className={`form-input w-full px-3 py-2 ${
            error ? 'is-error' : ''
          } ${value && value.toString().trim() !== '' ? 'is-filled' : ''} ${disabled ? 'is-disabled' : ''}`}
        />
        {error && errorMessage && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
