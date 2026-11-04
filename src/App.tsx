import { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Alert } from './components/ui/Alert';
import { AccessCard } from './features/auth/AccessCard';
import { MechanicNavigation } from './components/workspace/MechanicNavigation';
import { useMechanicWorkspace } from './hooks/useMechanicWorkspace';
import { LoginLayout } from './layouts/LoginLayout';
import { MainLayout } from './layouts/MainLayout';
import { MechanicWorkspaceProvider } from './contexts/MechanicWorkspaceContext';
import { NotFoundPage } from './components/ui/NotFoundPage';
import { showError } from './utils/notifications';
import { RouteTransition } from './components/ui/RouteTransition';

export default function App() {
  const workspace = useMechanicWorkspace();
  const navigate = useNavigate();
  const isNotFoundRoute = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === '/$'),
  });
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isReportFormRoute = pathname === '/reports/new' || /^\/report\/[^/]+\/edit$/.test(pathname);
  const shownWorkspaceFormError = useRef('');
  useEffect(() => {
    if (isReportFormRoute && workspace.error && shownWorkspaceFormError.current !== workspace.error) {
      shownWorkspaceFormError.current = workspace.error;
      void showError('Terjadi masalah pada formulir laporan', workspace.error);
    } else if (!isReportFormRoute || !workspace.error) {
      shownWorkspaceFormError.current = '';
    }
  }, [isReportFormRoute, workspace.error]);
  const accessCard = <AccessCard
    user={workspace.user}
    nrpp={workspace.nrpp}
    password={workspace.password}
    rememberMe={workspace.rememberMe}
    busy={workspace.busy}
    onNrppChange={workspace.setNrpp}
    onPasswordChange={workspace.setPassword}
    onRememberMeChange={workspace.setRememberMe}
    onSignIn={workspace.signIn}
    onSignOut={async () => {
      await workspace.signOut();
      await navigate({ to: '/', replace: true });
    }}
  />;

  if (workspace.api === 'loading') {
    return (
      <main className="grid min-h-svh place-items-center bg-base-200 px-4">
        <div className="flex items-center gap-3 rounded-box bg-base-100 px-5 py-4 shadow-sm" role="status">
          <span className="loading loading-spinner loading-md text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Memeriksa sesi…</span>
        </div>
      </main>
    );
  }

  if (!workspace.user) {
    if (isNotFoundRoute) return <NotFoundPage />;
    return (
      <LoginLayout api={workspace.api}>
        <div>
          {accessCard}
          {workspace.error && <Alert kind="error">{workspace.error}</Alert>}
          {workspace.notice && <Alert kind="success">{workspace.notice}</Alert>}
        </div>
      </LoginLayout>
    );
  }

  return (
    <MechanicWorkspaceProvider workspace={workspace}>
      <MainLayout api={workspace.api} navigation={<MechanicNavigation />}>
        {accessCard}
        {workspace.error && !isReportFormRoute && <Alert kind="error">{workspace.error}</Alert>}
        {workspace.notice && <Alert kind="success">{workspace.notice}</Alert>}
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </MainLayout>
    </MechanicWorkspaceProvider>
  );
}
