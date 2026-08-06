import Link from 'next/link';
import './ModuleCard.css';
import { LuArrowRight, LuLock } from 'react-icons/lu';

export default function ModuleCard({ icon: Icon, title, description, href, enabled = true }) {
  const inner = (
    <>
      <div className="module-card-icon"><Icon className="icon" /></div>
      <div className="module-card-body">
        <div className="module-card-title-row">
          <span className="module-card-title">{title}</span>
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
