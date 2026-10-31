import { createFileRoute } from '@tanstack/react-router';
import { ReportSummary } from '../features/reports/ReportSummary';
import { useMechanicWorkspaceContext } from '../contexts/MechanicWorkspaceContext';

function HomePage() {
  const workspace = useMechanicWorkspaceContext();
  return <ReportSummary summary={workspace.reportSummary} loading={workspace.summaryLoading} name={workspace.user?.name ?? ''} />;
}

export const Route = createFileRoute('/')({
  component: HomePage,
});
