'use client';

import { useState } from 'react';
import './NuevaUrgenciaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DuracionInput from '../../DuracionInput/DuracionInput';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import CatalogoContratosModal from '../CatalogoContratosModal/CatalogoContratosModal';
import {
  TIPOS_TERCERO_CATALOGO,
  DURACIONES_CIRUGIA_CATALOGO,
  fechaISO,
  horaLocal,
  fechaLabel,
  calcularHoraFin,
  armarCirugiaUrgencia,
  crearCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuSearch, LuTriangleAlert } from 'react-icons/lu';

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

const TIPO_TERCERO_OPTIONS = toOptions(TIPOS_TERCERO_CATALOGO);

// "Incluir Procedimientos Urgentes en la Programación" (formulario legacy de
// referencia, encargo explícito) -- flujo corto de una sola pantalla para
// "Cirugía de urgencia" (ver ProgramarCirugiaDropdown.jsx), a diferencia del
// wizard de 5 pasos "Nueva cirugía": acá no se piden procedimientos/insumos/
// equipos, se guarda de inmediato al hacer clic en "Validar" y esos datos se
// completan después abriendo el detalle de la cirugía ya creada (ver
// armarCirugiaUrgencia en mockCirugiaData.js). El paciente ya llega resuelto
// (mismo flujo de búsqueda que "Programar cirugía" -- ver
// handlePatientConfirmedParaCirugia en ProgramacionSalaCirugias.jsx, ahora
// bifurcado por intención -- ver ese archivo) -- acá solo se muestra, no es
// editable (mismo criterio que el rail de NuevaCirugiaWizard). "Finaliza" es
// de solo lectura, calculado en vivo (mismo cálculo que usa
// armarCirugiaUrgencia al guardar, ver calcularHoraFin). Fecha/hora cirugía
// precargan la fecha/hora del sistema por defecto, igual que el resto del
// formulario legacy de referencia -- salvo que este flujo se haya disparado
// desde SlotAccionesMenu (clic en una celda de AgendaSemana, ver
// ProgramacionSalaCirugias.jsx), en cuyo caso `initialFechaHora` trae la
// fecha/hora de esa celda (mismo criterio que initialFechaHora en
// NuevaCirugiaWizard.jsx). Siguen siendo editables en ambos casos: es un
// punto de partida, no un valor fijo.
export default function NuevaUrgenciaModal({
  patient, salaId, onClose, onGuardar, initialFechaHora,
}) {
  const [esAfiliado, setEsAfiliado] = useState(true);
  // Precarga la EPS del paciente ya resuelto por el buscador (`patient.eps`,
  // ver PATIENTS en legacy-nueva-cita.js) en vez de arrancar vacío -- el
  // paciente ya trae su aseguradora conocida, no tiene sentido pedirle al
  // usuario que la retipee. Sigue siendo editable (mismo criterio que
  // fechaCirugia/horaCirugia arriba): es un punto de partida, no un valor
  // fijo -- por si el procedimiento de urgencia es con otra aseguradora.
  const [idAseguradora, setIdAseguradora] = useState(() => patient?.eps ?? '');
  const [tipoTercero, setTipoTercero] = useState('');
  const [idContrato, setIdContrato] = useState('');
  const [fechaCirugia, setFechaCirugia] = useState(() => initialFechaHora?.fecha ?? fechaISO(new Date()));
  const [horaCirugia, setHoraCirugia] = useState(() => initialFechaHora?.hora ?? horaLocal(new Date()));
  const [duracionEstimada, setDuracionEstimada] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(null);

  const puedeValidar = Boolean(idAseguradora && tipoTercero && idContrato && fechaCirugia && horaCirugia && duracionEstimada);
  const finalizaLabel = duracionEstimada
    ? `${fechaLabel(fechaCirugia)} ${calcularHoraFin(horaCirugia, Number(duracionEstimada))}`
    : '';

  function handleValidar() {
    if (!puedeValidar) return;
    const nueva = crearCirugia(armarCirugiaUrgencia({
      fechaCirugia, horaCirugia, duracionEstimada, idAseguradora, tipoTercero, idContrato,
    }, patient, salaId));
    onGuardar?.(nueva);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card nug-modal-card" role="dialog" aria-modal="true" aria-labelledby="nug-title">
        <ModalHeader
          icon={LuTriangleAlert}
          tone="warning"
          title="Cirugía de urgencia"
          titleId="nug-title"
          subtitle="Incluir procedimiento urgente en la programación"
          onClose={onClose}
          closeLabel="Cerrar formulario de urgencia"
        />
        <div className="modal-body nug-body">
          <div className="nug-patient-info">
            <span className="nug-patient-name">{patient?.nombre ?? 'Paciente'}</span>
            {patient?.documento && <span className="nug-patient-doc">{patient.documento}</span>}
          </div>

          <label className="nug-checkbox">
            <input type="checkbox" checked={esAfiliado} onChange={(e) => setEsAfiliado(e.target.checked)} />
            Es afiliado
          </label>

          <div className="form-field">
            <label htmlFor="nug-id-aseguradora">Id. Aseguradora</label>
            <div className="field-with-search">
              <input
                id="nug-id-aseguradora"
                type="text"
                required
                placeholder="Ej. Sura"
                value={idAseguradora}
                onChange={(e) => setIdAseguradora(e.target.value)}
              />
              <button
                type="button"
                className="search-btn"
                onClick={() => setCatalogoAbierto('aseguradora')}
                aria-label="Buscar aseguradora"
                title="Buscar aseguradora"
              >
                <LuSearch className="icon" />
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="nug-tipo-tercero">Tipo Tercero</label>
            <FormSelect
              id="nug-tipo-tercero"
              value={tipoTercero}
              onChange={setTipoTercero}
              options={TIPO_TERCERO_OPTIONS}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="nug-id-contrato">Id. Contrato</label>
            <div className="field-with-search">
              <input
                id="nug-id-contrato"
                type="text"
                required
                placeholder="Ej. 525"
                value={idContrato}
                onChange={(e) => setIdContrato(e.target.value)}
              />
              <button
                type="button"
                className="search-btn"
                onClick={() => setCatalogoAbierto('contrato')}
                aria-label="Buscar contrato"
                title="Buscar contrato"
              >
                <LuSearch className="icon" />
              </button>
            </div>
          </div>

          <div className="nug-grid-3">
            <div className="form-field">
              <label htmlFor="nug-fecha-cirugia">Fecha cirugía</label>
              <input
                id="nug-fecha-cirugia"
                type="date"
                required
                value={fechaCirugia}
                onChange={(e) => setFechaCirugia(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="nug-hora-cirugia">Hora cirugía</label>
              <input
                id="nug-hora-cirugia"
                type="time"
                required
                value={horaCirugia}
                onChange={(e) => setHoraCirugia(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="nug-dur-estimada">Dur. estimada</label>
              <DuracionInput
                id="nug-dur-estimada"
                value={duracionEstimada}
                onChange={setDuracionEstimada}
                options={DURACIONES_CIRUGIA_CATALOGO}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <span className="nug-finaliza-label">Finaliza</span>
            <div className="tf-readonly-value">{finalizaLabel || '—'}</div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleValidar} disabled={!puedeValidar}>Validar</Button>
        </div>
      </div>

      {catalogoAbierto === 'aseguradora' && (
        <CatalogoAseguradorasModal
          onSelect={setIdAseguradora}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'contrato' && (
        <CatalogoContratosModal
          onSelect={setIdContrato}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
    </div>
  );
}
