import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { LuGlobe, LuImage, LuSettings, LuUpload } from 'react-icons/lu';
import { companyService } from '@/services/modules';
import { authService } from '@/services/authService';
import { setCredentials } from '@/store/authSlice';
import { API_URL } from '@/constants';
import { tokenStorage } from '@/utils/storage';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import { FormInput, FormNativeSelect, FormTextarea } from '@/components/forms/fields';
import FormShell from '@/components/forms/FormShell';
import FileUpload from '@/components/forms/FileUpload';
import Button from '@/components/common/Button';

const schema = z.object({
  name: z.string().min(2, 'Company name is required'),
  legalName: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  address: z.string().max(400).optional().or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
  weekStart: z.string().min(1),
});

const TIMEZONES = ['UTC', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore', 'Australia/Sydney'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SGD', 'AUD'];

export default function CompanySettings() {
  const [logo, setLogo] = useState(null);

  const companyQuery = useQuery({
    queryKey: ['companies', 'current'],
    queryFn: () => companyService.list({ limit: 1 }),
    retry: false,
  });

  const existing = companyQuery.data?.data?.[0];

  const form = useForm({
    resolver: zodResolver(schema),
    values: existing
      ? {
          name: existing.name || '', legalName: existing.legalName || '', email: existing.email || '',
          phone: existing.phone || '', website: existing.website || '', address: existing.address || '',
          timezone: existing.timezone || 'UTC', currency: existing.currency || 'USD',
          weekStart: existing.weekStart || 'MONDAY',
        }
      : undefined,
    defaultValues: {
      name: '', legalName: '', email: '', phone: '', website: '', address: '',
      timezone: 'UTC', currency: 'USD', weekStart: 'MONDAY',
    },
  });

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: (values) =>
      existing ? companyService.update(existing.id, values) : companyService.create(values),
    onSuccess: () => toast.success('Company settings saved'),
    onError: (err) =>
      toast.error(
        err?.status === 404
          ? 'The company settings module is not enabled on the server yet.'
          : err.message
      ),
  });

  // Logo upload — multipart POST /companies/:id/logo (plain axios so the
  // browser sets the multipart boundary).
  const uploadLogo = useMutation({
    mutationFn: async (file) => {
      if (!existing?.id) throw new Error('Save your company profile first.');
      const form = new FormData();
      form.append('logo', file);
      const res = await axios.post(`${API_URL}/companies/${existing.id}/logo`, form, {
        headers: { Authorization: `Bearer ${tokenStorage.getAccess()}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Logo updated — it now shows in the sidebar.');
      setLogo(null);
      companyQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ['company', 'current'] });
      // Refresh the auth user so user.company.logoUrl (sidebar/header) updates now.
      try {
        const me = await authService.me();
        if (me) dispatch(setCredentials(me));
      } catch {
        /* non-fatal — sidebar will refresh on next load */
      }
    },
    onError: (err) =>
      toast.error(
        err?.response?.status === 404
          ? 'Logo upload isn’t enabled on the server yet.'
          : err?.response?.data?.error?.message || err?.message || 'Logo upload failed.'
      ),
  });

  return (
    <div>
      <PageHeader
        title="Company Settings"
        description="Organization profile, locale and branding."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Organization profile" description="Basic details shown across the workspace." />
            <CardBody>
              <FormShell
                form={form}
                onSubmit={(v) => mutation.mutate(v)}
                loading={mutation.isPending}
                apiError={mutation.error?.status !== 404 ? mutation.error : undefined}
                submitLabel="Save settings"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput form={form} name="name" label="Company name" required />
                  <FormInput form={form} name="legalName" label="Legal name" />
                  <FormInput form={form} name="email" label="Contact email" type="email" />
                  <FormInput form={form} name="phone" label="Contact phone" />
                  <FormInput form={form} name="website" label="Website" placeholder="https://…" />
                  <FormNativeSelect form={form} name="timezone" label="Timezone" options={TIMEZONES.map((t) => ({ value: t, label: t }))} />
                  <FormNativeSelect form={form} name="currency" label="Default currency" options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
                  <FormNativeSelect form={form} name="weekStart" label="Week starts on" options={[
                    { value: 'MONDAY', label: 'Monday' }, { value: 'SUNDAY', label: 'Sunday' }, { value: 'SATURDAY', label: 'Saturday' },
                  ]} />
                  <FormTextarea form={form} name="address" label="Registered address" className="sm:col-span-2" rows={3} />
                </div>
              </FormShell>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Branding" description="Your logo appears in the sidebar and emails." />
            <CardBody className="space-y-4">
              {(existing?.logoUrl || existing?.logo) && (
                <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-850">
                  <img
                    src={existing.logoUrl || existing.logo}
                    alt="Company logo"
                    className="size-12 rounded-lg object-cover ring-1 ring-surface-200 dark:ring-surface-700"
                  />
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Current logo</p>
                    <p className="text-xs text-surface-400">Shown across the app & sidebar</p>
                  </div>
                </div>
              )}

              <FileUpload
                value={logo}
                onChange={setLogo}
                accept=".png,.svg,.jpg,.jpeg"
                maxSizeMb={2}
                label="Upload company logo"
                hint="PNG, SVG or JPG, up to 2 MB"
              />

              <Button
                fullWidth
                leftIcon={LuUpload}
                disabled={!logo || !existing}
                loading={uploadLogo.isPending}
                onClick={() => uploadLogo.mutate(logo)}
              >
                {existing?.logoUrl ? 'Replace logo' : 'Save logo'}
              </Button>
              {!existing && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Save your company profile first, then upload a logo.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Workspace" />
            <CardBody className="space-y-3 text-sm text-surface-600 dark:text-surface-300">
              <p className="flex items-center gap-2.5"><LuGlobe className="size-4 text-surface-400" /> API: <code className="rounded bg-surface-100 px-1.5 py-0.5 text-xs dark:bg-surface-800">{import.meta.env.VITE_API_URL}</code></p>
              <p className="flex items-center gap-2.5"><LuSettings className="size-4 text-surface-400" /> Environment: <span className="font-medium">{import.meta.env.MODE}</span></p>
              <p className="flex items-center gap-2.5"><LuImage className="size-4 text-surface-400" /> Version: <span className="font-medium">1.0.0</span></p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
