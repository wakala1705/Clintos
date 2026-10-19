import Link from 'next/link';
import './ModuleCard.css';
import Badge from '@/Components/Badge/Badge';
import { LuArrowRight, LuLock } from 'react-icons/lu';

export default function ModuleCard({
  icon: Icon, title, badge, description, href, enabled = true, tone = 'blue',
}) {
  const inner = (
    <>
      <div className={`module-card-icon${tone !== 'blue' ? ` tone-${tone}` : ''}`}><Icon className="icon" /></div>
      <div className="module-card-body">
        <div className="module-card-title-row">
          <span className="module-card-title">{title}</span>
          {badge && <Badge tone="info">{badge}</Badge>}
          {!enabled && (
            <span className="module-card-badge"><LuLock className="icon" />Próximamente</span>
          )}
        </div>
        <div className="module-card-desc">{description}</div>
      </div>
      {enabled && <LuArrowRight className="icon module-card-cta" aria-hidden="true" />}
    </>
  );

  if (!enabled) {
    return (
      <div className="module-card disabled" aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className="module-card">
      {inner}
    </Link>
  );
}
