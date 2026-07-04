import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  LuKeyRound, LuLogOut, LuMail, LuLaptop, LuShieldCheck, LuSmartphone, LuTrash2, LuUserRound, LuCircleCheck,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { updateUser } from '@/store/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS } from '@/constants';
import { formatRelative, fullName } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Tabs from '@/components/common/Tabs';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { FormInput, FormPassword, Input } from '@/components/forms/fields';
import FormShell from '@/components/forms/FormShell';
import { SkeletonText } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { useDisclosure } from '@/hooks/useDisclosure';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().or(z.literal('')),
});

function ProfileTab() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values) => userService.updateMyProfile(values),
    onSuccess: (_, values) => {
      dispatch(updateUser(values));
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.message),
  });

  const sendVerification = useMutation({
    mutationFn: authService.sendVerification,
    onSuccess: () => toast.success('Verification email sent — check your inbox.'),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="h-fit">
        <CardBody className="flex flex-col items-center text-center">
          <Avatar name={user} size="xl" />
          <h2 className="mt-3 text-lg font-bold text-surface-900 dark:text-surface-50">{fullName(user)}</h2>
          <p className="text-sm text-surface-500">{user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {(user?.roles || []).map((r) => <Badge key={r} color="primary">{r}</Badge>)}
          </div>
          {!user?.emailVerified && (
            <Button
              variant="subtle"
              size="sm"
              className="mt-4"
              leftIcon={LuMail}
              loading={sendVerification.isPending}
              onClick={() => sendVerification.mutate()}
            >
              Verify email
            </Button>
          )}
          {user?.emailVerified && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <LuCircleCheck className="size-3.5" /> Email verified
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Personal information" description="Update your name and contact details." />
        <CardBody>
          <FormShell
            form={form}
            onSubmit={(v) => mutation.mutate(v)}
            loading={mutation.isPending}
            apiError={mutation.error}
            submitLabel="Save changes"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput form={form} name="firstName" label="First name" required />
              <FormInput form={form} name="lastName" label="Last name" required />
              <FormInput form={form} name="phone" label="Phone" placeholder="+1 555 000 0000" className="sm:col-span-2" />
            </div>
          </FormShell>
        </CardBody>
      </Card>
    </div>
  );
}

function MfaSection() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const setupModal = useDisclosure();
  const disableModal = useDisclosure();
  const [setupData, setSetupData] = useState(null); // { secret, qrCode / otpauthUrl }
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const setupMutation = useMutation({
    mutationFn: authService.mfaSetup,
    onSuccess: ({ data }) => {
      setSetupData(data);
      setCode('');
      setupModal.open();
    },
    onError: (err) => toast.error(err.message),
  });

  const enableMutation = useMutation({
    mutationFn: () => authService.mfaEnable({ code }),
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
      dispatch(updateUser({ mfaEnabled: true }));
      setupModal.close();
    },
    onError: (err) => toast.error(err.message),
  });

  const disableMutation = useMutation({
    mutationFn: () => authService.mfaDisable({ password }),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled');
      dispatch(updateUser({ mfaEnabled: false }));
      disableModal.close();
      setPassword('');
    },
    onError: (err) => toast.error(err.message),
  });

  const qrSrc = setupData?.qrCode || setupData?.qrCodeDataUrl || setupData?.qr;

  return (
    <Card>
      <CardHeader
        title="Two-factor authentication"
        description="Add an extra verification step when signing in."
        actions={
          user?.mfaEnabled ? (
            <Button variant="danger" size="sm" onClick={() => disableModal.open()}>Disable</Button>
          ) : (
            <Button size="sm" loading={setupMutation.isPending} onClick={() => setupMutation.mutate()}>
              Enable 2FA
            </Button>
          )
        }
      />
      <CardBody className="flex items-center gap-3 text-sm">
        <LuShieldCheck className={`size-5 ${user?.mfaEnabled ? 'text-emerald-500' : 'text-surface-400'}`} />
        <span className="text-surface-600 dark:text-surface-300">
          {user?.mfaEnabled
            ? 'Your account is protected with an authenticator app.'
            : 'Your account currently relies on your password alone.'}
        </span>
      </CardBody>

      <Modal
        isOpen={setupModal.isOpen}
        onClose={setupModal.close}
        title="Set up two-factor authentication"
        description="Scan the QR code with Google Authenticator, 1Password or a similar app."
        footer={
          <>
            <Button variant="secondary" onClick={setupModal.close}>Cancel</Button>
            <Button onClick={() => enableMutation.mutate()} loading={enableMutation.isPending} disabled={code.length < 6}>
              Verify & enable
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4">
          {qrSrc ? (
            <img src={qrSrc} alt="TOTP QR code" className="size-44 rounded-lg bg-white p-2 shadow-card" />
          ) : (
            <p className="text-sm text-surface-500">QR unavailable — enter the secret manually.</p>
          )}
          {setupData?.secret && (
            <code className="select-all rounded-lg bg-surface-100 px-3 py-1.5 text-xs dark:bg-surface-800">
              {setupData.secret}
            </code>
          )}
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="max-w-48 text-center text-lg tracking-[0.35em]"
            aria-label="Verification code"
          />
        </div>
      </Modal>

      <Modal
        isOpen={disableModal.isOpen}
        onClose={disableModal.close}
        title="Disable two-factor authentication"
        description="Confirm your password to turn off 2FA."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={disableModal.close}>Cancel</Button>
            <Button variant="danger" onClick={() => disableMutation.mutate()} loading={disableMutation.isPending} disabled={!password}>
              Disable 2FA
            </Button>
          </>
        }
      >
        <Input
          type="password"
          placeholder="Account password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Account password"
        />
      </Modal>
    </Card>
  );
}

function SessionsSection() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const sessionsQuery = useQuery({ queryKey: QUERY_KEYS.sessions, queryFn: authService.sessions });
  const devicesQuery = useQuery({ queryKey: QUERY_KEYS.devices, queryFn: authService.devices });

  const revokeSession = useMutation({
    mutationFn: (id) => authService.revokeSession(id),
    onSuccess: () => {
      toast.success('Session revoked');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
    onError: (err) => toast.error(err.message),
  });

  const logoutAll = useMutation({
    mutationFn: authService.logoutAll,
    onSuccess: () => {
      toast.success('Signed out of all other devices');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
    onError: (err) => toast.error(err.message),
  });

  const trustDevice = useMutation({
    mutationFn: ({ id, isTrusted }) => authService.trustDevice(id, isTrusted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices }),
    onError: (err) => toast.error(err.message),
  });

  const removeDevice = useMutation({
    mutationFn: (id) => authService.removeDevice(id),
    onSuccess: () => {
      toast.success('Device removed');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
    },
    onError: (err) => toast.error(err.message),
  });

  const sessions = sessionsQuery.data?.data || [];
  const devices = devicesQuery.data?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Active sessions"
          description="Everywhere you're currently signed in."
          actions={
            <Button variant="secondary" size="sm" leftIcon={LuLogOut} loading={logoutAll.isPending} onClick={() => logoutAll.mutate()}>
              Sign out others
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {sessionsQuery.isLoading ? (
            <SkeletonText lines={3} />
          ) : sessions.length === 0 ? (
            <EmptyState title="No active sessions" className="py-4" />
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg border border-surface-200 p-3.5 dark:border-surface-700">
                <LuLaptop className="size-5 shrink-0 text-surface-400" />
                <div className="min-w-0 grow">
                  <p className="flex items-center gap-2 text-sm font-medium text-surface-800 dark:text-surface-200">
                    {s.device?.browser || 'Unknown browser'} · {s.device?.platform || 'Unknown OS'}
                    {s.current && <Badge color="green">This device</Badge>}
                  </p>
                  <p className="text-xs text-surface-400">
                    {s.ipAddress || 'unknown IP'} · active {formatRelative(s.lastUsedAt)}
                  </p>
                </div>
                {!s.current && (
                  <Button variant="ghost" size="xs" onClick={() => revokeSession.mutate(s.id)}>
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Known devices" description="Devices that have signed in to your account." />
        <CardBody className="space-y-3">
          {devicesQuery.isLoading ? (
            <SkeletonText lines={3} />
          ) : devices.length === 0 ? (
            <EmptyState title="No devices recorded" className="py-4" />
          ) : (
            devices.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-surface-200 p-3.5 dark:border-surface-700">
                <LuSmartphone className="size-5 shrink-0 text-surface-400" />
                <div className="min-w-0 grow">
                  <p className="flex items-center gap-2 text-sm font-medium text-surface-800 dark:text-surface-200">
                    {d.name || `${d.browser || 'Browser'} on ${d.platform || 'device'}`}
                    {d.isTrusted && <Badge color="green">Trusted</Badge>}
                  </p>
                  <p className="text-xs text-surface-400">
                    {d.lastIp || 'unknown IP'} · seen {formatRelative(d.lastSeenAt)}
                  </p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => trustDevice.mutate({ id: d.id, isTrusted: !d.isTrusted })}>
                  {d.isTrusted ? 'Untrust' : 'Trust'}
                </Button>
                <Button
                  variant="ghost" size="xs"
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  onClick={() => removeDevice.mutate(d.id)}
                >
                  <LuTrash2 className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="My Profile" description="Manage your personal information and account security." />
      <Tabs
        tabs={[
          { key: 'profile', label: 'Profile', icon: LuUserRound },
          { key: 'security', label: 'Security', icon: LuShieldCheck },
        ]}
      >
        {(active) =>
          active === 'profile' ? (
            <ProfileTab />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Password"
                  description="Change your account password. Other sessions are signed out for safety."
                  actions={
                    <Button variant="secondary" size="sm" leftIcon={LuKeyRound} onClick={() => navigate('/change-password')}>
                      Change password
                    </Button>
                  }
                />
              </Card>
              <MfaSection />
              <SessionsSection />
            </div>
          )
        }
      </Tabs>
    </div>
  );
}
