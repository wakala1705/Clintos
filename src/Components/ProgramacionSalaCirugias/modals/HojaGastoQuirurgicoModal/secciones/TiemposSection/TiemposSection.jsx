import { useState } from 'react';
import { LuTimer, LuClock, LuCheck, LuPencil, LuTriangleAlert } from 'react-icons/lu';
import './TiemposSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HoraInput from '../../comunes/HoraInput/HoraInput';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  HITOS_TIEMPOS, aMinutos, duracionesHoja, duracionTexto, hitosFueraDeOrden, horaAhora, siguienteHito,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { ASA_CATALOGO, COMPLEJIDAD_CATALOGO, TIPOS_ANESTESIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const opciones = (lista) => lista.map((v) => ({ value: v, label: v }));

// "Programado: X" bajo un select cuyo valor difiere de lo cargado en la programación.
function ProgramadoHint({ campo, anestesia, anestesiaProgramada }) {
  const prog = anestesiaProgramada?.[campo] ?? '';
  if (!prog || (anestesia?.[campo] ?? '') === prog) return null;
  return <span className="hgq-programado">Programado: {prog}</span>;
}

export default function TiemposSection({
  tiempos, anestesia, anestesiaProgramada, programado, onChangeTiempos, onChangeAnestesia, readOnly,
}) {
  const [editando, setEditando] = useState(null);
  const [anuncio, setAnuncio] = useState('');
  const d = duracionesHoja(tiempos ?? {});
  const siguiente = siguienteHito(tiempos);
  const siguienteLabel = HITOS_TIEMPOS.find((h) => h.key === siguiente)?.label;
  const fuera = hitosFueraDeOrden(tiempos);
  const programadoDe = { inicioCirugia: programado?.inicio, finCirugia: programado?.fin };

  const registrar = () => {
    if (!siguiente) return;
    const hora = horaAhora();
    onChangeTiempos?.({ ...tiempos, [siguiente]: hora });
    setAnuncio(`${siguienteLabel} registrado a las ${hora}`);
  };

  const abrirEdicion = (key) => {
    setEditando(key);
    // Foco al input una vez montado.
    setTimeout(() => document.getElementById(`hgq-${key}`)?.focus(), 0);
  };

  return (
    <SeccionHoja id="hgq-tiempos" icon={LuTimer} titulo="Tiempos y anestesia">
      <div className="hgq-hitos-accion">
        {siguiente && !readOnly && (
          <Button icon={LuClock} className="hgq-hitos-btn" onClick={registrar}>
            Registrar {siguienteLabel.toLowerCase()}
          </Button>
        )}
        {!siguiente && (
          <p className="hgq-hitos-completo"><LuCheck className="icon" aria-hidden="true" /> Todos los hitos registrados</p>
        )}
        <div className="hgq-hitos-live" role="status" aria-live="polite">{anuncio}</div>
      </div>

      <ol className="hgq-hitos" aria-label="Línea de tiempo de la cirugía">
        {HITOS_TIEMPOS.map((h) => {
          const valor = tiempos?.[h.key] ?? '';
          const valido = aMinutos(valor) !== null;
          const esSiguiente = h.key === siguiente;
          const enEdicion = editando === h.key && !readOnly;
          const estado = valido ? 'hecho' : esSiguiente ? 'siguiente' : 'pendiente';
          return (
            <li key={h.key} className={`hgq-hito hgq-hito-${estado}`} aria-current={esSiguiente ? 'step' : undefined}>
              <span className="hgq-hito-marca" aria-hidden="true">{valido && <LuCheck className="icon" />}</span>
              <div className="hgq-hito-cuerpo">
                <label htmlFor={`hgq-${h.key}`} className="hgq-hito-label">{h.label}</label>
                {enEdicion ? (
                  <div className="hgq-hito-edicion">
                    <HoraInput
                      id={`hgq-${h.key}`}
                      label={h.label}
                      sinAhora
                      value={valor}
                      onChange={(v) => onChangeTiempos?.({ ...tiempos, [h.key]: v })}
                    />
                    <button type="button" className="hgq-hito-icbtn" aria-label={`Confirmar hora de ${h.label}`} onClick={() => setEditando(null)}>
                      <LuCheck className="icon" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="hgq-hito-lectura">
                    <span className="hgq-hito-hora">{valido ? valor : '—'}</span>
                    {!readOnly && (
                      <button type="button" className="hgq-hito-icbtn hgq-no-print" aria-label={`Editar hora de ${h.label}`} onClick={() => abrirEdicion(h.key)}>
                        <LuPencil className="icon" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
                {programadoDe[h.key] && <span className="hgq-hito-prog">programado {programadoDe[h.key]}</span>}
                {fuera.includes(h.key) && (
                  <span className="hgq-hito-alerta"><LuTriangleAlert className="icon" aria-hidden="true" /> Fuera de orden</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <dl className="hgq-duraciones">
        <div><dt>Duración de cirugía</dt><dd>{duracionTexto(d.cirugia)}</dd></div>
        <div><dt>Duración de anestesia</dt><dd>{duracionTexto(d.anestesia)}</dd></div>
        <div><dt>Ocupación de sala</dt><dd>{duracionTexto(d.sala)}</dd></div>
      </dl>

      <h5 className="hgq-subtitulo">Anestesia y clasificación</h5>
      <div className="hgq-grid">
        <div className="form-field">
          <label htmlFor="hgq-anestesia-tipo" className="hgq-field-label">Tipo de anestesia</label>
          <FormSelect id="hgq-anestesia-tipo" value={anestesia?.tipo ?? ''} disabled={readOnly} options={opciones(TIPOS_ANESTESIA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, tipo: v })} />
          <ProgramadoHint campo="tipo" anestesia={anestesia} anestesiaProgramada={anestesiaProgramada} />
        </div>
        <div className="form-field wide">
          <label htmlFor="hgq-anestesia-asa" className="hgq-field-label">ASA</label>
          <FormSelect id="hgq-anestesia-asa" value={anestesia?.asa ?? ''} disabled={readOnly} options={opciones(ASA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, asa: v })} />
          <ProgramadoHint campo="asa" anestesia={anestesia} anestesiaProgramada={anestesiaProgramada} />
        </div>
        <div className="form-field">
          <label htmlFor="hgq-anestesia-complejidad" className="hgq-field-label">Complejidad</label>
          <FormSelect id="hgq-anestesia-complejidad" value={anestesia?.complejidad ?? ''} disabled={readOnly} options={opciones(COMPLEJIDAD_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, complejidad: v })} />
          <ProgramadoHint campo="complejidad" anestesia={anestesia} anestesiaProgramada={anestesiaProgramada} />
        </div>
      </div>
    </SeccionHoja>
  );
}
