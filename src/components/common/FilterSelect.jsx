import { titleCase } from '@/utils/formatters';

/** Compact native select for table toolbar filters. */
export function FilterSelect({ label, value, onChange, options, allLabel = 'All' }) {
  return (
    <select
      aria-label={label}
      value={value || 'ALL'}
      onChange={(e) => onChange(e.target.value)}
      className="input-base w-auto min-w-32 py-2 text-sm"
    >
      <option value="ALL">{allLabel} {label ? `· ${label}` : ''}</option>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: titleCase(o) } : o;
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}

export default FilterSelect;
