import React, { useEffect } from 'react';

type MessageVariant = 'success' | 'error' | 'info';

export function MessageModal({
  open,
  title,
  message,
  variant = 'info',
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  variant?: MessageVariant;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const tone =
    variant === 'success'
      ? { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', pill: 'bg-green-100 text-green-800' }
      : variant === 'error'
      ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', pill: 'bg-red-100 text-red-800' }
      : { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', pill: 'bg-blue-100 text-blue-800' };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar modal"
      />

      <div className="relative z-10 max-w-lg mx-auto mt-28 px-4">
        <div className={`rounded-xl border shadow-lg ${tone.border} bg-white`}>
          <div className={`px-6 py-4 border-b ${tone.bg}`}>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${tone.pill}`}>{variant.toUpperCase()}</span>
              <h3 className={`font-semibold ${tone.text}`}>{title}</h3>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152d47] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

