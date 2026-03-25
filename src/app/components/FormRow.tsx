interface FormRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
  disabled?: boolean;
}

export function FormRow({ label, value, onChange, placeholder, type = 'text', disabled = false }: FormRowProps) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
        }`}
      />
    </div>
  );
}
