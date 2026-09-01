'use client';

import { useState } from 'react';
import './NuevaCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ANESTESIOLOGOS_CATALOGO,
  CANASTAS_CATALOGO,
  CIRCULANTES_CATALOGO,
  CIRUJANOS_CATALOGO,
  EQUIPOS_CATALOGO,
  INSTRUMENTADORAS_CATALOGO,
  PROCEDIMIENTOS_CATALOGO,
  SALAS,
  SERVICIOS_CATALOGO,
  TIPOS_CIRUGIA_CATALOGO,
  fechaISO,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import Button from '@/Components/Button/Button';
import { LuCirclePlus, LuTriangleAlert } from 'react-icons/lu';

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

function minutosEntre(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  return Math.max((h2 * 60 + m2) - (h1 * 60 + m1), 0);
}

function formInicial(sedeId, cirugiaExistente) {
  if (cirugiaExistente) {
    const anestesiologo = cirugiaExistente.personal.find((p) => p.rol === 'Anestesiólogo')?.nombre ?? ANESTESIOLOGOS_CATALOGO[0];
    const instrumentadora = cirugiaExistente.personal.find((p) => p.rol === 'Instrumentadora')?.nombre ?? INSTRUMENTADORAS_CATALOGO[0];
    const circulante = cirugiaExistente.personal.find((p) => p.rol === 'Circulante')?.nombre ?? CIRCULANTES_CATALOGO[0];
    return {
      documento: cirugiaExistente.paciente.documento,
      nombrePaciente: cirugiaExistente.paciente.nombre,
      edad: cirugiaExistente.paciente.edad,
      sexo: cirugiaExistente.paciente.sexo,
      aseguradora: cirugiaExistente.paciente.aseguradora,
      procedimientoPrincipal: cirugiaExistente.procedimientoPrincipal,
      servicio: cirugiaExistente.servicio,
      tipoCirugia: cirugiaExistente.tipoCirugia,
      cirujano: cirugiaExistente.cirujano,
      salaId: cirugiaExistente.salaId,
      fecha: cirugiaExistente.fecha,
      horaInicio: cirugiaExistente.horaInicio,
      horaFin: cirugiaExistente.horaFin,
      anestesiologo,
      instrumentadora,
      circulante,
      equiposSeleccionados: cirugiaExistente.equipos.map((e) => e.nombre),
      canastaNombre: cirugiaExistente.canasta.nombre,
    };
  }
  const salaDefault = SALAS.find((s) => s.sedeId === sedeId)?.value ?? '';
  return {
    documento: '',
    nombrePaciente: '',
    edad: '',
    sexo: 'Femenino',
    aseguradora: '',
    procedimientoPrincipal: PROCEDIMIENTOS_CATALOGO[0],
    servicio: SERVICIOS_CATALOGO[0],
    tipoCirugia: TIPOS_CIRUGIA_CATALOGO[0],
    cirujano: CIRUJANOS_CATALOGO[0],
    salaId: salaDefault,
    fecha: fechaISO(new Date()),
    horaInicio: '07:00',
    horaFin: '09:00',
    anestesiologo: ANESTESIOLOGOS_CATALOGO[0],
    instrumentadora: INSTRUMENTADORAS_CATALOGO[0],
    circulante: CIRCULANTES_CATALOGO[0],
    equiposSeleccionados: [],
    canastaNombre: CANASTAS_CATALOGO[0].nombre,
  };
}

// Un solo componente para alta normal, alta de urgencia (prop `urgencia`) y
// edición (prop `cirugiaExistente`) -- las 3 comparten el mismo formulario,
// solo cambia el título/banner y qué función de mutación llama el padre al
// recibir `onSubmit` (ver Task 12). Campos de Paciente son texto simple
// (Documento/Nombre) en vez del buscador de paciente compartido del resto
// del proyecto: el encargo original solo pide estos 2 campos acá, no una
// búsqueda/alta completa (spec, sección "Modales").
export default function NuevaCirugiaModal({
  sedeId, urgencia = false, cirugiaExistente = null, onClose, onSubmit,
}) {
  const [form, setForm] = useState(() => formInicial(sedeId, cirugiaExistente));
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);
  const esEdicion = Boolean(cirugiaExistente);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleEquipo(nombre) {
    setForm((f) => ({
      ...f,
      equiposSeleccionados: f.equiposSeleccionados.includes(nombre)
        ? f.equiposSeleccionados.filter((n) => n !== nombre)
        : [...f.equiposSeleccionados, nombre],
    }));
  }

  const puedeEnviar = form.documento.trim() !== ''
    && form.nombrePaciente.trim() !== ''
    && form.salaId !== ''
    && form.fecha !== ''
    && form.horaInicio !== ''
    && form.horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    const canastaCatalogo = CANASTAS_CATALOGO.find((c) => c.nombre === form.canastaNombre);
    onSubmit({
      sedeId,
      salaId: form.salaId,
      paciente: {
        nombre: form.nombrePaciente,
        documento: form.documento,
        edad: form.edad === '' ? null : Number(form.edad),
        sexo: form.sexo,
        aseguradora: form.aseguradora,
      },
      procedimientoPrincipal: form.procedimientoPrincipal,
      servicio: form.servicio,
      tipoCirugia: form.tipoCirugia,
      cirujano: form.cirujano,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      procedimientos: [{
        nombre: form.procedimientoPrincipal,
        tipo: 'principal',
        duracionMin: minutosEntre(form.horaInicio, form.horaFin),
        notas: '',
      }],
      personal: [
        { rol: 'Cirujano', nombre: form.cirujano },
        { rol: 'Anestesiólogo', nombre: form.anestesiologo },
        { rol: 'Instrumentadora', nombre: form.instrumentadora },
        { rol: 'Circulante', nombre: form.circulante },
      ],
      equipos: form.equiposSeleccionados.map((nombre) => ({ nombre, estado: 'disponible' })),
      canasta: {
        nombre: form.canastaNombre,
        items: (canastaCatalogo?.items ?? []).map((i) => ({ ...i })),
      },
      farmacia: esEdicion ? cirugiaExistente.farmacia : {
        numeroPedido: 'Pendiente', estado: 'en-preparacion', fechaSolicitud: `${fechaISO(new Date())}T00:00`, medicamentos: [],
      },
      urgencia,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ncm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ncm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={urgencia ? LuTriangleAlert : LuCirclePlus}
            tone={urgencia ? 'warning' : 'primary'}
            title={esEdicion ? 'Editar cirugía' : (urgencia ? 'Nueva cirugía de urgencia' : 'Nueva cirugía')}
            titleId="ncm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            {urgencia && (
              <div className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Esta cirugía será registrada como urgencia y puede afectar la programación existente de la sala.
              </div>
            )}

            <h4 className="ncm-section-title">Paciente</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-documento">Documento / ID</label>
                <input id="ncm-documento" type="text" value={form.documento} onChange={(e) => set('documento', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-nombre">Nombre</label>
                <input id="ncm-nombre" type="text" value={form.nombrePaciente} onChange={(e) => set('nombrePaciente', e.target.value)} required />
              </div>
            </div>

            <h4 className="ncm-section-title">Procedimiento</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-procedimiento">Procedimiento</label>
                <FormSelect id="ncm-procedimiento" value={form.procedimientoPrincipal} onChange={(v) => set('procedimientoPrincipal', v)} options={toOptions(PROCEDIMIENTOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-servicio">Servicio</label>
                <FormSelect id="ncm-servicio" value={form.servicio} onChange={(v) => set('servicio', v)} options={toOptions(SERVICIOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-tipo">Tipo de cirugía</label>
                <FormSelect id="ncm-tipo" value={form.tipoCirugia} onChange={(v) => set('tipoCirugia', v)} options={toOptions(TIPOS_CIRUGIA_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-cirujano">Cirujano</label>
                <FormSelect id="ncm-cirujano" value={form.cirujano} onChange={(v) => set('cirujano', v)} options={toOptions(CIRUJANOS_CATALOGO)} />
              </div>
            </div>

            <h4 className="ncm-section-title">Programación</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-sala">Sala</label>
                <FormSelect
                  id="ncm-sala"
                  value={form.salaId}
                  onChange={(v) => set('salaId', v)}
                  options={salasDeSede.map((s) => ({ value: s.value, label: s.label }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-fecha">Fecha</label>
                <input id="ncm-fecha" type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-hora-inicio">Hora inicio</label>
                <input id="ncm-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-hora-fin">Hora fin</label>
                <input id="ncm-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>

            <h4 className="ncm-section-title">Recursos</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-anestesiologo">Anestesiólogo</label>
                <FormSelect id="ncm-anestesiologo" value={form.anestesiologo} onChange={(v) => set('anestesiologo', v)} options={toOptions(ANESTESIOLOGOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-instrumentadora">Instrumentadora</label>
                <FormSelect id="ncm-instrumentadora" value={form.instrumentadora} onChange={(v) => set('instrumentadora', v)} options={toOptions(INSTRUMENTADORAS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-circulante">Circulante</label>
                <FormSelect id="ncm-circulante" value={form.circulante} onChange={(v) => set('circulante', v)} options={toOptions(CIRCULANTES_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-canasta">Canasta de insumos</label>
                <FormSelect id="ncm-canasta" value={form.canastaNombre} onChange={(v) => set('canastaNombre', v)} options={toOptions(CANASTAS_CATALOGO.map((c) => c.nombre))} />
              </div>
              <div className="form-field full">
                <label id="ncm-equipos-label">Equipos</label>
                <div className="ncm-checklist" role="group" aria-labelledby="ncm-equipos-label">
                  {EQUIPOS_CATALOGO.map((nombre) => (
                    <label key={nombre} className="ncm-check-option">
                      <input type="checkbox" checked={form.equiposSeleccionados.includes(nombre)} onChange={() => toggleEquipo(nombre)} />
                      {nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!puedeEnviar}>
              {esEdicion ? 'Guardar cambios' : 'Crear cirugía'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
