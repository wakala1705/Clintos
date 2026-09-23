import './ConfirmActionCard.css';
import Button from '@/Components/Button/Button';
import { LuFilePen } from 'react-icons/lu';

// Acción sensible: propuesta → preview → confirmación del usuario (STATE 06)
// — nunca se ejecuta sola. `resolved` deja el card en un estado final
// (deshabilitado) tras confirmar/cancelar, para que no se pueda disparar dos
// veces desde el mismo turno de conversación.
export default function ConfirmActionCard({
  title, description, items, confirmLabel, cancelLabel, onConfirm, onCancel, resolved,
}) {
  return (
    <div className="cai-confirm">
      <div className="cai-confirm-head">
        <span className="cai-icon-circle cai-confirm-icon"><LuFilePen className="icon" aria-hidden="true" /></span>
        <p className="cai-confirm-title">{title}</p>
      </div>
      <p className="cai-confirm-desc">{description}</p>
      <ul className="cai-confirm-items">
        {items.map((it) => <li key={it.id}>{it.nombre} · Cama {it.cama}</li>)}
      </ul>
      {!resolved && (
        <div className="cai-inline-actions">
          <Button variant="primary" size="sm" onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="outline" size="sm" onClick={onCancel}>{cancelLabel}</Button>
        </div>
      )}
    </div>
  );
}
