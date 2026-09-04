'use client';

import { LuChevronRight } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import styles from './ModuleCard.module.css';

export default function ModuleCard({
  icon: Icon,
  tone = 'blue',
  title,
  description,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={[styles.card, styles[tone], disabled && styles.disabled].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.icon}>
        <Icon className={styles.iconGlyph} />
      </span>

      <span className={styles.text}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {disabled && <Badge tone="neutral">Próximamente</Badge>}
        </span>
        <span className={styles.description}>{description}</span>
      </span>

      {!disabled && <LuChevronRight className={styles.chevron} />}
    </button>
  );
}
