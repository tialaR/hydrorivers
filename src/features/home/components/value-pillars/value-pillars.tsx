import { getTranslations } from 'next-intl/server';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon, type HydroIconName } from '@/shared/ui/hydro-icon/hydro-icon';
import styles from './value-pillars.module.scss';

const icons: HydroIconName[] = ['coin', 'leaf', 'chart'];

type ValuePillarsProps = {
  locale: string;
};

export async function ValuePillars({ locale }: ValuePillarsProps) {
  const t = await getTranslations({ locale, namespace: 'pages.home.benefits' });
  const items = ['cost', 'region', 'automation'] as const;
  return (
    <section className={styles.grid}>
      {items.map((item, index) => (
        <Card key={item} className={styles.pillar}>
          <span className={styles.icon}><HydroIcon name={icons[index]} /></span>
          <h2>{t(`${item}.title`)}</h2>
          <p>{t(`${item}.description`)}</p>
        </Card>
      ))}
    </section>
  );
}
