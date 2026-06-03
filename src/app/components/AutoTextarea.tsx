import { useEffect, useRef } from 'react';

type AutoTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea que crece automáticamente con el contenido.
 * Úsalo en reemplazo de <input type="text"> cuando el texto puede ser largo.
 */
export function AutoTextarea({ value, style, ...rest }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      style={{ resize: 'none', overflow: 'hidden', ...style }}
      {...rest}
    />
  );
}
