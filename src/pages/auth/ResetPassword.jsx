import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAlertTriangle } from 'react-icons/fi';
import { authService } from '@/services/authService';
import { FormPassword } from '@/components/forms/fields';
import Button from '@/components/common/Button';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (values) => authService.resetPassword({ token, password: values.password }),
    onSuccess: () => {
      toast.success('Password reset — sign in with your new password.');
      navigate('/login', { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60">
          <FiAlertTriangle className="size-6" />
        </span>
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Invalid reset link</h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
          This link is missing its token or has expired. Request a fresh one.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Set a new password</h1>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
        Your new password must be at least 8 characters with mixed case and a number.
      </p>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate className="mt-6 space-y-4">
        <FormPassword form={form} name="password" label="New password" required autoComplete="new-password" />
        <FormPassword form={form} name="confirmPassword" label="Confirm new password" required autoComplete="new-password" />
        <Button type="submit" fullWidth loading={mutation.isPending}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
