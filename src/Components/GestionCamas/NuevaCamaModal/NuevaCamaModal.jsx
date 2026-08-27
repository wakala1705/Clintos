'use client';

import { useMemo, useState } from 'react';
import './NuevaCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import InfoTooltip from '../InfoTooltip/InfoTooltip';
import TagChipField from '../TagChipField/TagChipField';
import {
  AREAS, CARACTERISTICAS_CAMA, CLASES, ESTADOS, NIVELES, PISO_LABEL, PISOS, RESTRICCIONES_CAMA,
  SECTORES, SEDES, TIPOS,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuBedDouble, LuChevronDown } from 'react-icons/lu';

const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const AREA_OPTIONS = AREAS.filter((a) => a.value !== 'todas');
const PISO_OPTIONS = PISOS.filter((p) => p.value !== 'todos');
const SECTOR_OPTIONS = SECTORES.filter((s) => s.value !== 'todos');
const TIPO_OPTIONS = TIPOS.filter((t) => t.value !== 'todos');
// "Ocupada"/"Reservada" quedan fuera del estado inicial elegible: ambas
// necesitan datos que este formulario no captura (paciente, reserva) — ver
// "Asignar paciente"/"Reservar cama" para esos flujos, ya con su propio
// formulario dedicado. El resto de estados operativos sí puede nacer así.
const ESTADO_INICIAL_OPTIONS = ESTADOS.filter((e) => !['todos', 'ocupada', 'reservada'].includes(e.value));

// Ayuda contextual de Tipo/Clase/Nivel (rediseño, sección "5 problemas") —
// Clase/Nivel sí tienen etiquetas confirmadas en el código (CLASES/NIVELES,
// mockCamasData.js), así que su tooltip describe el eje que clasifican. Tipo
// es distinto: sus códigos crudos (01–11, CWEB.HABCAMA) no tienen
// significado clínico confirmado por ningún documento fuente (ver TIPOS en
// mockCamasData.js) — el tooltip declara ese gap en vez de inventar una
// traducción.
const TIPO_HELP = 'Código interno del sistema origen (01–11). Su significado clínico específico aún no está confirmado — se muestra tal cual el código, sin traducir.';
const CLASE_HELP = 'Población o especialidad para la que está equipada la cama (ej. pediátrica, bariátrica, cuidados intensivos).';
const NIVEL_HELP = 'Nivel de complejidad de cuidado que la cama puede prestar, según la clasificación I–III.';

function tagsIniciales(seed, seleccionadas = []) {
  return seed.map((label) => ({ label, selected: seleccionadas.includes(label) }));
}

const CAMPOS_INICIALES = {
  codigo: '',
  descripcion: '',
  numero: '',
  tipo: '',
  clase: '',
  nivel: '',
  sede: '',
  area: '',
  piso: '',
  sector: '',
  habitacion: '',
  temporal: false,
  fechaExpiracion: '',
  estadoInicial: 'libre',
  caracteristicas: tagsIniciales(CARACTERISTICAS_CAMA),
  restricciones: tagsIniciales(RESTRICCIONES_CAMA),
  observaciones: '',
};

// Mapea una cama existente (BedActionsMenu → "Editar") al shape de `campos`
// — a diferencia de CAMPOS_INICIALES, arrastra lo que la cama ya tenga
// poblado. Las 197 camas generadas por generateCamas (mockCamasData.js) no
// tienen codigo/descripcion/clase/nivel/habitacion/caracteristicas/
// restricciones/observaciones (solo las creadas desde este mismo modal sí) —
// esos campos quedan vacíos, no es un bug: es el mismo hueco de datos que ya
// documentaba ACCIONES_EN_DESARROLLO.editar en GestionCamas.jsx antes de
// este cambio.
function camposDesdeCama(cama) {
  return {
    codigo: cama.codigo ?? '',
    descripcion: cama.descripcion ?? '',
    numero: cama.numero ?? '',
    tipo: cama.tipo ?? '',
    clase: cama.clase ?? '',
    nivel: cama.nivel ?? '',
    sede: cama.sede ?? '',
    area: cama.area ?? '',
    piso: cama.piso ?? '',
    sector: cama.sector ?? '',
    habitacion: cama.habitacion ?? '',
    temporal: cama.temporal ?? false,
    fechaExpiracion: cama.fechaExpiracion ?? '',
    estadoInicial: cama.estado,
    caracteristicas: tagsIniciales(CARACTERISTICAS_CAMA, cama.caracteristicas ?? []),
    restricciones: tagsIniciales(RESTRICCIONES_CAMA, cama.restricciones ?? []),
    observaciones: cama.observaciones ?? '',
  };
}

// Formulario "Crear nueva cama" (encargo, spec sección 7) — 3 secciones
// (Identificación/Ubicación/Configuración) + 3 acciones. Reemplaza la
// versión anterior, más chica, de este mismo modal (que solo cubría
// numero/sede/area/piso/sector/tipo). `codigo`/`numero` son campos
// distintos (encargo: "Código cama" vs. "Número/identificador visible") —
// mismo criterio que el maestro admin (CamaFormModal.jsx), que separa
// código de habitación. Validaciones de frontend (encargo aparte): Código/
// Sede/Área/Piso/Sector/Habitación/Tipo obligatorios (marcados con *),
// "No duplicar identificador" (código, único en todo el inventario) y "No
// duplicar cama dentro de una habitación" (número, único solo dentro de su
// habitación — ver el porqué de la distinción en `validar()`). Piso/Sector
// pasan a obligatorios junto con Habitación (rediseño, "5 problemas" —
// antes eran opcionales con un hijo obligatorio, inconsistencia real).
export default function NuevaCamaModal({
  camasExistentes, cama, onClose, onSubmit,
}) {
  const editando = Boolean(cama);
  const [campos, setCampos] = useState(() => (editando ? camposDesdeCama(cama) : CAMPOS_INICIALES));
  // Comparar contra el resto del inventario, nunca contra sí misma — si no,
  // las validaciones de "código duplicado"/"número duplicado en la
  // habitación" (ver validar() más abajo) siempre chocarían contra la propia
  // cama que se está editando.
  const otrasCamas = useMemo(
    () => (editando ? camasExistentes.filter((c) => c.id !== cama.id) : camasExistentes),
    [camasExistentes, editando, cama],
  );
  const [errores, setErrores] = useState({});
  const [mostrarMas, setMostrarMas] = useState(false);
  const [caracAdding, setCaracAdding] = useState(false);
  const [caracDraft, setCaracDraft] = useState('');
  const [restrAdding, setRestrAdding] = useState(false);
  const [restrDraft, setRestrDraft] = useState('');

  function setCampo(key, value) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(grupo, index) {
    setCampos((prev) => ({
      ...prev,
      [grupo]: prev[grupo].map((t, i) => (i === index ? { ...t, selected: !t.selected } : t)),
    }));
  }

  function agregarTag(grupo, etiqueta) {
    const limpio = etiqueta.trim();
    if (!limpio) return;
    setCampos((prev) => ({ ...prev, [grupo]: [...prev[grupo], { label: limpio, selected: true }] }));
  }

  function validar() {
    const nuevos = {};
    const codigoNormalizado = campos.codigo.trim();
    const numeroNormalizado = campos.numero.trim();
    const habitacionNormalizada = campos.habitacion.trim();

    // Código = identificador maestro del inventario (encargo: "No duplicar
    // identificador") — único en TODAS las camas, sin importar habitación.
    if (!codigoNormalizado) nuevos.codigo = 'El código de cama es obligatorio.';
    else if (otrasCamas.some((c) => c.codigo && c.codigo.toLowerCase() === codigoNormalizado.toLowerCase())) {
      nuevos.codigo = 'Ya existe una cama con este código.';
    }

    if (!campos.sede) nuevos.sede = 'Selecciona una sede.';
    if (!campos.area) nuevos.area = 'Selecciona un área.';
    if (!campos.piso) nuevos.piso = 'Selecciona un piso.';
    if (!campos.sector) nuevos.sector = 'Selecciona un sector.';
    if (!campos.tipo) nuevos.tipo = 'Selecciona un tipo.';
    if (!habitacionNormalizada) nuevos.habitacion = 'La habitación es obligatoria.';

    if (!numeroNormalizado) {
      nuevos.numero = 'El número/identificador visible es obligatorio.';
    } else if (habitacionNormalizada && otrasCamas.some((c) => (
      (c.habitacion ?? '').toLowerCase() === habitacionNormalizada.toLowerCase()
        && c.numero.toLowerCase() === numeroNormalizado.toLowerCase()
    ))) {
      // Único DENTRO de su habitación (encargo: "No duplicar cama dentro
      // de una habitación") — a diferencia de `codigo` (arriba), `numero`
      // es la etiqueta visible dentro de ese cuarto (ej. "Cama A"/"Cama
      // B") y sí puede repetirse en otra habitación sin ambigüedad para
      // el personal — por eso el chequeo compara solo contra camas de la
      // MISMA habitación, no contra todo el inventario.
      nuevos.numero = 'Ya existe una cama con este número en esta habitación.';
    }

    // Estado inicial válido (encargo) — defensivo: el FormSelect solo deja
    // elegir entre ESTADO_INICIAL_OPTIONS, así que esto nunca debería
    // disparar desde la UI, pero cierra el caso igual que el resto de
    // reglas de la spec. No aplica en modo edición: esa sección queda oculta
    // (el estado se gestiona con Cambiar estado/Asignar paciente/etc.) y
    // Ocupada/Reservada — válidos en una cama existente — ni siquiera están
    // en ESTADO_INICIAL_OPTIONS.
    if (!editando && !ESTADO_INICIAL_OPTIONS.some((e) => e.value === campos.estadoInicial)) {
      nuevos.estadoInicial = 'Estado inicial no válido.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function construirPayload() {
    const caracteristicasSeleccionadas = campos.caracteristicas.filter((t) => t.selected).map((t) => t.label);
    const restriccionesSeleccionadas = campos.restricciones.filter((t) => t.selected).map((t) => t.label);
    return {
      codigo: campos.codigo.trim(),
      descripcion: campos.descripcion.trim() || undefined,
      numero: campos.numero.trim(),
      tipo: campos.tipo,
      clase: campos.clase || undefined,
      nivel: campos.nivel || undefined,
      sede: campos.sede,
      area: campos.area,
      piso: campos.piso,
      sector: campos.sector,
      habitacion: campos.habitacion.trim(),
      temporal: campos.temporal,
      // Solo tiene sentido junto a `temporal` — si el usuario tildó y
      // destildó el checkbox, no se arrastra una fecha "fantasma" de una
      // cama que ya no se está marcando como temporal.
      fechaExpiracion: (campos.temporal && campos.fechaExpiracion) || undefined,
      // En edición no se toca el estado operativo (sección oculta, ver
      // arriba) — el payload no lleva `estadoInicial` para que el handler de
      // edición en GestionCamas.jsx nunca lo confunda con un cambio de
      // estado real.
      ...(editando ? {} : { estadoInicial: campos.estadoInicial }),
      caracteristicas: caracteristicasSeleccionadas.length ? caracteristicasSeleccionadas : undefined,
      restricciones: restriccionesSeleccionadas.length ? restriccionesSeleccionadas : undefined,
      observaciones: campos.observaciones.trim() || undefined,
    };
  }

  function handleGuardar(e) {
    e.preventDefault();
    if (!validar()) return;
    onSubmit(construirPayload(), { keepOpen: false });
  }

  // A diferencia de "Guardar" (cierra el modal), esta acción deja el modal
  // abierto y solo resetea Identificación/Habitación — Sede/Área/Piso/
  // Sector/Tipo/Clase/Nivel/Configuración quedan como estaban, para cargar
  // varias camas seguidas del mismo lote sin repetir la ubicación en cada
  // una (encargo: "Guardar y crear otra", sin más detalle sobre qué
  // conserva — este es el criterio más útil para carga en lote).
  function handleGuardarYCrearOtra() {
    if (!validar()) return;
    onSubmit(construirPayload(), { keepOpen: true });
    setCampos((prev) => ({
      ...prev, codigo: '', descripcion: '', numero: '', habitacion: '',
    }));
    setErrores({});
  }

  const habitacionPlaceholder = campos.piso ? `Ej. H-101 · ${PISO_LABEL[campos.piso]}` : 'Ej. H-101';

  return (
    <div className="modal-overlay open">
      <div className="modal-card cb-form-modal-card" role="dialog" aria-modal="true" aria-labelledby="cb-form-title">
        <form onSubmit={handleGuardar} noValidate>
          <ModalHeader
            icon={LuBedDouble}
            tone="primary"
            title={editando ? 'Editar cama' : 'Nueva cama'}
            titleId="cb-form-title"
            onClose={onClose}
          />
          <div className="modal-body cb-form-body">
            <div className="cb-form-section">
              <div className="fp-section-title">Identificación</div>

              <div className="cb-form-row">
                <div className="form-field">
                  <label htmlFor="cb-form-codigo">Código cama<span className="cb-required-mark">*</span></label>
                  <input
                    id="cb-form-codigo"
                    type="text"
                    required
                    placeholder="Ej. C-101"
                    value={campos.codigo}
                    onChange={(e) => setCampo('codigo', e.target.value)}
                  />
                  {errores.codigo && <span className="cb-form-error">{errores.codigo}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="cb-form-numero">Número/identificador visible<span className="cb-required-mark">*</span></label>
                  <input
                    id="cb-form-numero"
                    type="text"
                    required
                    placeholder="Ej. 101-A"
                    value={campos.numero}
                    onChange={(e) => setCampo('numero', e.target.value)}
                  />
                  {errores.numero && <span className="cb-form-error">{errores.numero}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="cb-form-descripcion">Descripción</label>
                <input
                  id="cb-form-descripcion"
                  type="text"
                  placeholder="Ej. Cama eléctrica con baranda de seguridad"
                  value={campos.descripcion}
                  onChange={(e) => setCampo('descripcion', e.target.value)}
                />
              </div>

              <div className="cb-form-row">
                <div className="form-field">
                  <div className="cb-form-label-row">
                    <label htmlFor="cb-form-tipo">Tipo<span className="cb-required-mark">*</span></label>
                    <InfoTooltip texto={TIPO_HELP} />
                  </div>
                  <FormSelect
                    id="cb-form-tipo"
                    value={campos.tipo}
                    onChange={(v) => setCampo('tipo', v)}
                    placeholder="Selecciona un tipo"
                    options={TIPO_OPTIONS}
                    required
                  />
                  {errores.tipo && <span className="cb-form-error">{errores.tipo}</span>}
                </div>
                <div className="form-field">
                  <div className="cb-form-label-row">
                    <label htmlFor="cb-form-clase">Clase</label>
                    <InfoTooltip texto={CLASE_HELP} />
                  </div>
                  <FormSelect
                    id="cb-form-clase"
                    value={campos.clase}
                    onChange={(v) => setCampo('clase', v)}
                    placeholder="Selecciona una clase"
                    options={CLASES}
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="cb-form-label-row">
                  <label htmlFor="cb-form-nivel">Nivel</label>
                  <InfoTooltip texto={NIVEL_HELP} />
                </div>
                <FormSelect
                  id="cb-form-nivel"
                  value={campos.nivel}
                  onChange={(v) => setCampo('nivel', v)}
                  placeholder="Selecciona un nivel"
                  options={NIVELES}
                />
              </div>
            </div>

            <div className="cb-form-section">
              <div className="fp-section-title">Ubicación</div>

              <div className="cb-form-row">
                <div className="form-field">
                  <label htmlFor="cb-form-sede">Sede<span className="cb-required-mark">*</span></label>
                  <FormSelect
                    id="cb-form-sede"
                    value={campos.sede}
                    onChange={(v) => setCampo('sede', v)}
                    placeholder="Selecciona una sede"
                    options={SEDE_OPTIONS}
                    required
                  />
                  {errores.sede && <span className="cb-form-error">{errores.sede}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="cb-form-area">Área<span className="cb-required-mark">*</span></label>
                  <FormSelect
                    id="cb-form-area"
                    value={campos.area}
                    onChange={(v) => setCampo('area', v)}
                    placeholder="Selecciona un área"
                    options={AREA_OPTIONS}
                    required
                  />
                  {errores.area && <span className="cb-form-error">{errores.area}</span>}
                </div>
              </div>

              <div className="cb-form-row">
                <div className="form-field">
                  <label htmlFor="cb-form-piso">Piso<span className="cb-required-mark">*</span></label>
                  <FormSelect
                    id="cb-form-piso"
                    value={campos.piso}
                    onChange={(v) => setCampo('piso', v)}
                    placeholder="Selecciona un piso"
                    options={PISO_OPTIONS}
                    required
                  />
                  {errores.piso && <span className="cb-form-error">{errores.piso}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="cb-form-sector">Sector<span className="cb-required-mark">*</span></label>
                  <FormSelect
                    id="cb-form-sector"
                    value={campos.sector}
                    onChange={(v) => setCampo('sector', v)}
                    placeholder="Selecciona un sector"
                    options={SECTOR_OPTIONS}
                    required
                  />
                  {errores.sector && <span className="cb-form-error">{errores.sector}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="cb-form-habitacion">Habitación<span className="cb-required-mark">*</span></label>
                <input
                  id="cb-form-habitacion"
                  type="text"
                  required
                  placeholder={habitacionPlaceholder}
                  value={campos.habitacion}
                  onChange={(e) => setCampo('habitacion', e.target.value)}
                />
                {errores.habitacion && <span className="cb-form-error">{errores.habitacion}</span>}
              </div>
            </div>

            <div className="cb-form-section">
              <div className="fp-section-title">Configuración</div>

              <div>
                <label className="cb-form-checkbox" htmlFor="cb-form-temporal">
                  <input
                    id="cb-form-temporal"
                    type="checkbox"
                    checked={campos.temporal}
                    onChange={(e) => setCampo('temporal', e.target.checked)}
                  />
                  <span>Cama temporal</span>
                </label>
                <div className="cb-form-help">
                  Cama agregada de forma temporal (ej. refuerzo por sobrecupo). Se marca como &quot;Temporal&quot; en el Mapa de camas y en Auditoría.
                </div>

                {campos.temporal && (
                  <div className="cb-temporal-panel">
                    <div className="form-field">
                      <label htmlFor="cb-form-fecha-exp">
                        Fecha de expiración <span className="cb-optional-mark">(opcional)</span>
                      </label>
                      <input
                        id="cb-form-fecha-exp"
                        type="date"
                        value={campos.fechaExpiracion}
                        onChange={(e) => setCampo('fechaExpiracion', e.target.value)}
                      />
                    </div>
                    <div className="cb-form-help cb-form-help-flush">
                      Si se define, el sistema muestra una alerta cuando la fecha se cumple. La cama no cambia de estado automáticamente al vencer.
                    </div>
                  </div>
                )}
              </div>

              {/* Oculta en modo edición: el estado operativo de una cama
                  existente se gestiona con los flujos dedicados (Cambiar
                  estado/Asignar paciente/Reservar/...), no desde acá — y
                  Ocupada/Reservada, válidos en una cama existente, ni
                  siquiera están en ESTADO_INICIAL_OPTIONS. */}
              {!editando && (
                <div className="form-field">
                  <label id="cb-estado-inicial-label">Estado inicial</label>
                  <div className="cb-estado-grid" role="radiogroup" aria-labelledby="cb-estado-inicial-label">
                    {ESTADO_INICIAL_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`cb-estado-pill${campos.estadoInicial === opt.value ? ' selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="cb-form-estado-inicial"
                          value={opt.value}
                          checked={campos.estadoInicial === opt.value}
                          onChange={() => setCampo('estadoInicial', opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {errores.estadoInicial && <span className="cb-form-error">{errores.estadoInicial}</span>}
                </div>
              )}

              <button
                type="button"
                className="cb-mas-toggle"
                onClick={() => setMostrarMas((v) => !v)}
                aria-expanded={mostrarMas}
              >
                <span>{mostrarMas ? 'Mostrar menos' : 'Mostrar más'}</span>
                <LuChevronDown className={`icon${mostrarMas ? ' open' : ''}`} aria-hidden="true" />
              </button>

              {mostrarMas && (
                <div className="cb-mas-section">
                  <TagChipField
                    label="Características"
                    tags={campos.caracteristicas}
                    onToggle={(i) => toggleTag('caracteristicas', i)}
                    adding={caracAdding}
                    draft={caracDraft}
                    onDraftChange={setCaracDraft}
                    onAddOpen={() => setCaracAdding(true)}
                    onAddConfirm={() => {
                      agregarTag('caracteristicas', caracDraft);
                      setCaracDraft('');
                      setCaracAdding(false);
                    }}
                    onAddCancel={() => {
                      setCaracAdding(false);
                      setCaracDraft('');
                    }}
                  />

                  <TagChipField
                    label="Restricciones"
                    tags={campos.restricciones}
                    onToggle={(i) => toggleTag('restricciones', i)}
                    adding={restrAdding}
                    draft={restrDraft}
                    onDraftChange={setRestrDraft}
                    onAddOpen={() => setRestrAdding(true)}
                    onAddConfirm={() => {
                      agregarTag('restricciones', restrDraft);
                      setRestrDraft('');
                      setRestrAdding(false);
                    }}
                    onAddCancel={() => {
                      setRestrAdding(false);
                      setRestrDraft('');
                    }}
                  />

                  <div className="form-field">
                    <label htmlFor="cb-form-observaciones">Observaciones</label>
                    <textarea
                      id="cb-form-observaciones"
                      rows="2"
                      placeholder="Notas adicionales..."
                      value={campos.observaciones}
                      onChange={(e) => setCampo('observaciones', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            {/* "Guardar y crear otra" no aplica editando una cama existente
                — solo tiene sentido para carga en lote al crear. */}
            {!editando && (
              <button type="button" className="btn btn-secondary" onClick={handleGuardarYCrearOtra}>Guardar y crear otra</button>
            )}
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
