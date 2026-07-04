import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { FormInput, FormPassword, Input } from '@/components/forms/fields';
import Button from '@/components/common/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { applyLogin } = useAuth();
  const [mfa, setMfa] = useState(null); // { mfaToken }
  const [code, setCode] = useState('');
  const from = location.state?.from?.pathname || '/';

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const finishLogin = (data) => {
    applyLogin(data.user);
    toast.success(`Welcome back, ${data.user?.firstName || 'there'}!`);
    navigate(from, { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data?.mfaRequired) setMfa({ mfaToken: data.mfaToken });
      else finishLogin(data);
    },
    onError: (err) => toast.error(err.message),
  });

  const mfaMutation = useMutation({
    mutationFn: authService.verifyMfa,
    onSuccess: finishLogin,
    onError: (err) => toast.error(err.message),
  });

  if (mfa) {
    return (
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950">
            <FiShield className="size-6" />
          </span>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Two-factor authentication</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length >= 6) mfaMutation.mutate({ mfaToken: mfa.mfaToken, code });
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="text-center text-2xl tracking-[0.5em]"
            aria-label="Authentication code"
          />
          <Button type="submit" fullWidth loading={mfaMutation.isPending} disabled={code.length < 6}>
            Verify & sign in
          </Button>
          <button
            type="button"
            onClick={() => { setMfa(null); setCode(''); }}
            className="mx-auto flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600"
          >
            <FiArrowLeft className="size-4" /> Back to sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Sign in</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Welcome back — enter your credentials to continue.
        </p>
      </div>

      <form onSubmit={form.handleSubmit((v) => loginMutation.mutate(v))} noValidate className="space-y-4">
        <FormInput
          form={form}
          name="email"
          label="Email address"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
        />
        <div>
          <FormPassword
            form={form}
            name="password"
            label="Password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" fullWidth loading={loginMutation.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-surface-400">
        Protected by role-based access control. Contact your HR administrator for an account.
      </p>
    </div>
  );
}
