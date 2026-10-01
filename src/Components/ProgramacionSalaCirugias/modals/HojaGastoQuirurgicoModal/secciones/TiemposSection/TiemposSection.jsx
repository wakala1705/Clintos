import { LuTimer } from 'react-icons/lu';
import './TiemposSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { duracionesHoja, duracionTexto } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { ASA_CATALOGO, COMPLEJIDAD_CATALOGO, TIPOS_ANESTESIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const TIEMPOS = [
  { key: 'ingresoSala', label: 'Ingreso a sala' },
  { key: 'inicioAnestesia', label: 'Inicio de anestesia' },
  { key: 'inicioCirugia', label: 'Inicio de cirugía' },
  { key: 'finCirugia', label: 'Fin de cirugía' },
  { key: 'salidaSala', label: 'Salida de sala' },
];
const opciones = (lista) => lista.map((v) => ({ value: v, label: v }));

export default function TiemposSection({
  tiempos, anestesia, onChangeTiempos, onChangeAnestesia, readOnly, errorTiempos, errorAnestesia,
}) {
  const d = duracionesHoja(tiempos);
  return (
    <>
      <SeccionHoja id="hgq-tiempos" icon={LuTimer} titulo="Tiempos" error={errorTiempos}>
        <div className="hgq-grid">
          {TIEMPOS.map((t) => (
            <div key={t.key}>
              <label htmlFor={`hgq-${t.key}`} className="hgq-field-label">{t.label}</label>
              <input
                id={`hgq-${t.key}`}
                type="time"
                className="hgq-input"
                value={tiempos?.[t.key] ?? ''}
                disabled={readOnly}
                onChange={(e) => onChangeTiempos({ ...tiempos, [t.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <dl className="hgq-duraciones">
          <div><dt>Duración de cirugía</dt><dd>{duracionTexto(d.cirugia)}</dd></div>
          <div><dt>Duración de anestesia</dt><dd>{duracionTexto(d.anestesia)}</dd></div>
          <div><dt>Ocupación de sala</dt><dd>{duracionTexto(d.sala)}</dd></div>
        </dl>
      </SeccionHoja>

      <SeccionHoja id="hgq-anestesia" icon={LuTimer} titulo="Anestesia y clasificación" error={errorAnestesia}>
        <div className="hgq-grid">
          <div className="form-field">
            <label htmlFor="hgq-anestesia-tipo" className="hgq-field-label">Tipo de anestesia</label>
            <FormSelect id="hgq-anestesia-tipo" value={anestesia?.tipo ?? ''} disabled={readOnly} options={opciones(TIPOS_ANESTESIA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, tipo: v })} />
          </div>
          <div className="form-field wide">
            <label htmlFor="hgq-anestesia-asa" className="hgq-field-label">ASA</label>
            <FormSelect id="hgq-anestesia-asa" value={anestesia?.asa ?? ''} disabled={readOnly} options={opciones(ASA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, asa: v })} />
          </div>
          <div className="form-field">
            <label htmlFor="hgq-anestesia-complejidad" className="hgq-field-label">Complejidad</label>
            <FormSelect id="hgq-anestesia-complejidad" value={anestesia?.complejidad ?? ''} disabled={readOnly} options={opciones(COMPLEJIDAD_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, complejidad: v })} />
          </div>
        </div>
      </SeccionHoja>
    </>
  );
}
