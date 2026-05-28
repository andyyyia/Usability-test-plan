import React, { useEffect } from 'react';

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-label="Cerrar modal"
      />

      <div className="relative z-10 max-w-lg mx-auto mt-28 px-4">
        <div
          className="rounded-xl shadow-xl overflow-hidden"
          style={{
            border: '1px solid var(--color-error)',
            backgroundColor: 'var(--color-bg-card)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b"
            style={{
              backgroundColor: 'var(--color-error-light)',
              borderColor: 'var(--color-error)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-2 py-1 rounded tracking-widest uppercase"
                style={{
                  backgroundColor: 'var(--color-error)',
                  color: '#ffffff',
                }}
              >
                PELIGRO
              </span>
              <h3
                className="font-semibold text-base"
                style={{ color: 'var(--color-error)' }}
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-border)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)')}
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-error)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-btn-danger-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-error)')}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

