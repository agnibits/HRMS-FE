import { useCallback, useRef, useState } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import cn from '@/utils/cn';

/**
 * Drag & drop file upload. Controlled: value = File | File[] | null.
 */
export function FileUpload({
  value,
  onChange,
  accept,
  multiple = false,
  maxSizeMb = 10,
  label = 'Click to upload or drag and drop',
  hint,
  className,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const files = value ? (Array.isArray(value) ? value : [value]) : [];

  const handleFiles = useCallback(
    (fileList) => {
      setError('');
      const incoming = Array.from(fileList);
      const tooBig = incoming.find((f) => f.size > maxSizeMb * 1024 * 1024);
      if (tooBig) {
        setError(`"${tooBig.name}" exceeds the ${maxSizeMb} MB limit.`);
        return;
      }
      onChange(multiple ? [...files, ...incoming] : incoming[0] || null);
    },
    [files, maxSizeMb, multiple, onChange]
  );

  const removeAt = (idx) => {
    if (multiple) onChange(files.filter((_, i) => i !== idx));
    else onChange(null);
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragOver
            ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40'
            : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-800/50'
        )}
      >
        <FiUploadCloud className="mb-2 size-8 text-surface-400" />
        <p className="text-sm font-medium text-surface-700 dark:text-surface-300">{label}</p>
        <p className="mt-1 text-xs text-surface-400">
          {hint || `${accept ? accept.replace(/\./g, '').toUpperCase() : 'Any file type'} · up to ${maxSizeMb} MB`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 dark:border-surface-700 dark:bg-surface-800"
            >
              <FiFile className="size-4 shrink-0 text-primary-500" />
              <span className="grow truncate text-sm text-surface-700 dark:text-surface-200">{f.name}</span>
              <span className="shrink-0 text-xs text-surface-400">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => removeAt(i)}
                className="shrink-0 text-surface-400 hover:text-red-500"
              >
                <FiX className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;
