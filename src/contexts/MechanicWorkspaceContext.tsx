import { createContext, useContext, type ReactNode } from 'react';
import { useMechanicWorkspace } from '../hooks/useMechanicWorkspace';

type MechanicWorkspaceState = ReturnType<typeof useMechanicWorkspace>;

const MechanicWorkspaceContext = createContext<MechanicWorkspaceState | null>(null);

export function MechanicWorkspaceProvider({
  workspace,
  children,
}: {
  workspace: MechanicWorkspaceState;
  children: ReactNode;
}) {
  return (
    <MechanicWorkspaceContext.Provider value={workspace}>
      {children}
    </MechanicWorkspaceContext.Provider>
  );
}

export function useMechanicWorkspaceContext(): MechanicWorkspaceState {
  const workspace = useContext(MechanicWorkspaceContext);
  if (!workspace) {
    throw new Error('MechanicWorkspaceContext hanya bisa dipakai di dalam root mekanik.');
  }
  return workspace;
}
