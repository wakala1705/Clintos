import { LuClipboardList } from 'react-icons/lu';
import './EncabezadoSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import Badge from '@/Components/Badge/Badge';
import { HOJA_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { SALAS, fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

function Dato({ label, children, wide = false }) {
  return (
    <div className={`hgq-dato${wide ? ' wide' : ''}`}>
      <div className="hgq-dato-label">{label}</div>
      <div className="hgq-dato-valor">{children}</div>
    </div>
  );
}

export default function EncabezadoSection({
  cirugia, hoja, admision, onChangeAdmision, readOnly, error,
}) {
  const sala = SALAS.find((s) => s.value === cirugia.salaId)?.descripcion ?? '—';
  return (
    <SeccionHoja id="hgq-encabezado" icon={LuClipboardList} titulo="Encabezado" error={error}>
      <div className="hgq-grid">
        <Dato label="N° de hoja">{hoja.numero}</Dato>
        <Dato label="N° de programación">{cirugia.id}</Dato>
        <Dato label="Estado">
          <Badge tone={hoja.estado === 'cerrada' ? 'success' : 'warn'}>{HOJA_ESTADO_LABEL[hoja.estado]}</Badge>
        </Dato>
        <Dato label="Fecha y hora programada" wide>{fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}</Dato>
        {hoja.reaperturas?.length > 0 && (
          <Dato label="Reaperturas">Reabierta {hoja.reaperturas.length} {hoja.reaperturas.length === 1 ? 'vez' : 'veces'}</Dato>
        )}
        <Dato label="Sala">{sala}</Dato>
        <Dato label="Servicio">{cirugia.servicio}</Dato>
        <Dato label="Tipo de cirugía">{cirugia.tipoCirugia}</Dato>
        <div>
          <label htmlFor="hgq-admision" className="hgq-field-label">N° de admisión</label>
          <input
            id="hgq-admision"
            className="hgq-input"
            value={admision ?? ''}
            disabled={readOnly}
            onChange={(e) => onChangeAdmision(e.target.value)}
          />
        </div>
      </div>
    </SeccionHoja>
  );
}
