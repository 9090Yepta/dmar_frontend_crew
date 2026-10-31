import { createFileRoute } from '@tanstack/react-router';
import { AccountSettings } from '../features/account/AccountSettings';
import { useMechanicWorkspaceContext } from '../contexts/MechanicWorkspaceContext';

function AccountPage() {
  const workspace = useMechanicWorkspaceContext();
  if (!workspace.user) return null;

  return (
    <AccountSettings
      user={workspace.user}
      busy={workspace.passwordBusy}
      onChangePassword={workspace.changePassword}
      profileImageBusy={workspace.profileImageBusy}
      onUploadProfileImage={workspace.uploadProfileImage}
    />
  );
}

export const Route = createFileRoute('/account')({
  component: AccountPage,
});
