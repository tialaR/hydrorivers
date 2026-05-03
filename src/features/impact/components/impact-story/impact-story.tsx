import { getTranslations } from 'next-intl/server';
import { Link } from '@/core/i18n/navigation';
import { Card } from '@/shared/ui/card/card';
import { HydroIcon } from '@/shared/ui/hydro-icon/hydro-icon';
import { impactCards } from '../../data/impact.mock';
import styles from './impact-story.module.scss';

export async function ImpactStory() {
  const page = await getTranslations('pages.impact');
  const cards = await Promise.all(
    impactCards.map(async (card) => {
      const t = await getTranslations(`impactCards.${card.id}`);
      return {
        ...card,
        title: t('title'),
        description: t('description')
      };
    })
  );

  return (
    <section className={styles.grid}>
      {cards.map((card) => (
        <Link key={card.id} href={`/impacto/${card.id}`} className={styles.linkWrap}>
          <Card className={styles.card}>
            <span className={styles.icon}><HydroIcon name={card.icon} /></span>
            <strong>{card.metric}</strong>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </Card>
        </Link>
      ))}
      <Card className={styles.storyBox}>
        <span className={styles.icon}><HydroIcon name="leaf" /></span>
        <div>
          <strong>{page('storyTitle')}</strong>
          <p>{page('storyDescription')}</p>
        </div>
      </Card>
    </section>
  );
}
