import type { HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';

export type ImpactCard = {
  id: 'cost' | 'sustainability' | 'regional' | 'automation' | 'brdomar' | 'compliance' | 'connectivity' | 'government';
  icon: HydroIconName;
};

export const impactCards: ImpactCard[] = [
  { id: 'cost', icon: 'coin' },
  { id: 'sustainability', icon: 'leaf' },
  { id: 'regional', icon: 'route' },
  { id: 'automation', icon: 'document' },
  { id: 'brdomar', icon: 'ship' },
  { id: 'compliance', icon: 'shield' },
  { id: 'connectivity', icon: 'globe' },
  { id: 'government', icon: 'chart' }
];
