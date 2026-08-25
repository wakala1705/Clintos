'use client';

import { useRef, useState } from 'react';
import './ReservarCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Typeahead from '../Typeahead/Typeahead';
import {
  AREA_LABEL, PISO_LABEL, PRIORIDADES_RESERVA, SECTOR_LABEL, SEDE_LABEL,
  buscarAdmisiones, buscarPacientes, crearReserva,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuClock, LuLoaderCircle } from 'react-icons/lu';

// Orden de validación = orden visual de los campos (encargo: "muestra el
// error inline en el primer campo inválido, haciendo scroll/focus hacia
// él") — CAMPO_ORDEN es la única fuente de verdad de ese orden, tanto para
// construir el objeto de errores como para decidir cuál es "el primero".
const CAMPO_ORDEN = ['paciente', 'admision', 'fechaInicio', 'fechaVencimiento', 'motivo'];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Valor mínimo para <input type="datetime-local"> = "ahora" en hora local
// (encargo: "Fecha inicio no puede ser anterior al momento actual" — sin
// confirmación de negocio sobre reservas retroactivas, se asume que no se
// permiten, es la lectura más segura por defecto).
function nowDatetimeLocalValue() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function labelAdmision(a) {
  return `${a.admisionId} — ${a.paciente.nombre}`;
}

// "Reservar cama" (encargo) — formulario real con búsqueda de Paciente/
// Admisión (typeahead debounced, ver Typeahead.jsx + buscarPacientes/
// buscarAdmisiones en mockCamasData.js), a diferencia de la versión anterior
// de este modal (texto libre sin validar). Elegir una Admisión autocompleta
// y bloquea Paciente (encargo, opción "b" explícita: "evita inconsistencia
// de datos, reservar con un paciente distinto al de la admisión
// seleccionada") — Paciente vuelve a quedar libre si el usuario edita/
// deselecciona esa Admisión.
export default function ReservarCamaModal({ cama, onClose, onReservar }) {
  const [pacienteQuery, setPacienteQuery] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [admisionQuery, setAdmisionQuery] = useState('');
  const [admisionSeleccionada, setAdmisionSeleccionada] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [prioridad, setPrioridad] = useState('normal');
  const [motivo, setMotivo] = useState('');

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const pacienteRef = useRef(null);
  const admisionRef = useRef(null);
  const fechaInicioRef = useRef(null);
  const fechaVencimientoRef = useRef(null);
  const motivoRef = useRef(null);
  const CAMPO_REF = {
    paciente: pacienteRef, admision: admisionRef, fechaInicio: fechaInicioRef, fechaVencimiento: fechaVencimientoRef, motivo: motivoRef,
  };

  function setCampoError(campo, mensaje) {
    setErrores((prev) => {
      if (!mensaje) {
        if (!(campo in prev)) return prev;
        const next = { ...prev };
        delete next[campo];
        return next;
      }
      return { ...prev, [campo]: mensaje };
    });
  }

  function errorPaciente() {
    return pacienteSeleccionado ? null : 'Selecciona un paciente de la lista.';
  }
  function errorAdmision() {
    return admisionSeleccionada ? null : 'Selecciona una admisión de la lista.';
  }
  function errorFechaInicio(valor = fechaInicio) {
    if (!valor) return 'La fecha de inicio es obligatoria.';
    if (new Date(valor).getTime() < Date.now()) return 'La fecha de inicio no puede ser anterior al momento actual.';
    return null;
  }
  function errorFechaVencimiento(valor = fechaVencimiento) {
    if (!valor) return 'La fecha de vencimiento es obligatoria.';
    if (fechaInicio && new Date(valor).getTime() <= new Date(fechaInicio).getTime()) {
      return 'La fecha de vencimiento debe ser posterior a la fecha de inicio.';
    }
    return null;
  }
  function errorMotivo() {
    return motivo.trim() ? null : 'El motivo es obligatorio.';
  }

  function handleSelectPaciente(p) {
    setPacienteSeleccionado(p);
    setPacienteQuery(p.nombre);
    setCampoError('paciente', null);
  }
  function handlePacienteQueryChange(text) {
    setPacienteQuery(text);
    if (pacienteSeleccionado) setPacienteSeleccionado(null);
  }

  function handleSelectAdmision(a) {
    setAdmisionSeleccionada(a);
    setAdmisionQuery(labelAdmision(a));
    setCampoError('admision', null);
    handleSelectPaciente(a.paciente);
  }
  function handleAdmisionQueryChange(text) {
    setAdmisionQuery(text);
    if (admisionSeleccionada) {
      // El usuario edita el texto de una Admisión ya elegida: se toma como
      // deselección — y como Paciente se autocompletó A PARTIR de esa
      // Admisión, también se libera (vuelve a ser un campo de búsqueda
      // independiente) en vez de dejar un nombre que ya no traza a ninguna
      // selección concreta.
      setAdmisionSeleccionada(null);
      setPacienteSeleccionado(null);
      setPacienteQuery('');
    }
  }

  function handleBlurFechaInicio() {
    setCampoError('fechaInicio', errorFechaInicio());
    // La ventana pudo volverse inválida si Fecha inicio ahora es posterior
    // o igual a Fecha vencimiento — se re-chequea también acá, mismo
    // criterio "revalidar lo que depende de lo que acabo de tocar" que el
    // resto de formularios del proyecto.
    if (fechaVencimiento) setCampoError('fechaVencimiento', errorFechaVencimiento());
  }
  function handleBlurFechaVencimiento() {
    setCampoError('fechaVencimiento', errorFechaVencimiento());
  }

  function validarTodo() {
    const resultado = {};
    const asignar = (campo, mensaje) => { if (mensaje) resultado[campo] = mensaje; };
    asignar('paciente', errorPaciente());
    asignar('admision', errorAdmision());
    asignar('fechaInicio', errorFechaInicio());
    asignar('fechaVencimiento', errorFechaVencimiento());
    asignar('motivo', errorMotivo());
    return resultado;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (enviando) return;

    const resultado = validarTodo();
    setErrores(resultado);
    const primerInvalido = CAMPO_ORDEN.find((campo) => resultado[campo]);
    if (primerInvalido) {
      const ref = CAMPO_REF[primerInvalido];
      ref.current?.focus();
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setEnviando(true);
    setErrorEnvio('');
    const payload = {
      pacienteId: pacienteSeleccionado.id,
      paciente: pacienteSeleccionado.nombre,
      pacienteHc: pacienteSeleccionado.hc,
      admisionId: admisionSeleccionada.admisionId,
      fechaInicio,
      fechaVencimiento,
      prioridad,
      motivo: motivo.trim(),
    };
    try {
      await crearReserva(payload);
      onReservar(cama.id, payload);
    } catch (err) {
      setEnviando(false);
      const mensaje = err instanceof Error ? err.message : 'No fue posible crear la reserva. Intenta nuevamente.';
      setErrorEnvio(mensaje);
      window.ncToast?.(mensaje);
    }
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card rc-modal-card" role="dialog" aria-modal="true" aria-labelledby="reservar-cama-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuClock}
            tone="primary"
            title="Reservar cama"
            titleId="reservar-cama-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rc-paciente">Paciente<span className="rc-required-mark">*</span></label>
              <Typeahead
                id="rc-paciente"
                inputRef={pacienteRef}
                autoFocus
                value={pacienteQuery}
                onValueChange={handlePacienteQueryChange}
                onSelect={handleSelectPaciente}
                search={buscarPacientes}
                getOptionLabel={(p) => p.nombre}
                getOptionSub={(p) => p.hc}
                placeholder="Buscar paciente por nombre o HC..."
                disabled={!!admisionSeleccionada}
                error={!!errores.paciente}
                describedBy={errores.paciente ? 'rc-paciente-error' : undefined}
              />
              {errores.paciente && <span id="rc-paciente-error" className="rc-error">{errores.paciente}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="rc-admision">Admisión<span className="rc-required-mark">*</span></label>
              <Typeahead
                id="rc-admision"
                inputRef={admisionRef}
                value={admisionQuery}
                onValueChange={handleAdmisionQueryChange}
                onSelect={handleSelectAdmision}
                search={buscarAdmisiones}
                getOptionLabel={(a) => a.admisionId}
                getOptionSub={(a) => `${a.paciente.nombre} · ${a.origen}`}
                placeholder="Buscar admisión por número o paciente..."
                error={!!errores.admision}
                describedBy={errores.admision ? 'rc-admision-error' : undefined}
              />
              {errores.admision && <span id="rc-admision-error" className="rc-error">{errores.admision}</span>}
            </div>

            <div className="rc-row">
              <div className="form-field">
                <label htmlFor="rc-fecha-inicio">Fecha inicio<span className="rc-required-mark">*</span></label>
                <input
                  id="rc-fecha-inicio"
                  ref={fechaInicioRef}
                  type="datetime-local"
                  min={nowDatetimeLocalValue()}
                  value={fechaInicio}
                  onChange={(e) => { setFechaInicio(e.target.value); setCampoError('fechaInicio', null); }}
                  onBlur={handleBlurFechaInicio}
                  aria-invalid={!!errores.fechaInicio || undefined}
                  aria-describedby={errores.fechaInicio ? 'rc-fecha-inicio-error' : undefined}
                />
                {errores.fechaInicio && <span id="rc-fecha-inicio-error" className="rc-error">{errores.fechaInicio}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="rc-fecha-vencimiento">Fecha vencimiento<span className="rc-required-mark">*</span></label>
                <input
                  id="rc-fecha-vencimiento"
                  ref={fechaVencimientoRef}
                  type="datetime-local"
                  min={fechaInicio || nowDatetimeLocalValue()}
                  value={fechaVencimiento}
                  onChange={(e) => { setFechaVencimiento(e.target.value); setCampoError('fechaVencimiento', null); }}
                  onBlur={handleBlurFechaVencimiento}
                  aria-invalid={!!errores.fechaVencimiento || undefined}
                  aria-describedby={errores.fechaVencimiento ? 'rc-fecha-vencimiento-error' : undefined}
                />
                {errores.fechaVencimiento && <span id="rc-fecha-vencimiento-error" className="rc-error">{errores.fechaVencimiento}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rc-prioridad">Prioridad</label>
              <FormSelect
                id="rc-prioridad"
                value={prioridad}
                onChange={setPrioridad}
                options={PRIORIDADES_RESERVA}
              />
            </div>

            <div className="form-field">
              <label htmlFor="rc-motivo">Motivo<span className="rc-required-mark">*</span></label>
              <textarea
                id="rc-motivo"
                ref={motivoRef}
                rows="3"
                placeholder="Ej. Ingreso programado, procedimiento..."
                value={motivo}
                onChange={(e) => { setMotivo(e.target.value); setCampoError('motivo', null); }}
                aria-invalid={!!errores.motivo || undefined}
                aria-describedby={errores.motivo ? 'rc-motivo-error' : undefined}
              />
              {errores.motivo && <span id="rc-motivo-error" className="rc-error">{errores.motivo}</span>}
            </div>

            {errorEnvio && <div className="rc-submit-error" role="alert">{errorEnvio}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={enviando}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando && <LuLoaderCircle className="icon rc-spin" aria-hidden="true" />}
              {enviando ? 'Reservando…' : 'Reservar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
