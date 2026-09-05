'use client';

import { useState } from 'react';
import './AgregarProcedimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoMedicosModal from '../../../CatalogoMedicosModal/CatalogoMedicosModal';
import CatalogoProcedimientosModal from '../../../CatalogoProcedimientosModal/CatalogoProcedimientosModal';
import {
  TIPOS_PROCEDIMIENTO_CATALOGO, siguienteNumeroProgramacion,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuSearch } from 'react-icons/lu';

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

const TIPO_PROCEDIMIENTO_OPTIONS = toOptions(TIPOS_PROCEDIMIENTO_CATALOGO);

// "Adicionar procedimientos QX" -- ventana del paso "Procedimientos" del
// wizard "Nueva cirugía" (ver ProcedimientosStep.jsx), calcada del
// formulario de referencia del sistema legacy (encargo explícito, "CXPSD")
// pero adaptada al design system del proyecto en vez de copiada 1:1: Id.
// Cirugía/Id. Cirujano/Id. Anestesiólogo usan el mismo patrón de input con
// lupa integrada adentro que Dx. ingreso/Id. aseguradora en
// InformacionGeneralStep (.field-with-search en shared.css) -- la
// referencia mostraba un botón cuadrado aparte + texto describiendo el
// catálogo, que es justamente el patrón viejo que este proyecto ya
// reemplazó ahí; no tiene sentido reintroducirlo acá. Id. Cirugía abre
// CatalogoProcedimientosModal (catálogo grande); Cirujano/Anestesiólogo
// comparten CatalogoMedicosModal (mismo modal, filtrado por `tipo` --
// encargo explícito, "debe ser un modal que soporte varios en la tabla").
//
// Datos del paciente + No. Programación: un solo bloque con fondo
// (.apm-patient-info) al inicio del cuerpo del modal (encargo explícito) --
// ya no en el subtítulo del ModalHeader. Nombre/documento del paciente en
// columna a la izquierda, No. Programación al extremo derecho (encargo
// explícito). No. Programación es un consecutivo real
// (siguienteNumeroProgramacion, encargo explícito: "pon un número real"),
// generado una vez al montar el modal -- ya no un texto de ejemplo.
// Id. Cirujano/Id. Anestesiólogo van en grilla de 2 (.apm-grid-2, encargo
// explícito: ganar alto vertical) en vez de apilados a ancho completo.
export default function AgregarProcedimientoModal({
  patient, onAdd, onClose,
}) {
  const [numeroProgramacion] = useState(() => siguienteNumeroProgramacion());
  const [idCirugia, setIdCirugia] = useState('');
  const [tipoCirugia, setTipoCirugia] = useState('');
  const [idCirujano, setIdCirujano] = useState('');
  const [idAnestesiologo, setIdAnestesiologo] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(null);

  const puedeAceptar = idCirugia && tipoCirugia && idCirujano && idAnestesiologo;

  function handleAceptar() {
    if (!puedeAceptar) return;
    onAdd({
      idCirugia, tipoCirugia, idCirujano, idAnestesiologo,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card apm-modal-card" role="dialog" aria-modal="true" aria-labelledby="apm-title">
        <ModalHeader
          title="Adicionar procedimientos QX"
          titleId="apm-title"
          onClose={onClose}
          closeLabel="Cerrar formulario de procedimiento"
        />
        <div className="modal-body apm-body">
          <div className="apm-patient-info">
            {patient?.nombre && (
              <div className="apm-patient">
                <span className="apm-patient-name">{patient.nombre}</span>
                {patient.documento && <span className="apm-patient-doc">{patient.documento}</span>}
              </div>
            )}
            <div className="form-field apm-programacion-field">
              <span className="apm-label">No. Programación</span>
              <span className="apm-value">{numeroProgramacion.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="apm-id-cirugia">Id. Cirugía</label>
            <div className="field-with-search">
              <input
                id="apm-id-cirugia"
                type="text"
                required
                placeholder="Ej. Colecistectomía laparoscópica"
                value={idCirugia}
                onChange={(e) => setIdCirugia(e.target.value)}
              />
              <button
                type="button"
                className="search-btn"
                onClick={() => setCatalogoAbierto('procedimiento')}
                aria-label="Buscar procedimiento quirúrgico"
                title="Buscar procedimiento quirúrgico"
              >
                <LuSearch className="icon" />
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="apm-tipo-cirugia">Tipo Cirugía</label>
            <FormSelect
              id="apm-tipo-cirugia"
              value={tipoCirugia}
              onChange={setTipoCirugia}
              options={TIPO_PROCEDIMIENTO_OPTIONS}
              required
            />
          </div>

          <div className="apm-divider" />
          <h4 className="apm-section-title">Profesionales para el procedimiento</h4>

          <div className="apm-grid-2">
            <div className="form-field">
              <label htmlFor="apm-id-cirujano">Id. Cirujano</label>
              <div className="field-with-search">
                <input
                  id="apm-id-cirujano"
                  type="text"
                  required
                  placeholder="Ej. Dr. Juan García"
                  value={idCirujano}
                  onChange={(e) => setIdCirujano(e.target.value)}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoAbierto('cirujano')}
                  aria-label="Buscar cirujano"
                  title="Buscar cirujano"
                >
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="apm-id-anestesiologo">Id. Anestesiólogo</label>
              <div className="field-with-search">
                <input
                  id="apm-id-anestesiologo"
                  type="text"
                  required
                  placeholder="Ej. Dra. Ana López"
                  value={idAnestesiologo}
                  onChange={(e) => setIdAnestesiologo(e.target.value)}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoAbierto('anestesiologo')}
                  aria-label="Buscar anestesiólogo"
                  title="Buscar anestesiólogo"
                >
                  <LuSearch className="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleAceptar} disabled={!puedeAceptar}>Aceptar</Button>
        </div>
      </div>

      {catalogoAbierto === 'procedimiento' && (
        <CatalogoProcedimientosModal
          onSelect={setIdCirugia}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'cirujano' && (
        <CatalogoMedicosModal
          tipo="Cirujano"
          onSelect={setIdCirujano}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
      {catalogoAbierto === 'anestesiologo' && (
        <CatalogoMedicosModal
          tipo="Anestesiólogo"
          onSelect={setIdAnestesiologo}
          onClose={() => setCatalogoAbierto(null)}
        />
      )}
    </div>
  );
}
