import { LuPenLine } from 'react-icons/lu';
import './FirmasSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import Button from '@/Components/Button/Button';
import { fechaHoraHoja } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const FIRMAS = [
  { rol: 'circulante', label: 'Circulante' },
  { rol: 'instrumentadora', label: 'Instrumentadora' },
  { rol: 'cirujano', label: 'Cirujano' },
];

export default function FirmasSection({
  observaciones, onChangeObservaciones, nombres, firmas, onPedirFirma, onQuitarFirma, reaperturas, readOnly,
}) {
  return (
    <SeccionHoja id="hgq-firmas" icon={LuPenLine} titulo="Observaciones y firmas">
      <div className="form-field">
        <label htmlFor="hgq-observaciones" className="hgq-field-label">Observaciones</label>
        <textarea
          id="hgq-observaciones"
          rows={3}
          className="hgq-input hgq-textarea"
          value={observaciones ?? ''}
          disabled={readOnly}
          onChange={(e) => onChangeObservaciones(e.target.value)}
        />
      </div>
      <div className="hgq-firmas">
        {FIRMAS.map((f) => {
          const firmada = firmas?.[f.rol];
          return (
            <div key={f.rol} className={`hgq-firma${firmada ? ' firmada' : ''}`}>
              <div className="hgq-firma-rol">{f.label}</div>
              <div className="hgq-firma-nombre">{nombres?.[f.rol] || '—'}</div>
              <div className="hgq-firma-fecha">{firmada ? `Firmada ${fechaHoraHoja(firmada)}` : 'Pendiente de firma'}</div>
              {!readOnly && (
                <Button
                  variant={firmada ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => (firmada ? onQuitarFirma?.(f.rol) : onPedirFirma?.(f.rol))}
                >
                  {firmada ? 'Quitar firma' : 'Firmar'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {reaperturas?.length > 0 && (
        <div className="hgq-reaperturas">
          <div className="hgq-firma-rol">Historial de reaperturas</div>
          <ul>
            {reaperturas.map((r) => (
              <li key={`${r.en}-${r.motivo}`}>{fechaHoraHoja(r.en)} · {r.motivo}</li>
            ))}
          </ul>
        </div>
      )}
    </SeccionHoja>
  );
}
