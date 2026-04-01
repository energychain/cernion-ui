import type { SidebarItem } from '@/types/ui';

export const MENU_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Energiemarkt',
    href: '/market',
    icon: 'TrendingUp',
  },
  {
    label: 'Qualität',
    href: '/quality',
    icon: 'ShieldCheck',
    children: [
      { label: 'Übersicht', href: '/quality', icon: 'LayoutList' },
      { label: 'MaStR-Audit', href: '/quality/mastr-audit', icon: 'DatabaseZap' },
      { label: 'Netzanschluss', href: '/quality/grid-connection', icon: 'Plug' },
      { label: 'Energy Sharing', href: '/quality/energy-sharing', icon: 'Share2' },
      { label: 'Allokation', href: '/quality/allocation', icon: 'Layers' },
      { label: 'Redispatch', href: '/quality/redispatch', icon: 'ArrowLeftRight' },
    ],
  },
  {
    label: 'Anlagen & Netz',
    href: '/assets',
    icon: 'Zap',
  },
  {
    label: 'Datenpunkte',
    href: '/datapoints',
    icon: 'Database',
  },
  {
    label: 'Monitoring',
    href: '/monitors',
    icon: 'Activity',
    children: [
      { label: 'VNB-Monitor', href: '/monitors/vnb', icon: 'Network' },
      { label: 'NBP-Monitor', href: '/monitors/nbp', icon: 'Radio' },
    ],
  },
  {
    label: 'Administration',
    href: '/admin',
    icon: 'Settings',
    requiredScope: 'full-access',
    children: [
      { label: 'API-Token', href: '/admin/tokens', icon: 'Key', requiredScope: 'full-access' },
      { label: 'Jobs', href: '/admin/jobs', icon: 'Clock', requiredScope: 'full-access' },
      { label: 'System', href: '/admin/system', icon: 'Server', requiredScope: 'full-access' },
    ],
  },
];
