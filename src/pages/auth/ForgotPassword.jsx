import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuMail } from 'react-icons/lu';
import { authService } from '@/services/authService';
import { FormInput } from '@/components/forms/fields';
import Button from '@/components/common/Button';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState('');
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (_, vars) => setSentTo(vars.email),
    onError: (err) => toast.error(err.message),
  });

  if (sentTo) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
          <LuMail className="size-6" />
        </span>
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Check your inbox</h1>
        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
          If an account exists for <span className="font-medium text-surface-700 dark:text-surface-200">{sentTo}</span>,
          we've sent a password reset link. It expires shortly, so use it soon.
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
          <LuArrowLeft className="size-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Forgot your password?</h1>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
        Enter your email and we'll send you a link to reset it.
      </p>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate className="mt-6 space-y-4">
        <FormInput form={form} name="email" label="Email address" type="email" required placeholder="you@company.com" autoComplete="email" />
        <Button type="submit" fullWidth loading={mutation.isPending}>
          Send reset link
        </Button>
      </form>
      <Link to="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-surface-500 hover:text-primary-600">
        <LuArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
