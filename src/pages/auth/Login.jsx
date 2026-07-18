import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuShieldCheck, LuShieldAlert, LuBuilding2, LuChevronRight } from 'react-icons/lu';
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
  const [wrongPortal, setWrongPortal] = useState(false);
  const [companyChoice, setCompanyChoice] = useState(null); // { companies, creds }
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
    onSuccess: (data, variables) => {
      setWrongPortal(false);
      // Same email+password in >1 company — let the user pick, then retry with companyId.
      if (data?.multipleCompanies) {
        setCompanyChoice({ companies: data.companies || [], creds: variables });
        return;
      }
      setCompanyChoice(null);
      if (data?.mfaRequired) setMfa({ mfaToken: data.mfaToken });
      else finishLogin(data);
    },
    onError: (err) => {
      // Platform (SUPER_ADMIN) accounts must use the Agnibits console, not the HRMS product.
      if (err.code === 'USE_PLATFORM_PORTAL') setWrongPortal(true);
      else {
        setWrongPortal(false);
        toast.error(err.message);
      }
    },
  });

  const mfaMutation = useMutation({
    mutationFn: authService.verifyMfa,
    onSuccess: finishLogin,
    onError: (err) => toast.error(err.message),
  });

  if (companyChoice) {
    return (
      <div className="card p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Choose your organization</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Your account exists in more than one company. Pick the one you want to sign in to.
          </p>
        </div>
        <div className="space-y-2">
          {companyChoice.companies.map((c) => (
            <button
              key={c.id}
              disabled={loginMutation.isPending}
              onClick={() => loginMutation.mutate({ ...companyChoice.creds, companyId: c.id })}
              className="flex w-full items-center gap-3 rounded-xl border border-surface-200 p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50/50 disabled:opacity-60 dark:border-surface-700 dark:hover:border-primary-700 dark:hover:bg-primary-950/30"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                <LuBuilding2 className="size-5" />
              </span>
              <span className="grow font-medium text-surface-900 dark:text-surface-100">{c.name}</span>
              <LuChevronRight className="size-4 text-surface-400" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCompanyChoice(null)}
          className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600"
        >
          <LuArrowLeft className="size-4" /> Back to sign in
        </button>
      </div>
    );
  }

  if (mfa) {
    return (
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950">
            <LuShieldCheck className="size-6" />
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
            <LuArrowLeft className="size-4" /> Back to sign in
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

      {wrongPortal && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/50"
        >
          <LuShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">This is the HRMS workspace</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300">
              Platform administrators must sign in from the Agnibits console, not here.
            </p>
          </div>
        </div>
      )}

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
