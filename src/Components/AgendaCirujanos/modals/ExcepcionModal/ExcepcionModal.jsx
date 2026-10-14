'use client';

import { useRef, useState } from 'react';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';
import './ExcepcionModal.css';
import Button from '@/Components/Button/Button';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import DatePicker from '@/Components/DatePicker/DatePicker';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  AYUDA_TIPO, cambiarTipoExcepcion, ETIQUETA_TIPO, MOTIVOS_EXCEPCION,
} from '@/hooks/AgendaCirujanos/excepciones';
import { FIN_JORNADA, INICIO_JORNADA, opcionesHora } from '@/hooks/AgendaCirujanos/horario';
import { errorExcepcion } from '@/hooks/AgendaCirujanos/validaciones';

const TIPOS = ['bloqueo', 'apertura'];
const OPCIONES_INICIO = opcionesHora(INICIO_JORNADA, FIN_JORNADA - 30);
const OPCIONES_FIN = opcionesHora(INICIO_JORNADA + 30, FIN_JORNADA);

// Formulario de una excepción (bloqueo o apertura extra). Es controlado por un
// borrador local inicializado desde `inicial` (así "Volver a editar" desde la
// advertencia reabre el formulario con lo que el usuario ya había escrito).
// Valida con errorExcepcion y, si es válido, entrega el borrador a `onGuardar`;
// guardar y advertir de conflictos lo resuelve EditorAgenda.
export default function ExcepcionModal({ inicial, onGuardar, onCerrar }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState('');

  const cambiar = (parche) => { setForm((actual) => ({ ...actual, ...parche })); setError(''); };
  const opcionesMotivo = MOTIVOS_EXCEPCION[form.tipo].map((m) => ({ value: m, label: m }));

  function enviar(e) {
    e.preventDefault();
    const mensaje = errorExcepcion(form);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    onGuardar({ ...form, nota: form.nota.trim() });
  }

  // Escape cierra el modal, salvo que lo reciba un desplegable abierto (FormSelect/DatePicker
  // viven en document.body y su cierre es de ellos): ahí solo se cierra el desplegable.
  function manejarTecla(e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (e.target.closest?.('.form-select-dropdown, .dp-panel')) return;
    if (document.querySelector('.form-select-dropdown, .dp-panel')) return;
    onCerrar();
  }

  return (
    <div className="modal-overlay open" onKeyDown={manejarTecla}>
      <div
        ref={cardRef}
        className="modal-card ac-exc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ac-exc-titulo"
      >
        <form onSubmit={enviar} noValidate>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Agregar excepción"
            titleId="ac-exc-titulo"
            onClose={onCerrar}
          />
          <div className="modal-body">
            <div className="chip-group segmented" role="group" aria-label="Tipo de excepción">
              {TIPOS.map((tipo) => (
                <ChipFilter
                  key={tipo}
                  variant="segmented"
                  active={form.tipo === tipo}
                  aria-pressed={form.tipo === tipo}
                  onClick={() => { setForm((actual) => cambiarTipoExcepcion(actual, tipo)); setError(''); }}
                >
                  {ETIQUETA_TIPO[tipo]}
                </ChipFilter>
              ))}
            </div>
            <p className="ac-hint ac-exc-ayuda">{AYUDA_TIPO[form.tipo]}</p>

            <div className="form-field">
              <label htmlFor="ac-exc-motivo">Motivo</label>
              <FormSelect
                id="ac-exc-motivo"
                value={form.motivo}
                onChange={(motivo) => cambiar({ motivo })}
                options={opcionesMotivo}
              />
            </div>

            <div className="ac-grid-2">
              <div className="form-field">
                <label htmlFor="ac-exc-desde">Desde</label>
                <DatePicker
                  id="ac-exc-desde"
                  ariaLabel="Desde"
                  value={form.desde}
                  onChange={(desde) => cambiar({ desde })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="ac-exc-hasta">Hasta</label>
                <DatePicker
                  id="ac-exc-hasta"
                  ariaLabel="Hasta"
                  value={form.hasta}
                  min={form.desde || undefined}
                  onChange={(hasta) => cambiar({ hasta })}
                />
              </div>
            </div>

            <label className="ac-check ac-exc-todo-dia">
              <input
                type="checkbox"
                checked={form.todoElDia}
                onChange={(e) => cambiar({ todoElDia: e.target.checked })}
              />
              Todo el día
            </label>

            {!form.todoElDia && (
              <div className="ac-grid-2">
                <div className="form-field">
                  <label htmlFor="ac-exc-inicio">Hora de inicio</label>
                  <FormSelect
                    id="ac-exc-inicio"
                    value={form.inicio}
                    onChange={(inicio) => cambiar({ inicio })}
                    options={OPCIONES_INICIO}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="ac-exc-fin">Hora de fin</label>
                  <FormSelect
                    id="ac-exc-fin"
                    value={form.fin}
                    onChange={(fin) => cambiar({ fin })}
                    options={OPCIONES_FIN}
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="ac-exc-nota">Nota (opcional)</label>
              <input
                id="ac-exc-nota"
                type="text"
                maxLength={140}
                placeholder="Ej. Congreso en Bogotá"
                value={form.nota}
                onChange={(e) => cambiar({ nota: e.target.value })}
              />
            </div>

            {error && (
              <p className="ac-err" role="alert">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit">Guardar excepción</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
