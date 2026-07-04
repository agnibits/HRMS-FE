import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  LuUsersRound, LuClock, LuCalendarDays, LuWallet, LuBriefcaseBusiness, LuReceipt, LuLaptop, LuActivity, LuDownload,
} from 'react-icons/lu';
import { userService } from '@/services/userService';
import {
  attendanceService, leaveService, payrollService, jobService, expenseService, assetService,
} from '@/services/modules';
import { auditService } from '@/services/auditService';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/cards/Card';
import Button from '@/components/common/Button';

const REPORTS = [
  { key: 'employees', title: 'Employee Directory', description: 'Full workforce list with roles, status and contact details.', icon: LuUsersRound, accent: 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400', service: userService, live: true },
  { key: 'attendance', title: 'Attendance Report', description: 'Daily attendance, late arrivals and absences.', icon: LuClock, accent: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400', service: attendanceService },
  { key: 'leave', title: 'Leave Report', description: 'Leave requests, approvals and balances by employee.', icon: LuCalendarDays, accent: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400', service: leaveService },
  { key: 'payroll', title: 'Payroll Report', description: 'Pay runs, gross-to-net breakdowns and payment status.', icon: LuWallet, accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', service: payrollService },
  { key: 'recruitment', title: 'Recruitment Report', description: 'Open positions, pipeline and time-to-hire.', icon: LuBriefcaseBusiness, accent: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400', service: jobService },
  { key: 'expenses', title: 'Expense Report', description: 'Claims, approvals and reimbursement totals.', icon: LuReceipt, accent: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400', service: expenseService },
  { key: 'assets', title: 'Asset Register', description: 'Equipment inventory, assignments and value.', icon: LuLaptop, accent: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400', service: assetService },
  { key: 'audit', title: 'Audit Trail Export', description: 'Complete audit log for compliance reviews.', icon: LuActivity, accent: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400', service: auditService },
];

export default function Reports() {
  const [downloading, setDownloading] = useState(null);

  const download = async (report) => {
    setDownloading(report.key);
    try {
      await report.service.exportExcel({}, `${report.key}-report.xlsx`);
      toast.success(`${report.title} downloaded`);
    } catch (err) {
      toast.error(
        err?.status === 404
          ? 'This report becomes available once the module ships on the server.'
          : err.message || 'Export failed'
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Download Excel exports for every module. Reports respect your current permissions."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.key} className="flex flex-col">
            <CardBody className="flex grow flex-col">
              <div className="flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-xl ${r.accent}`}>
                  <r.icon className="size-5" />
                </span>
                <h3 className="font-semibold text-surface-900 dark:text-surface-100">{r.title}</h3>
              </div>
              <p className="mt-3 grow text-sm text-surface-500 dark:text-surface-400">{r.description}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-fit"
                leftIcon={LuDownload}
                loading={downloading === r.key}
                onClick={() => download(r)}
              >
                Export Excel
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
