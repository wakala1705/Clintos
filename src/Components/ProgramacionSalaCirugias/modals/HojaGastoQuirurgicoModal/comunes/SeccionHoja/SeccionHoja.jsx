import './SeccionHoja.css';
import Badge from '@/Components/Badge/Badge';

// Tarjeta de una sección de la hoja: ícono + título (h4). `id` es el ancla
// del índice lateral del modal.
export default function SeccionHoja({
  id, icon: Icon, titulo, error = false, aviso = null, children,
}) {
  return (
    <section id={id} className={`hgq-section${error ? ' has-error' : ''}`} aria-labelledby={`${id}-titulo`}>
      <header className="hgq-section-head">
        {Icon && <Icon className="icon hgq-section-icon" aria-hidden="true" />}
        <h4 id={`${id}-titulo`}>{titulo}</h4>
        {aviso && <Badge tone="warn" className="hgq-section-aviso" role="status">{aviso}</Badge>}
      </header>
      <div className="hgq-section-body">{children}</div>
    </section>
  );
}
