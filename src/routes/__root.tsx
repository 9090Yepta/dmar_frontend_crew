import { createRootRoute } from '@tanstack/react-router';
import App from '../App';
import { LoadingIndicator } from '../components/ui/LoadingIndicator';

export const Route = createRootRoute({
  component: () => <><App /><LoadingIndicator /></>,
});
