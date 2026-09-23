import './PatientResultList.css';
import Button from '@/Components/Button/Button';
import { LuFileText } from 'react-icons/lu';

// Lista compacta de pacientes (STATE 04) — click en la fila pide el resumen
// del paciente dentro del panel (`onSelectPatient`, reusa el mismo motor de
// respuestas con un prompt sintético "Resumen de <nombre>"); el botón
// "Ver historia" navega de verdad a su historia clínica, mismo patrón que la
// tabla principal de PatientsTable.jsx.
export default function PatientResultList({ intro, items, followUp, onSelectPatient, onOpenHistoria }) {
  return (
    <div className="cai-result">
      {intro && <p className="cai-msg-assistant">{intro}</p>}
      <ul className="cai-result-list">
        {items.map((p) => (
          <li key={p.id} className="cai-result-item">
            <button type="button" className="cai-result-item-main" onClick={() => onSelectPatient(p.id, p.nombre)}>
              <span className="cai-result-nombre">{p.nombre}</span>
              <span className="cai-result-meta">Cama {p.cama} · {p.meta}</span>
            </button>
            <Button variant="outline" size="sm" icon={LuFileText} onClick={() => onOpenHistoria(p.id)}>
              Historia
            </Button>
          </li>
        ))}
      </ul>
      {followUp && <p className="cai-msg-assistant cai-result-followup">{followUp}</p>}
    </div>
  );
}
