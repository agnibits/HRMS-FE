import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiBriefcase, FiTag, FiCalendar } from 'react-icons/fi';
import { candidateService, interviewService } from '@/services/modules';
import { formatDate, formatDateTime, titleCase } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import Avatar from '@/components/common/Avatar';
import { StatusChip } from '@/components/common/Badge';
import Timeline from '@/components/common/Timeline';
import { PageLoader } from '@/components/common/Spinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-surface-400" />
      <div className="min-w-0">
        <p className="text-xs text-surface-400">{label}</p>
        <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-200">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const candidateQuery = useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidateService.get(id),
  });

  const interviewsQuery = useQuery({
    queryKey: ['interviews', 'candidate', id],
    queryFn: () => interviewService.list({ candidateId: id, limit: 20, sort: '-scheduledAt' }),
    retry: false,
  });

  const stageMutation = useMutation({
    mutationFn: (stage) => candidateService.update(id, { stage }),
    onSuccess: () => {
      toast.success('Stage updated');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (candidateQuery.isLoading) return <PageLoader label="Loading candidate…" />;
  if (candidateQuery.error)
    return <ErrorState error={candidateQuery.error} onRetry={() => candidateQuery.refetch()} />;

  const candidate = candidateQuery.data?.data || {};
  const name = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Candidate';
  const currentStageIdx = STAGES.indexOf(candidate.stage);

  const interviews = interviewsQuery.data?.data || [];

  return (
    <div>
      <PageHeader
        title={name}
        breadcrumbItems={[
          { label: 'Recruitment', to: '/recruitment' },
          { label: name, to: `/recruitment/candidates/${id}` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={candidate} size="xl" />
            <h2 className="mt-3 text-lg font-bold text-surface-900 dark:text-surface-50">{name}</h2>
            <p className="text-sm text-surface-500">{candidate.jobTitle}</p>
            <div className="mt-3"><StatusChip status={candidate.stage} /></div>
            <div className="mt-6 w-full space-y-4 border-t border-surface-100 pt-5 text-left dark:border-surface-800">
              <InfoRow icon={FiMail} label="Email" value={candidate.email} />
              <InfoRow icon={FiPhone} label="Phone" value={candidate.phone} />
              <InfoRow icon={FiBriefcase} label="Applied for" value={candidate.jobTitle} />
              <InfoRow icon={FiTag} label="Source" value={candidate.source} />
              <InfoRow icon={FiCalendar} label="Applied on" value={formatDate(candidate.createdAt)} />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {/* Pipeline stepper */}
          <Card>
            <CardHeader title="Hiring pipeline" description="Move the candidate through stages." />
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((stage, i) => {
                  const isActive = stage === candidate.stage;
                  const isPast = currentStageIdx >= 0 && i < currentStageIdx;
                  return (
                    <button
                      key={stage}
                      disabled={stageMutation.isPending}
                      onClick={() => stageMutation.mutate(stage)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-sm'
                          : isPast
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300'
                            : 'bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700'
                      }`}
                    >
                      {titleCase(stage)}
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Interviews"
              description="Scheduled and completed rounds for this candidate."
            />
            <CardBody>
              {interviews.length ? (
                <Timeline
                  items={interviews.map((iv) => ({
                    id: iv.id,
                    title: `${iv.round || 'Interview'} · ${iv.interviewer || 'TBD'}`,
                    description: `${iv.mode || ''} ${iv.notes ? `— ${iv.notes}` : ''}`.trim() || undefined,
                    timestamp: iv.scheduledAt,
                    color: iv.status === 'COMPLETED' ? 'green' : iv.status === 'CANCELLED' ? 'red' : 'primary',
                  }))}
                />
              ) : (
                <EmptyState
                  title="No interviews scheduled"
                  description="Schedule the first round from the interview planner."
                  actionLabel="Open scheduler"
                  onAction={() => navigate('/recruitment/interviews')}
                  className="py-4"
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
