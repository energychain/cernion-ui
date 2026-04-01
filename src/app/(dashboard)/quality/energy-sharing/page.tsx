import { ComingSoon } from '@/components/shared/empty-state';

export default function EnergySharingPage() {
  return (
    <ComingSoon
      title="Energy Sharing (§42c EnWG)"
      description="Generator/Consumer-Tabelle und §42c-Deadline-Tracker — verfügbar in v0.20.3"
      deadline={new Date('2026-06-01')}
    />
  );
}
