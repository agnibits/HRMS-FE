import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuCheck } from 'react-icons/lu';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { FormInput, FormPassword } from '@/components/forms/fields';
import Button from '@/components/common/Button';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(80),
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().min(1, 'Work email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the terms to continue' }),
  }),
});

const PERKS = [
  '14-day free trial — no credit card required',
  'Unlimited modules during trial',
  'Your data is isolated and private to your company',
];

export default function Register() {
  const navigate = useNavigate();
  const { applyLogin } = useAuth();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', firstName: '', lastName: '', email: '', password: '', acceptTerms: false },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      authService.registerCompany({
        companyName: values.companyName,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      }),
    onSuccess: (data) => {
      if (data?.user) {
        applyLogin(data.user);
        toast.success(`Welcome to ${form.getValues('companyName')}! Your workspace is ready 🎉`);
        navigate('/', { replace: true });
      } else {
        toast.success('Account created — please sign in.');
        navigate('/login', { replace: true });
      }
    },
    onError: (err) =>
      toast.error(
        err?.status === 409
          ? 'An account with this email already exists. Try signing in.'
          : err?.status === 404
            ? 'Signups aren’t enabled on the server yet.'
            : err?.message || 'Could not create your account. Please try again.'
      ),
  });

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Start your free trial</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Create your company workspace in under a minute.
        </p>
      </div>

      <ul className="mb-6 space-y-2">
        {PERKS.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              <LuCheck className="size-3" />
            </span>
            {p}
          </li>
        ))}
      </ul>

      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate className="space-y-4">
        <FormInput
          form={form}
          name="companyName"
          label="Company name"
          required
          placeholder="Acme Inc."
          autoComplete="organization"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput form={form} name="firstName" label="First name" required autoComplete="given-name" />
          <FormInput form={form} name="lastName" label="Last name" required autoComplete="family-name" />
        </div>
        <FormInput
          form={form}
          name="email"
          label="Work email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
        />
        <FormPassword
          form={form}
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          hint="At least 8 characters with uppercase, lowercase and a number."
        />

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-surface-300 accent-primary-600"
            {...form.register('acceptTerms')}
          />
          <span className="text-xs text-surface-500 dark:text-surface-400">
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>
        {form.formState.errors.acceptTerms && (
          <p role="alert" className="-mt-2 text-xs font-medium text-red-600">
            {form.formState.errors.acceptTerms.message}
          </p>
        )}

        <Button type="submit" fullWidth loading={mutation.isPending}>
          Create company account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
