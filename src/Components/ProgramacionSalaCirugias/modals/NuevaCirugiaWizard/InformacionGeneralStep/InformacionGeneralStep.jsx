'use client';

import { useState } from 'react';
import './InformacionGeneralStep.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoDiagnosticosModal from '../../CatalogoDiagnosticosModal/CatalogoDiagnosticosModal';
import {
  ASA_CATALOGO,
  CLASE_CIRUGIA_CATALOGO,
  COMPLEJIDAD_CATALOGO,
  DURACIONES_CIRUGIA_CATALOGO,
  TIPOS_ANESTESIA_CATALOGO,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuSearch } from 'react-icons/lu';

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

const CLASE_OPTIONS = toOptions(CLASE_CIRUGIA_CATALOGO);
const TIPO_ANESTESIA_OPTIONS = toOptions(TIPOS_ANESTESIA_CATALOGO);
const COMPLEJIDAD_OPTIONS = toOptions(COMPLEJIDAD_CATALOGO);
const ASA_OPTIONS = toOptions(ASA_CATALOGO);
const DURACION_OPTIONS = DURACIONES_CIRUGIA_CATALOGO.map((min) => ({ value: String(min), label: `${min} min` }));

// Paso 1 del wizard "Nueva cirugía" -- mismos campos que el formulario de
// referencia "Programación de Cirugías" del sistema legacy (encargo
// explícito), reagrupados en dos bloques (datos de la cirugía / datos de
// admisión-contratación) igual que esa referencia separa ambos con un
// subtítulo. Teléfonos Aviso/Id. Aseguradora llegan precargados desde el
// paciente elegido en la Lista de Pacientes (ver datosIniciales en
// NuevaCirugiaWizard.jsx) -- acá quedan editables por si el dato del
// paciente está desactualizado.
//
// Sala/No. cirugía ya no viven en este paso (encargo explícito): se
// muestran como texto plano en el riel izquierdo, debajo del divider bajo
// "Es afiliado" -- ver NuevaCirugiaWizard.jsx. "Id. afiliado" tampoco vive
// acá (era redundante con el documento que ya muestra el header del riel).
//
// Reserva habitación/Se vence autorización aplican progressive disclosure
// (encargo explícito): Días cama/Fecha y hora vence ni se montan si el
// checkbox está destildado, en vez de mostrarse deshabilitados -- evita
// exponer controles sin sentido hasta que el usuario optó por necesitarlos.
//
// Dx. ingreso/Id. aseguradora llevan un botón de búsqueda (encargo
// explícito). Dx. ingreso ya abre CatalogoDiagnosticosModal (encargo
// explícito, captura de referencia) -- estado local propio de este step
// (no en NuevaCirugiaWizard/onBuscar) porque el resultado solo necesita
// escribir en `datos.dxIngreso` vía el `onChange` que este step ya recibe,
// sin tener que hacer viajar la selección hacia arriba y de vuelta. Id.
// aseguradora sigue en `onBuscar` (solo toast) -- su ventana real todavía
// no está definida (encargo: "más adelante te muestro cuales son las
// ventanas").
//
// Todos los campos son obligatorios (encargo explícito) salvo Observaciones
// -- `required` en cada input/textarea/FormSelect activa el resaltado ámbar
// "obligatorio y vacío" ya definido para el proyecto (ver la regla en
// shared/shared.css y en FormSelect.css), sin agregar un asterisco aparte
// ni bloquear el guardado (mismo criterio que el resto de features que usan
// este patrón, ej. NuevaCitaFlow.css). Los inputs de texto/tel/número llevan
// además un `placeholder` -- el resaltado usa :placeholder-shown, que solo
// dispara si el input tiene ese atributo (confirmado con Playwright: sin
// placeholder, :placeholder-shown nunca matchea aunque el input esté vacío
// y sea required). type="date"/"time"/"datetime-local" no soportan
// :placeholder-shown en absoluto (tampoco con placeholder seteado) -- mismo
// límite que ya tiene el resto del proyecto (ver "dat-fecha" en
// ConsultaStep.jsx, required sin resaltado ámbar), así que esos 4 campos
// quedan solo con `required` semántico, sin ámbar visible.
export default function InformacionGeneralStep({
  datos, onChange, onBuscar,
}) {
  const [catalogoDxAbierto, setCatalogoDxAbierto] = useState(false);

  return (
    <div className="igs-step">
      <h4 className="igs-section-title">Datos de la cirugía</h4>
      <div className="igs-grid">
        <div className="form-field">
          <label htmlFor="igs-fecha-inicio">Fecha inicio</label>
          <input
            id="igs-fecha-inicio"
            type="datetime-local"
            required
            value={datos.fechaInicio}
            onChange={(e) => onChange('fechaInicio', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-telefonos-aviso">Teléfonos aviso</label>
          <input
            id="igs-telefonos-aviso"
            type="tel"
            required
            placeholder="Ej. 310 842 9173"
            value={datos.telefonosAviso}
            onChange={(e) => onChange('telefonosAviso', e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="igs-fecha-solicitud">Fecha solicitud</label>
          <input
            id="igs-fecha-solicitud"
            type="date"
            required
            value={datos.fechaSolicitud}
            onChange={(e) => onChange('fechaSolicitud', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-hora-solicitud">Hora solicitud</label>
          <input
            id="igs-hora-solicitud"
            type="time"
            required
            value={datos.horaSolicitud}
            onChange={(e) => onChange('horaSolicitud', e.target.value)}
          />
        </div>

      </div>

      <div className="igs-grid igs-grid-3">
        <div className="form-field">
          <label htmlFor="igs-dur-estimada">Dur. estimada</label>
          <FormSelect
            id="igs-dur-estimada"
            value={datos.duracionEstimada}
            onChange={(v) => onChange('duracionEstimada', v)}
            options={DURACION_OPTIONS}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-dur-postquirurgica">Dur. postquirúrgica</label>
          <FormSelect
            id="igs-dur-postquirurgica"
            value={datos.duracionPostquirurgica}
            onChange={(v) => onChange('duracionPostquirurgica', v)}
            options={DURACION_OPTIONS}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-dur-recuperacion">Dur. recuperación</label>
          <FormSelect
            id="igs-dur-recuperacion"
            value={datos.duracionRecuperacion}
            onChange={(v) => onChange('duracionRecuperacion', v)}
            options={DURACION_OPTIONS}
            required
          />
        </div>
      </div>

      <h4 className="igs-section-title">Datos de admisión y contratación</h4>
      <div className="igs-grid">
        <div className="form-field full">
          <label htmlFor="igs-dx-ingreso">Dx. ingreso</label>
          <div className="igs-field-with-search">
            <input
              id="igs-dx-ingreso"
              type="text"
              required
              placeholder="Ej. Apendicitis aguda"
              value={datos.dxIngreso}
              onChange={(e) => onChange('dxIngreso', e.target.value)}
            />
            <button
              type="button"
              className="igs-search-btn"
              onClick={() => setCatalogoDxAbierto(true)}
              aria-label="Buscar diagnóstico de ingreso"
              title="Buscar diagnóstico de ingreso"
            >
              <LuSearch className="icon" />
            </button>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="igs-clase">Clase</label>
          <FormSelect id="igs-clase" value={datos.clase} onChange={(v) => onChange('clase', v)} options={CLASE_OPTIONS} required />
        </div>
        <div className="form-field">
          <label htmlFor="igs-id-aseguradora">Id. aseguradora</label>
          <div className="igs-field-with-search">
            <input
              id="igs-id-aseguradora"
              type="text"
              required
              placeholder="Ej. Sura"
              value={datos.idAseguradora}
              onChange={(e) => onChange('idAseguradora', e.target.value)}
            />
            <button
              type="button"
              className="igs-search-btn"
              onClick={() => onBuscar('idAseguradora')}
              aria-label="Buscar aseguradora"
              title="Buscar aseguradora"
            >
              <LuSearch className="icon" />
            </button>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="igs-tipo-anestesia">Tipo anestesia</label>
          <FormSelect
            id="igs-tipo-anestesia"
            value={datos.tipoAnestesia}
            onChange={(v) => onChange('tipoAnestesia', v)}
            options={TIPO_ANESTESIA_OPTIONS}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-complejidad">Complejidad</label>
          <FormSelect
            id="igs-complejidad"
            value={datos.complejidad}
            onChange={(v) => onChange('complejidad', v)}
            options={COMPLEJIDAD_OPTIONS}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="igs-no-autorizacion">No. autorización</label>
          <input
            id="igs-no-autorizacion"
            type="text"
            required
            placeholder="Ej. AUT-2026-00456"
            value={datos.noAutorizacion}
            onChange={(e) => onChange('noAutorizacion', e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="igs-asa">Asa</label>
          <FormSelect id="igs-asa" value={datos.asa} onChange={(v) => onChange('asa', v)} options={ASA_OPTIONS} required />
        </div>

        <div className="form-field full">
          <label htmlFor="igs-quien-autoriza">Quién autoriza</label>
          <input
            id="igs-quien-autoriza"
            type="text"
            required
            placeholder="Nombre de quien autoriza"
            value={datos.quienAutoriza}
            onChange={(e) => onChange('quienAutoriza', e.target.value)}
          />
        </div>

        <div className="form-field full">
          <label className="igs-checkbox">
            <input
              type="checkbox"
              checked={datos.reservaHabitacion}
              onChange={(e) => onChange('reservaHabitacion', e.target.checked)}
            />
            Reserva habitación
          </label>
        </div>
        {datos.reservaHabitacion && (
          <div className="form-field">
            <label htmlFor="igs-dias-cama">Días cama</label>
            <input
              id="igs-dias-cama"
              type="number"
              min="0"
              required
              placeholder="0"
              value={datos.diasCama}
              onChange={(e) => onChange('diasCama', e.target.value)}
            />
          </div>
        )}

        <div className="form-field full">
          <label className="igs-checkbox">
            <input
              type="checkbox"
              checked={datos.seVenceAutorizacion}
              onChange={(e) => onChange('seVenceAutorizacion', e.target.checked)}
            />
            Se vence autorización
          </label>
        </div>
        {datos.seVenceAutorizacion && (
          <>
            <div className="form-field">
              <label htmlFor="igs-fecha-vence">Fecha vence</label>
              <input
                id="igs-fecha-vence"
                type="date"
                required
                value={datos.fechaVence}
                onChange={(e) => onChange('fechaVence', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="igs-hora-vence">Hora vence</label>
              <input
                id="igs-hora-vence"
                type="time"
                required
                value={datos.horaVence}
                onChange={(e) => onChange('horaVence', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-field full">
          <label htmlFor="igs-observaciones">Observaciones</label>
          <textarea
            id="igs-observaciones"
            value={datos.observaciones}
            onChange={(e) => onChange('observaciones', e.target.value)}
          />
        </div>
      </div>

      {catalogoDxAbierto && (
        <CatalogoDiagnosticosModal
          onSelect={(v) => onChange('dxIngreso', v)}
          onClose={() => setCatalogoDxAbierto(false)}
        />
      )}
    </div>
  );
}
