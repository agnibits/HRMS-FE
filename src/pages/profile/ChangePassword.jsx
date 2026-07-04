import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import { FormPassword } from '@/components/forms/fields';
import FormShell from '@/components/forms/FormShell';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[a-z]/, 'Must include a lowercase letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });

export default function ChangePassword() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: (v) =>
      authService.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: () => {
      toast.success('Password changed. Other sessions have been signed out.');
      navigate('/profile');
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div>
      <PageHeader title="Change Password" description="Keep your account secure with a strong, unique password." />
      <Card className="max-w-xl">
        <CardHeader title="Update password" description="You'll stay signed in here; other devices are signed out." />
        <CardBody>
          <FormShell
            form={form}
            onSubmit={(v) => mutation.mutate(v)}
            onCancel={() => navigate('/profile')}
            loading={mutation.isPending}
            apiError={mutation.error}
            submitLabel="Change password"
          >
            <FormPassword form={form} name="currentPassword" label="Current password" required autoComplete="current-password" />
            <FormPassword form={form} name="newPassword" label="New password" required autoComplete="new-password" hint="Minimum 8 characters with uppercase, lowercase and a number." />
            <FormPassword form={form} name="confirmPassword" label="Confirm new password" required autoComplete="new-password" />
          </FormShell>
        </CardBody>
      </Card>
    </div>
  );
}
