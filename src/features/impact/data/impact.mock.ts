import type { HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';

export type ImpactCard = {
  id: 'cost' | 'sustainability' | 'regional' | 'automation' | 'brdomar' | 'compliance' | 'connectivity' | 'government';
  metric: string;
  icon: HydroIconName;
};

export const impactCards: ImpactCard[] = [
  { id: 'cost', metric: '-28%', icon: 'coin' },
  { id: 'sustainability', metric: '-38% CO₂', icon: 'leaf' },
  { id: 'regional', metric: '+12 rotas', icon: 'route' },
  { id: 'automation', metric: '72% pronto', icon: 'document' },
  { id: 'brdomar', metric: 'BR do Mar', icon: 'ship' },
  { id: 'compliance', metric: 'DOF/NF-e/CT-e', icon: 'shield' },
  { id: 'connectivity', metric: 'offline-first', icon: 'globe' },
  { id: 'government', metric: 'piloto Gov', icon: 'chart' }
];
