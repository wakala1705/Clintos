import './SeccionHoja.css';
import { formatoCOP } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Tarjeta de una sección de la hoja: ícono + título (h4) + total opcional
// a la derecha. `id` es el ancla del índice lateral del modal.
export default function SeccionHoja({
  id, icon: Icon, titulo, total, error = false, children,
}) {
  return (
    <section id={id} className={`hgq-section${error ? ' has-error' : ''}`} aria-labelledby={`${id}-titulo`}>
      <header className="hgq-section-head">
        {Icon && <Icon className="icon hgq-section-icon" aria-hidden="true" />}
        <h4 id={`${id}-titulo`}>{titulo}</h4>
        {total !== undefined && <span className="hgq-section-total">{formatoCOP(total)}</span>}
      </header>
      <div className="hgq-section-body">{children}</div>
    </section>
  );
}
