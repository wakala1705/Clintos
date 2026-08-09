import './SectionCard.css';

// Tarjeta base de cada una de las 6 secciones de la ficha completa — el id
// es el ancla que usa FichaNav para el scroll lateral (ver FichaNav.jsx).
export default function SectionCard({ id, icon: Icon, title, description, actions, children }) {
  return (
    <section id={id} className="fp-section-card">
      <div className="fp-section-head">
        <div className="fp-section-heading">
          {Icon && (
            <span className="fp-section-icon">
              <Icon className="icon" />
            </span>
          )}
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </div>
        {actions && <div className="fp-section-actions">{actions}</div>}
      </div>
      <div className="fp-section-body">{children}</div>
    </section>
  );
}
