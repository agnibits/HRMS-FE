import { forwardRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import cn from '@/utils/cn';

/* ---------- primitives (usable outside RHF) ---------- */

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn('input-base', invalid && 'border-red-500 focus:border-red-500 focus:ring-red-500/25', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn('input-base resize-y', invalid && 'border-red-500 focus:border-red-500 focus:ring-red-500/25', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export function FieldWrapper({ label, required, error, hint, children, className }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-base">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-surface-400 dark:text-surface-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ---------- RHF-bound fields ---------- */

function fieldError(errors, name) {
  const err = name.split('.').reduce((acc, k) => acc?.[k], errors);
  return err?.message;
}

export function FormInput({ form, name, label, required, hint, type = 'text', className, ...props }) {
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <Input type={type} invalid={!!error} {...form.register(name)} {...props} />
    </FieldWrapper>
  );
}

export function FormPassword({ form, name, label, required, hint, className, ...props }) {
  const [show, setShow] = useState(false);
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        <Input type={show ? 'text' : 'password'} invalid={!!error} className="pr-10" {...form.register(name)} {...props} />
        <button
          type="button"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
        >
          {show ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
        </button>
      </div>
    </FieldWrapper>
  );
}

export function FormTextarea({ form, name, label, required, hint, className, ...props }) {
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <Textarea invalid={!!error} {...form.register(name)} {...props} />
    </FieldWrapper>
  );
}

export function FormDate({ form, name, label, required, hint, className, ...props }) {
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <Input type="date" invalid={!!error} {...form.register(name)} {...props} />
    </FieldWrapper>
  );
}

export function FormCheckbox({ form, name, label, hint, className }) {
  const error = fieldError(form.formState.errors, name);
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-surface-300 text-primary-600 accent-primary-600 focus:ring-primary-500"
          {...form.register(name)}
        />
        <span className="text-sm text-surface-700 dark:text-surface-300">{label}</span>
      </label>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-surface-400">{hint}</p>}
    </div>
  );
}

/**
 * react-select bound to RHF.
 * options: [{ value, label }]; set isMulti for arrays.
 */
export function FormSelect({
  form, name, label, required, hint, options = [], isMulti = false,
  placeholder = 'Select…', isClearable = true, isLoading = false, className,
}) {
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <ReactSelect
            classNamePrefix="rs"
            unstyled={false}
            options={options}
            isMulti={isMulti}
            isClearable={isClearable}
            isLoading={isLoading}
            placeholder={placeholder}
            value={
              isMulti
                ? options.filter((o) => (field.value || []).includes(o.value))
                : options.find((o) => o.value === field.value) || null
            }
            onChange={(sel) =>
              field.onChange(isMulti ? (sel || []).map((o) => o.value) : (sel?.value ?? null))
            }
            onBlur={field.onBlur}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 60 }) }}
            menuPortalTarget={document.body}
          />
        )}
      />
    </FieldWrapper>
  );
}

/** Native select for short enum lists (lighter than react-select). */
export function FormNativeSelect({ form, name, label, required, hint, options = [], className, placeholder }) {
  const error = fieldError(form.formState.errors, name);
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint} className={className}>
      <select className={cn('input-base', error && 'border-red-500')} {...form.register(name)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldWrapper>
  );
}
