import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ReportForm } from '../../features/reports/ReportForm';
import { useMechanicWorkspaceContext } from '../../contexts/MechanicWorkspaceContext';

function NewReportPage() {
  const workspace = useMechanicWorkspaceContext();
  useEffect(() => {
    workspace.startNewReport();
  }, [workspace.startNewReport]);

  return (
    <ReportForm
      catalogs={workspace.catalogs}
      catalogsError={workspace.catalogsError}
      form={workspace.form}
      editId={null}
      busy={workspace.busy}
      onChange={workspace.setForm}
      onSubmit={(event) => workspace.submitReport(event, null)}
      onCancelEdit={workspace.cancelEdit}
    />
  );
}

export const Route = createFileRoute('/reports/new')({
  component: NewReportPage,
});
