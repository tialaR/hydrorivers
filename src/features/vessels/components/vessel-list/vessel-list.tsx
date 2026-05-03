import type { Vessel } from '@/features/marketplace/domain/marketplace.types';
import { VesselCard } from '../vessel-card/vessel-card';
import styles from './vessel-list.module.scss';

export function VesselList({ vessels }: { vessels: Vessel[] }) {
  return <section className={styles.grid}>{vessels.map((vessel) => <VesselCard key={vessel.id} vessel={vessel} />)}</section>;
}
