'use client';

import { useEffect, useState } from 'react';
import './FacturaEditarModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import {
  LuFilePenLine, LuEye, LuCheck, LuTrash2, LuTriangleAlert,
} from 'react-icons/lu';

const CLASE_COMPROMISO_OPTIONS = [
  { value: 'evento', label: 'Evento' },
  { value: 'capitacion', label: 'Capitación' },
  { value: 'pgp', label: 'PGP' },
];

const CONCEPTO_OPTIONS = [
  { value: 'factura-venta', label: 'Factura de Venta' },
];

// "Tipo Tercero" del formulario legacy -- no existe como campo propio en el
// mock (ver mockFacturasData.js), se deriva de `clase` (mismo criterio que
// CLASE_LABEL/TIPO_LABEL en FacturaDetalleModalClasico.jsx).
const TIPO_TERCERO_POR_CLASE = { salud: 'EPSS', particular: 'Particular' };

function buildInitialForm(factura) {
  return {
    claseCompromiso: '',
    idTercero: factura.terceroId,
    cuentaContable: '',
    fechaVencimiento: factura.fechaVencimiento,
    fechaFactura: factura.fecha,
    valorCopago: '0.00',
    vlrPagoCompartido: '0.00',
    valorAbonos: '0.00',
    valorTotal: String(factura.valorTotal),
    servPrestadosA: '',
    concepto: '',
  };
}

function setField(setForm, key) {
  return (value) => setForm((f) => ({ ...f, [key]: value }));
}

// Modal disparado por el botón "Editar" (ícono lápiz, columna Acciones) de
// FacturasGridClasica -- réplica de los campos del formulario legacy
// "Cambiando un Registro" (encargo explícito, ver imagen de referencia),
// con el chrome homologado del proyecto (ModalHeader/FormSelect, ver
// AGENTS.md "Modales"/"Selects de formulario") en vez de la barra de título
// azul/fondo celeste del original -- mismo criterio que FacturasGridClasica,
// que replica la TABLA legacy pero no su chrome de ventana. A diferencia de
// FacturaDetalleModalClasico (siempre montado, `factura` null = oculto), acá
// el padre solo monta este componente cuando hay una factura en edición
// (mismo criterio que CambiarEstadoModal/GestionCamas.jsx) -- necesario para
// que `useState(buildInitialForm(factura))` arranque de cero en cada
// apertura sin un efecto de reseteo. Solo pinta el front (ver
// mockFacturasData.js): "Guardar" sigue sin persistir en un backend real,
// pero ahora valida Fecha Vencimiento >= Fecha Factura y muestra un aviso
// "Guardado (simulado)" antes de cerrar (mismo criterio que
// FacturaAgregarModalClasico, ver validate/handleGuardar más abajo). Cerrar
// con cambios sin guardar pide confirmación primero (ver attemptClose/
// fvc-discard-modal, clases compartidas con el modal de Agregar en
// shared.css).
export default function FacturaEditarModalClasico({ factura, onClose }) {
  const [form, setForm] = useState(() => buildInitialForm(factura));
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // Mismo criterio que FacturaAgregarModalClasico: useState (no useRef) para
  // poder leer el snapshot inicial durante el render sin violar
  // react-hooks/refs.
  const [initialForm] = useState(form);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  function attemptClose() {
    if (saving) return;
    if (isDirty) setConfirmingClose(true);
    else onClose();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') attemptClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  function handleChangeFecha(key) {
    return (value) => {
      setField(setForm, key)(value);
      setErrors((er) => (er.fechaVencimiento ? { ...er, fechaVencimiento: undefined } : er));
    };
  }

  function validate() {
    const errs = {};
    if (form.fechaFactura && form.fechaVencimiento && form.fechaVencimiento < form.fechaFactura) {
      errs.fechaVencimiento = 'No puede ser anterior a la Fecha Factura.';
    }
    return errs;
  }

  function handleGuardar() {
    if (saving) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    setTimeout(onClose, 1100);
  }

  const tipoTercero = TIPO_TERCERO_POR_CLASE[factura.clase] ?? '—';

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) attemptClose(); }}>
      <div className="modal fem-modal" role="dialog" aria-modal="true" aria-labelledby="fem-title">
        <ModalHeader
          icon={LuFilePenLine}
          title="Cambiando un registro"
          titleId="fem-title"
          subtitle={`Factura ${factura.numero}`}
          onClose={attemptClose}
        />

        <div className="modal-body">
          {saving && (
            <div className="fvc-save-toast" role="status" aria-live="polite">
              <LuCheck className="icon" aria-hidden="true" />
              Cambios guardados (simulado) — no persiste todavía en el servidor.
            </div>
          )}

          <div className="fem-readonly-row">
            <span className="fem-readonly-item"><span className="fem-readonly-label">Consecutivo:</span> {factura.noAdmision}</span>
            <span className="fem-readonly-item"><span className="fem-readonly-label">Compañía:</span> {factura.sedeCodigo}</span>
          </div>

          <div className="fem-grid">
            <div className="form-field">
              <label htmlFor="fem-clase-compromiso">Clase de Compromiso<span className="fem-required-mark">*</span></label>
              <FormSelect
                id="fem-clase-compromiso"
                value={form.claseCompromiso}
                onChange={setField(setForm, 'claseCompromiso')}
                options={CLASE_COMPROMISO_OPTIONS}
                placeholder="Selecciona una opción"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="fem-tipo-tercero">Tipo Tercero</label>
              <input id="fem-tipo-tercero" type="text" value={tipoTercero} readOnly />
            </div>

            <div className="form-field">
              <label htmlFor="fem-id-tercero">Id. Tercero</label>
              <div className="field-with-search">
                <input
                  id="fem-id-tercero"
                  type="text"
                  value={form.idTercero}
                  onChange={(e) => setField(setForm, 'idTercero')(e.target.value)}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoAbierto(true)}
                  aria-label="Buscar tercero"
                  title="Buscar tercero"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="fem-cuenta-contable">Cuenta Contable<span className="fem-required-mark">*</span></label>
              <input
                id="fem-cuenta-contable"
                type="text"
                value={form.cuentaContable}
                onChange={(e) => setField(setForm, 'cuentaContable')(e.target.value)}
                required
                placeholder="Ej. 130504"
              />
            </div>

            <div className={`form-field${errors.fechaVencimiento ? ' has-error' : ''}`}>
              <label htmlFor="fem-fecha-vencimiento">Fecha Vencimiento<span className="fem-required-mark">*</span></label>
              <input
                id="fem-fecha-vencimiento"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => handleChangeFecha('fechaVencimiento')(e.target.value)}
                required
                aria-invalid={!!errors.fechaVencimiento}
              />
              {errors.fechaVencimiento && <span className="form-field-error">{errors.fechaVencimiento}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="fem-fecha-factura">Fecha Factura<span className="fem-required-mark">*</span></label>
              <input
                id="fem-fecha-factura"
                type="date"
                value={form.fechaFactura}
                onChange={(e) => handleChangeFecha('fechaFactura')(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="fem-valor-copago">Valor Copago</label>
              <input
                id="fem-valor-copago"
                type="number"
                step="0.01"
                value={form.valorCopago}
                onChange={(e) => setField(setForm, 'valorCopago')(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fem-pago-compartido">Vlr. Pago Compartido</label>
              <input
                id="fem-pago-compartido"
                type="number"
                step="0.01"
                value={form.vlrPagoCompartido}
                onChange={(e) => setField(setForm, 'vlrPagoCompartido')(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="fem-valor-abonos">Valor Abonos</label>
              <input
                id="fem-valor-abonos"
                type="number"
                step="0.01"
                value={form.valorAbonos}
                onChange={(e) => setField(setForm, 'valorAbonos')(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fem-valor-total">Valor Total</label>
              <input id="fem-valor-total" type="number" step="0.01" value={form.valorTotal} readOnly />
            </div>

            <div className="form-field fem-span-2">
              <label htmlFor="fem-serv-prestados">Serv. Prestados A</label>
              <textarea
                id="fem-serv-prestados"
                value={form.servPrestadosA}
                onChange={(e) => setField(setForm, 'servPrestadosA')(e.target.value)}
              />
            </div>

            <div className="form-field fem-span-2">
              <label htmlFor="fem-concepto">Concepto</label>
              <FormSelect
                id="fem-concepto"
                value={form.concepto}
                onChange={setField(setForm, 'concepto')}
                options={CONCEPTO_OPTIONS}
                placeholder="Concepto"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={attemptClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>Guardar</Button>
        </div>
      </div>

      {catalogoAbierto && (
        <CatalogoAseguradorasModal
          onSelect={setField(setForm, 'idTercero')}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}

      {confirmingClose && (
        <div className="modal-overlay" role="presentation">
          <div className="fvc-discard-modal" role="alertdialog" aria-modal="true" aria-labelledby="fem-discard-title" aria-describedby="fem-discard-desc">
            <div className="fvc-discard-icon"><LuTriangleAlert className="icon" aria-hidden="true" /></div>
            <h3 id="fem-discard-title">¿Descartar los cambios?</h3>
            <p id="fem-discard-desc">Vas a perder la información que ingresaste en este formulario. Esta acción no se puede deshacer.</p>
            <div className="fvc-discard-actions">
              <Button variant="secondary" onClick={() => setConfirmingClose(false)}>Seguir editando</Button>
              <Button variant="danger-outline" icon={LuTrash2} onClick={onClose}>Sí, descartar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
