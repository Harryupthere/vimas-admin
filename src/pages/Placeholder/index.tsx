import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { BoxIcon } from '../../layouts/AdminLayout/icons';

export interface PlaceholderPageProps {
  title: string;
  note?: string;
}

/**
 * Stand-in for pages not yet built in this development pass. The sidebar
 * routes to this component so the app is fully click-through-able today;
 * each of these gets replaced with a real CRUD page in a later phase.
 */
export function PlaceholderPage({ title, note }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={<BoxIcon width={40} height={40} />}
        title="This page is being built next"
        description={note ?? `${title} will be connected to its Admin API in an upcoming phase.`}
      />
    </div>
  );
}
