interface FormRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export function FormRow({ label, value, onChange, placeholder, type = 'text', disabled = false, error = false, id }: FormRowProps) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
          error ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        } ${disabled ? '!bg-gray-100 !text-gray-500 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}
