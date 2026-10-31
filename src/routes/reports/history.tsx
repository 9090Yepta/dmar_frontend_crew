import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ReportHistory } from '../../features/reports/ReportHistory';
import { useMechanicWorkspaceContext } from '../../contexts/MechanicWorkspaceContext';

function ReportHistoryPage() {
  const workspace = useMechanicWorkspaceContext();
  const navigate = useNavigate();

  return (
    <ReportHistory
      reports={workspace.reports}
      search={workspace.search}
      foremen={workspace.reportForemen}
      foremanId={workspace.reportForemanId}
      status={workspace.reportStatus}
      loading={workspace.reportsLoading}
      total={workspace.reportTotal}
      offset={workspace.reportOffset}
      limit={workspace.reportLimit}
      onSearchChange={workspace.updateReportSearch}
      onSearch={workspace.searchReports}
      onForemanChange={workspace.filterReportForeman}
      onStatusChange={workspace.filterReportStatus}
      onOffsetChange={workspace.setReportOffset}
      onLimitChange={workspace.setReportLimit}
      onEdit={(report) => void navigate({ to: '/report/$id/edit', params: { id: String(report.id) } })}
      onDelete={(id) => void workspace.deleteReport(id)}
    />
  );
}

export const Route = createFileRoute('/reports/history')({
  component: ReportHistoryPage,
});
