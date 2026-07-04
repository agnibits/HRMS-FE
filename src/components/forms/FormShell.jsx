import Button from '@/components/common/Button';

/**
 * Standard form chrome: submit / reset / cancel + API error banner.
 * Wrap fields in <FormShell form={form} onSubmit={...}>...</FormShell>.
 */
export function FormShell({
  form,
  onSubmit,
  children,
  submitLabel = 'Save',
  onCancel,
  showReset = true,
  loading = false,
  apiError,
  className,
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className={className}>
      {apiError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
        >
          <p className="font-medium">{apiError.message}</p>
          {apiError.details?.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs">
              {apiError.details.map((d, i) => (
                <li key={i}>{d.field ? `${d.field}: ` : ''}{d.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-4">{children}</div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        {showReset && (
          <Button variant="ghost" onClick={() => form.reset()} disabled={loading}>
            Reset
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default FormShell;
