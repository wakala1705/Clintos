'use client';

import { LuTriangleAlert } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { MOTIVOS_NOVEDAD } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './NovedadRecepcion.css';

// Panel "Novedad de la recepción": aparece cuando hay diferencia frente a lo
// solicitado. Si la diferencia es solo de farmacia el motivo ya viene asumido
// ('faltante-farmacia'); si hay faltantes en la entrega el motivo es
// obligatorio (registrarRecepcion lo exige).
export default function NovedadRecepcion({
  origen, motivo, nota, onChange,
}) {
  const obligatorio = origen === 'entrega' || origen === 'ambos';
  const descripcion = obligatorio
    ? 'Llegó menos de lo que farmacia despachó: indica el motivo para poder confirmar.'
    : 'Farmacia despachó menos de lo solicitado. Queda registrado como faltante de farmacia.';
  return (
    <div className="cnc-novedad-panel" role="group" aria-label="Novedad de la recepción">
      <div className="cnc-novedad-head">
        <LuTriangleAlert className="icon" aria-hidden="true" />
        <p><strong>Novedad de la recepción</strong>{descripcion}</p>
      </div>
      <div className="cnc-novedad-campos">
        <div className="cnc-novedad-motivo">
          <label htmlFor="cnc-novedad-motivo" className="cnc-novedad-label">
            Motivo{obligatorio ? ' *' : ''}
          </label>
          <FormSelect
            id="cnc-novedad-motivo"
            ariaLabel="Motivo de la novedad"
            value={motivo ?? ''}
            onChange={(v) => onChange({ motivo: v })}
            options={MOTIVOS_NOVEDAD}
            placeholder="Selecciona un motivo"
          />
        </div>
        <div className="cnc-novedad-nota">
          <label htmlFor="cnc-novedad-nota" className="cnc-novedad-label">Nota (opcional)</label>
          <textarea
            id="cnc-novedad-nota"
            rows={2}
            maxLength={240}
            placeholder="Detalle para farmacia"
            value={nota ?? ''}
            onChange={(e) => onChange({ nota: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
