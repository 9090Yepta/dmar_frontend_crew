import { createFileRoute } from '@tanstack/react-router';
import { NotFoundPage } from '../components/ui/NotFoundPage';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});
