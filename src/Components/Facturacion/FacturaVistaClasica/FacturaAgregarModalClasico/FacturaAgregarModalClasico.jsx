'use client';

import { useEffect, useState } from 'react';
import './FacturaAgregarModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import CatalogoTipoTerceroModal from '../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal';
import CatalogoContratacionModal from '../CatalogoContratacionModal/CatalogoContratacionModal';
import AdmisionPickerModal from '../AdmisionPickerModal/AdmisionPickerModal';
import { LuFilePlus2, LuEye } from 'react-icons/lu';

const TIPO_FACTURA_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'copago', label: 'Copago' },
  { value: 'moderadora', label: 'Moderadora' },
  { value: 'pago-compartido', label: 'Pago Compartido' },
];

// Tipos de factura que restringen el formulario a un único valor a cargar
// (ver RESTRICTED_TIPOS/isRestricted más abajo) -- encargo explícito, ver
// imágenes de referencia.
const RESTRICTED_TIPOS = ['copago', 'moderadora', 'pago-compartido'];

const ORIGEN_OPTIONS = [
  { value: 'admisiones', label: 'Admisiones' },
  { value: 'manual', label: 'Manual' },
];

const MODO_FACTURACION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'contratacion', label: 'Contratación' },
  { value: 'union-temporal', label: 'Unión Temporal' },
];

const TIPO_CONTRATO_OPTIONS = [
  { value: 'evento', label: 'Evento' },
  { value: 'capita', label: 'Capita' },
  { value: 'pgp', label: 'PGP' },
];

// Por defecto Pesos -- ver buildInitialForm más abajo.
const MONEDA_OPTIONS = [
  { value: 'pesos', label: 'Pesos' },
  { value: 'dolar', label: 'Dólar' },
];

// Mismo valor que muestra el .fam-readonly-row de arriba (placeholder hasta
// que haya lógica real de numeración) -- No. de Factura arranca precargado
// con el consecutivo, como en la imagen de referencia.
const PROXIMO_CONSECUTIVO = '0200289592';

function buildInitialForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    tipoFactura: 'normal',
    origen: 'admisiones',
    noReferencia: '',
    noFactura: PROXIMO_CONSECUTIVO,
    fechaFactura: today,
    fechaVencimiento: today,
    idTercero: '',
    regimen: '',
    modoFacturacion: 'contratacion',
    tipoContrato: '',
    noContrato: '',
    idContrato: '0',
    administradora: '',
    valorServicios: '0.00',
    valorCopago: '0.00',
    valorPagoCompartido: '0.00',
    valorModeradora: '0.00',
    descuento: '0.00',
    moneda: 'pesos',
    concepto: '',
  };
}

function setField(setForm, key) {
  return (value) => setForm((f) => ({ ...f, [key]: value }));
}

// Modal disparado por el botón "Nueva factura" del header de Facturacion.jsx
// -- réplica de los campos del formulario legacy "Agregando un Registro"
// (encargo explícito, ver imagen de referencia), hermano de
// FacturaEditarModalClasico ("Cambiando un Registro"): mismo chrome
// homologado del proyecto (ModalHeader/FormSelect, ver AGENTS.md "Modales"/
// "Selects de formulario") en vez de la barra de título azul/fondo celeste
// del original, mismo criterio de agrupar campos en un grid de 2 columnas
// por afinidad de dominio en vez de replicar la posición exacta de la imagen
// (esa ya no aplicaba 1:1 con el chrome homologado).
//
// Solo pinta el front (encargo explícito: "creá la modal... y luego le
// damos lógica"): "Guardar" no persiste nada todavía, solo cierra -- mismo
// patrón que FacturaEditarModalClasico. Id Tercero y Administradora reusan
// el mismo CatalogoAseguradorasModal (ya existe, mismo componente que usa
// FacturaEditarModalClasico -- encargo explícito: "administradora... me
// debería abrir el mismo modal de id terceros", cada uno con su propio
// estado de apertura para no compartir instancia), Régimen reusa
// ../CatalogoTipoTerceroModal/CatalogoTipoTerceroModal, No Contrato reusa
// ../CatalogoContratacionModal/CatalogoContratacionModal y No. Referencia
// reusa ../AdmisionPickerModal/AdmisionPickerModal (los 3 nuevos, ver esos
// archivos) -- este último trae el dataset mock de /admisiones adentro del
// modal en vez de navegar a esa ruta, para no perder el formulario en curso.
//
// "Origen" (par de Tipo Factura, encargo explícito) no tiene equivalente en
// el mock de facturas todavía -- placeholder hasta que haya lógica real
// (mismo criterio que Compañía/Consecutivo). Ver isRestricted más abajo
// para la lógica de Copago/Moderadora/Pago Compartido.
//
// No recibe `factura` -- a diferencia de Editar, es un registro nuevo desde
// cero. Compañía/Consecutivo quedan como texto fijo (placeholder hasta que
// haya lógica real de numeración), mismo criterio que
// FacturaEditarModalClasico.fem-readonly-row.
export default function FacturaAgregarModalClasico({ onClose }) {
  const [form, setForm] = useState(buildInitialForm);
  const [catalogoTerceroAbierto, setCatalogoTerceroAbierto] = useState(false);
  const [catalogoRegimenAbierto, setCatalogoRegimenAbierto] = useState(false);
  const [catalogoContratacionAbierto, setCatalogoContratacionAbierto] = useState(false);
  const [catalogoAdministradoraAbierto, setCatalogoAdministradoraAbierto] = useState(false);
  const [admisionPickerAbierto, setAdmisionPickerAbierto] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Copago/Moderadora/Pago Compartido son tipos de factura "de un solo
  // valor" (encargo explícito, ver imágenes de referencia): autoseleccionan
  // Modo Facturación en "Manual" (queda seleccionable igual, no se
  // deshabilita -- encargo explícito) y deshabilitan No Contrato/Tipo
  // Contrato/Descuento/ID/Valor Servicios/Valor Copago + los "Valor X" que
  // no correspondan al tipo elegido (Valor Moderadora/Valor Pago Comp. son
  // los únicos que se habilitan según el tipo activo -- Valor Copago queda
  // deshabilitado siempre, incluso eligiendo "Copago", encargo explícito).
  // Fecha Factura/Fecha Vencimiento/No. Referencia/Id Tercero/Régimen/
  // Administradora/Moneda/Concepto nunca se restringen (encargo explícito:
  // fechas quedan siempre habilitadas). "Normal" no restringe nada.
  const isRestricted = RESTRICTED_TIPOS.includes(form.tipoFactura);

  function handleChangeTipoFactura(value) {
    setForm((f) => ({
      ...f,
      tipoFactura: value,
      modoFacturacion: RESTRICTED_TIPOS.includes(value) ? 'manual' : f.modoFacturacion,
    }));
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal fam-modal" role="dialog" aria-modal="true" aria-labelledby="fam-title">
        <ModalHeader
          icon={LuFilePlus2}
          title="Agregando un registro"
          titleId="fam-title"
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="fam-readonly-row">
            <span className="fam-readonly-item"><span className="fam-readonly-label">Compañía:</span> 02</span>
            <span className="fam-readonly-item"><span className="fam-readonly-label">Consecutivo:</span> {PROXIMO_CONSECUTIVO}</span>
          </div>

          <div className="fam-grid">
            <div className="form-field">
              <label htmlFor="fam-tipo-factura">Tipo Factura</label>
              <FormSelect
                id="fam-tipo-factura"
                value={form.tipoFactura}
                onChange={handleChangeTipoFactura}
                options={TIPO_FACTURA_OPTIONS}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-origen">Origen</label>
              <FormSelect
                id="fam-origen"
                value={form.origen}
                onChange={setField(setForm, 'origen')}
                options={ORIGEN_OPTIONS}
              />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-no-factura">No. de Factura</label>
              <input id="fam-no-factura" type="text" value={form.noFactura} readOnly />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-no-referencia">No. Referencia<span className="fam-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="fam-no-referencia"
                  type="text"
                  value={form.noReferencia}
                  onChange={(e) => setField(setForm, 'noReferencia')(e.target.value)}
                  required
                  placeholder="Ej. 0000277489"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setAdmisionPickerAbierto(true)}
                  aria-label="Buscar admisión de referencia"
                  title="Buscar admisión de referencia"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="fam-fecha-factura">Fecha Factura<span className="fam-required-mark">*</span></label>
              <input
                id="fam-fecha-factura"
                type="date"
                value={form.fechaFactura}
                onChange={(e) => setField(setForm, 'fechaFactura')(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-fecha-vencimiento">Fecha Vencimiento<span className="fam-required-mark">*</span></label>
              <input
                id="fam-fecha-vencimiento"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setField(setForm, 'fechaVencimiento')(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="fam-id-tercero">Id Tercero<span className="fam-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="fam-id-tercero"
                  type="text"
                  value={form.idTercero}
                  onChange={(e) => setField(setForm, 'idTercero')(e.target.value)}
                  required
                  placeholder="Ej. Coosalud EPS-S"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoTerceroAbierto(true)}
                  aria-label="Buscar tercero"
                  title="Buscar tercero"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="fam-regimen">Régimen<span className="fam-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="fam-regimen"
                  type="text"
                  value={form.regimen}
                  onChange={(e) => setField(setForm, 'regimen')(e.target.value)}
                  required
                  placeholder="Ej. Contributivo"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoRegimenAbierto(true)}
                  aria-label="Buscar régimen"
                  title="Buscar régimen"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="fam-modo-facturacion">Modo Facturación</label>
              <FormSelect
                id="fam-modo-facturacion"
                value={form.modoFacturacion}
                onChange={setField(setForm, 'modoFacturacion')}
                options={MODO_FACTURACION_OPTIONS}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-no-contrato">No Contrato</label>
              <div className="field-with-search">
                <input
                  id="fam-no-contrato"
                  type="text"
                  value={form.noContrato}
                  onChange={(e) => setField(setForm, 'noContrato')(e.target.value)}
                  disabled={isRestricted}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoContratacionAbierto(true)}
                  aria-label="Buscar contrato"
                  title="Buscar contrato"
                  disabled={isRestricted}
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="fam-id-contrato">ID<span className="fam-required-mark">*</span></label>
              <input
                id="fam-id-contrato"
                type="number"
                value={form.idContrato}
                onChange={(e) => setField(setForm, 'idContrato')(e.target.value)}
                required
                disabled={isRestricted}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-tipo-contrato">Tipo Contrato</label>
              <FormSelect
                id="fam-tipo-contrato"
                value={form.tipoContrato}
                onChange={setField(setForm, 'tipoContrato')}
                options={TIPO_CONTRATO_OPTIONS}
                placeholder="Selecciona una opción"
                disabled={isRestricted}
              />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-administradora">Administradora<span className="fam-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="fam-administradora"
                  type="text"
                  value={form.administradora}
                  onChange={(e) => setField(setForm, 'administradora')(e.target.value)}
                  required
                  placeholder="Ej. Clintos"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoAdministradoraAbierto(true)}
                  aria-label="Buscar administradora"
                  title="Buscar administradora"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="fam-valor-servicios">Valor Servicios<span className="fam-required-mark">*</span></label>
              <input
                id="fam-valor-servicios"
                type="number"
                step="0.01"
                value={form.valorServicios}
                onChange={(e) => setField(setForm, 'valorServicios')(e.target.value)}
                required
                disabled={isRestricted}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-valor-copago">Valor Copago<span className="fam-required-mark">*</span></label>
              <input
                id="fam-valor-copago"
                type="number"
                step="0.01"
                value={form.valorCopago}
                onChange={(e) => setField(setForm, 'valorCopago')(e.target.value)}
                required
                disabled={isRestricted}
              />
            </div>

            <div className="form-field">
              <label htmlFor="fam-pago-compartido">Valor Pago Comp.<span className="fam-required-mark">*</span></label>
              <input
                id="fam-pago-compartido"
                type="number"
                step="0.01"
                value={form.valorPagoCompartido}
                onChange={(e) => setField(setForm, 'valorPagoCompartido')(e.target.value)}
                required
                disabled={isRestricted && form.tipoFactura !== 'pago-compartido'}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fam-valor-moderadora">Valor Moderadora<span className="fam-required-mark">*</span></label>
              <input
                id="fam-valor-moderadora"
                type="number"
                step="0.01"
                value={form.valorModeradora}
                onChange={(e) => setField(setForm, 'valorModeradora')(e.target.value)}
                required
                disabled={isRestricted && form.tipoFactura !== 'moderadora'}
              />
            </div>

            <div className="form-field">
              <label htmlFor="fam-descuento">Descuento<span className="fam-required-mark">*</span></label>
              <input
                id="fam-descuento"
                type="number"
                step="0.01"
                value={form.descuento}
                onChange={(e) => setField(setForm, 'descuento')(e.target.value)}
                required
                disabled={isRestricted}
              />
            </div>
            <div className="form-field">
              {/* Suma de Servicios + Copago + Pago Comp. + Moderadora - Descuento,
                  a calcular cuando se cablee la lógica real -- por ahora solo
                  muestra el placeholder readonly del formulario legacy. */}
              <label htmlFor="fam-valor-factura">Valor Factura</label>
              <input id="fam-valor-factura" type="number" step="0.01" value="0.00" readOnly />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-moneda">Moneda<span className="fam-required-mark">*</span></label>
              <FormSelect
                id="fam-moneda"
                value={form.moneda}
                onChange={setField(setForm, 'moneda')}
                options={MONEDA_OPTIONS}
                required
              />
            </div>

            <div className="form-field fam-span-2">
              <label htmlFor="fam-concepto">Concepto<span className="fam-required-mark">*</span></label>
              <textarea
                id="fam-concepto"
                value={form.concepto}
                onChange={(e) => setField(setForm, 'concepto')(e.target.value)}
                required
                placeholder="Descripción del concepto de facturación"
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onClose}>Guardar</Button>
        </div>
      </div>

      {catalogoTerceroAbierto && (
        <CatalogoAseguradorasModal
          selectField="razonSocial"
          onSelect={setField(setForm, 'idTercero')}
          onClose={() => setCatalogoTerceroAbierto(false)}
        />
      )}

      {catalogoRegimenAbierto && (
        <CatalogoTipoTerceroModal
          onSelect={setField(setForm, 'regimen')}
          onClose={() => setCatalogoRegimenAbierto(false)}
        />
      )}

      {catalogoContratacionAbierto && (
        <CatalogoContratacionModal
          idTercero={form.idTercero}
          tipoTercero={form.regimen}
          fecha={form.fechaFactura}
          onSelect={({ noContrato, idContrato, tipoContrato }) => setForm((f) => ({
            ...f, noContrato, idContrato, tipoContrato,
          }))}
          onClose={() => setCatalogoContratacionAbierto(false)}
        />
      )}

      {catalogoAdministradoraAbierto && (
        <CatalogoAseguradorasModal
          selectField="razonSocial"
          onSelect={setField(setForm, 'administradora')}
          onClose={() => setCatalogoAdministradoraAbierto(false)}
        />
      )}

      {admisionPickerAbierto && (
        <AdmisionPickerModal
          onSelect={setField(setForm, 'noReferencia')}
          onClose={() => setAdmisionPickerAbierto(false)}
        />
      )}
    </div>
  );
}
