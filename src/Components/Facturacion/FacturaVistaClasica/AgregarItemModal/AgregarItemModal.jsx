'use client';

import { useEffect, useState } from 'react';
import './AgregarItemModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CurrencyInput from '@/Components/CurrencyInput/CurrencyInput';
import CatalogoContratacionModal from '../CatalogoContratacionModal/CatalogoContratacionModal';
import CatalogoItemsModal from '../CatalogoItemsModal/CatalogoItemsModal';
import { PREFIJO_OPTIONS } from '@/hooks/Facturacion/mockFacturasData';
import { LuPlus, LuEye, LuCalculator } from 'react-icons/lu';

// Mismo dominio que MODO_FACTURACION_OPTIONS de FacturaAgregarModalClasico
// (encargo explícito, ver imagen de referencia: "Contratación" como
// ejemplo) -- se repite acá en vez de importarla porque son dos conceptos
// distintos (Modo Facturación de la factura completa vs. Tipo Financiero de
// un ítem puntual) que hoy comparten valores por coincidencia, no por
// definición.
const TIPO_FINANCIERO_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'contratacion', label: 'Contratación' },
  { value: 'union-temporal', label: 'Unión Temporal' },
];

// Sin catálogo real de centros de costo/áreas funcionales en el proyecto
// todavía (a diferencia de "Código", que sí reusa ITEMS_CATALOGO vía
// CatalogoItemsModal) -- listado chico fijo como FormSelect en vez de un
// picker con su propio modal, mismo criterio que TIPO_CONTRATO_OPTIONS.
const CENTRO_COSTO_OPTIONS = [
  { value: '01', label: '01 — Consulta Externa T1' },
  { value: '02', label: '02 — Hospitalización' },
  { value: '03', label: '03 — Urgencias' },
  { value: '04', label: '04 — Cirugía' },
];

const AREA_FUNCIONAL_OPTIONS = [
  { value: 'asistencial', label: 'Asistencial' },
  { value: 'administrativa', label: 'Administrativa' },
  { value: 'apoyo-diagnostico', label: 'Apoyo Diagnóstico' },
];

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildInitialForm() {
  return {
    tipoFinanciero: 'contratacion',
    centroCosto: CENTRO_COSTO_OPTIONS[0].value,
    areaFuncional: '',
    prefijo: '',
    noContrato: '',
    idContrato: '0',
    codigo: '',
    descripcion: '',
    cantidad: '1',
    vlrItem: '0.00',
    porcentajeIva: '0.00',
    vrCopagos: '0.00',
    valorModeradora: '0.00',
    vrPagoCompartido: '0.00',
    observaciones: '',
  };
}

// Réplica del formulario legacy "Agrega Item Factura" (encargo explícito,
// ver imagen de referencia) -- paso 2 "Ítems y servicios" de
// FacturaAgregarModalClasico, un ítem a la vez (se monta/desmonta por cada
// apertura, mismo criterio que los Catalogo*Modal de esta feature).
// `numeroFactura`/`consecutivo` son de solo lectura (mismo dato que ya
// muestra `.fam-panel-heading-consecutivo` del padre): el número de factura
// viene del padre
// (placeholder de próximo consecutivo bajo Agregar, el número real bajo
// Editar) y el consecutivo del ítem es `items.length + 1` calculado por el
// padre al abrir este modal. "Código" reusa CatalogoItemsModal
// (ITEMS_CATALOGO) y precarga "Descripción" de un solo click; "No
// Contrato"/"ID" reusan el mismo CatalogoContratacionModal que ya usa el
// padre para sus propios campos homónimos (se ignora el `tipoContrato` que
// devuelve, acá no aplica). "Valor IVA" (Vlr Item × %IVA) y "Valor Total"
// (Vlr Item + IVA + Copagos + Moderadora + P.Compartido) se calculan en
// vivo, nunca se tipean -- mismo criterio que "Total factura" del padre.
// Solo pinta el front (mismo criterio que el resto de la feature): "Aceptar"
// arma el objeto y se lo devuelve al padre vía `onSave`, que decide qué
// hacer con él (agregarlo a `items` y recalcular los totales del paso 1).
export default function AgregarItemModal({
  numeroFactura, consecutivo, onSave, onClose,
}) {
  const [form, setForm] = useState(buildInitialForm);
  const [catalogoContratacionAbierto, setCatalogoContratacionAbierto] = useState(false);
  const [catalogoItemsAbierto, setCatalogoItemsAbierto] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function setField(key) {
    return (value) => setForm((f) => ({ ...f, [key]: value }));
  }

  const valorIva = toNumber(form.vlrItem) * (toNumber(form.porcentajeIva) / 100);
  const valorTotal = toNumber(form.vlrItem) + valorIva + toNumber(form.vrCopagos)
    + toNumber(form.valorModeradora) + toNumber(form.vrPagoCompartido);

  function handleAceptar() {
    onSave({
      id: `item-${Date.now()}`,
      ...form,
      valorIva,
      valorTotal,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal aim-modal" role="dialog" aria-modal="true" aria-labelledby="aim-title">
        <ModalHeader
          icon={LuPlus}
          title="Agregar ítem"
          titleId="aim-title"
          subtitle={`Factura ${numeroFactura}`}
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="aim-grid">
            <div className="form-field">
              <label htmlFor="aim-consecutivo">Consecutivo</label>
              <input id="aim-consecutivo" type="text" value={consecutivo} readOnly />
            </div>
            <div className="form-field">
              <label htmlFor="aim-tipo-financiero">Tipo Financiero</label>
              <FormSelect
                id="aim-tipo-financiero"
                value={form.tipoFinanciero}
                onChange={setField('tipoFinanciero')}
                options={TIPO_FINANCIERO_OPTIONS}
              />
            </div>

            <div className="form-field aim-span-2">
              <label htmlFor="aim-centro-costo">Centro Costo</label>
              <FormSelect
                id="aim-centro-costo"
                value={form.centroCosto}
                onChange={setField('centroCosto')}
                options={CENTRO_COSTO_OPTIONS}
              />
            </div>

            <div className="form-field">
              <label htmlFor="aim-area-funcional">Área Funcional</label>
              <FormSelect
                id="aim-area-funcional"
                value={form.areaFuncional}
                onChange={setField('areaFuncional')}
                options={AREA_FUNCIONAL_OPTIONS}
                placeholder="Selecciona una opción"
              />
            </div>
            <div className="form-field">
              <label htmlFor="aim-prefijo">Prefijo</label>
              <FormSelect
                id="aim-prefijo"
                value={form.prefijo}
                onChange={setField('prefijo')}
                options={PREFIJO_OPTIONS}
                placeholder="Selecciona una opción"
              />
            </div>

            <div className="form-field">
              <label htmlFor="aim-no-contrato">No Contrato</label>
              <div className="field-with-search">
                <input
                  id="aim-no-contrato"
                  type="text"
                  value={form.noContrato}
                  onChange={(e) => setField('noContrato')(e.target.value)}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoContratacionAbierto(true)}
                  aria-label="Buscar contrato"
                  title="Buscar contrato"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="aim-id-contrato">ID</label>
              <input
                id="aim-id-contrato"
                type="number"
                value={form.idContrato}
                onChange={(e) => setField('idContrato')(e.target.value)}
              />
            </div>

            <div className="form-field aim-span-2">
              <label htmlFor="aim-codigo">Código<span className="aim-required-mark">*</span></label>
              <div className="field-with-search">
                <input
                  id="aim-codigo"
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setField('codigo')(e.target.value)}
                  required
                  placeholder="Ej. MX0000360PBS"
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setCatalogoItemsAbierto(true)}
                  aria-label="Buscar ítem en el catálogo"
                  title="Buscar ítem en el catálogo"
                >
                  <LuEye className="icon" />
                </button>
              </div>
            </div>

            <div className="form-field aim-span-2">
              <label htmlFor="aim-descripcion">Descripción</label>
              <textarea
                id="aim-descripcion"
                value={form.descripcion}
                onChange={(e) => setField('descripcion')(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="aim-cantidad">Cantidad<span className="aim-required-mark">*</span></label>
              <input
                id="aim-cantidad"
                type="number"
                min="1"
                step="1"
                value={form.cantidad}
                onChange={(e) => setField('cantidad')(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="aim-vlr-item">Vlr Item<span className="aim-required-mark">*</span></label>
              <CurrencyInput
                id="aim-vlr-item"
                value={form.vlrItem}
                onChange={setField('vlrItem')}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="aim-porcentaje-iva">Porcentaje IVA</label>
              <input
                id="aim-porcentaje-iva"
                type="number"
                step="0.01"
                value={form.porcentajeIva}
                onChange={(e) => setField('porcentajeIva')(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="aim-valor-iva">Valor IVA</label>
              <input
                id="aim-valor-iva"
                type="text"
                value={valorIva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="aim-copagos">Vr. Copagos</label>
              <CurrencyInput id="aim-copagos" value={form.vrCopagos} onChange={setField('vrCopagos')} />
            </div>
            <div className="form-field">
              <label htmlFor="aim-moderadora">Valor Moderadora</label>
              <CurrencyInput id="aim-moderadora" value={form.valorModeradora} onChange={setField('valorModeradora')} />
            </div>

            <div className="form-field aim-span-2">
              <label htmlFor="aim-pago-compartido">Vr. P. Compartido</label>
              <CurrencyInput id="aim-pago-compartido" value={form.vrPagoCompartido} onChange={setField('vrPagoCompartido')} />
            </div>

            <div className="aim-span-2">
              <div className="fam-total-box">
                <span className="fam-total-icon"><LuCalculator className="icon" aria-hidden="true" /></span>
                <span className="fam-total-copy">
                  <span className="fam-total-label">Valor Total</span>
                  <span className="fam-total-value">
                    {valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </span>
              </div>
            </div>

            <div className="form-field aim-span-2">
              <label htmlFor="aim-observaciones">Observaciones</label>
              <textarea
                id="aim-observaciones"
                value={form.observaciones}
                onChange={(e) => setField('observaciones')(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleAceptar} disabled={!form.codigo || toNumber(form.cantidad) <= 0}>Aceptar</Button>
        </div>
      </div>

      {catalogoContratacionAbierto && (
        <CatalogoContratacionModal
          idTercero=""
          tipoTercero=""
          fecha=""
          onSelect={({ noContrato, idContrato }) => setForm((f) => ({ ...f, noContrato, idContrato }))}
          onClose={() => setCatalogoContratacionAbierto(false)}
        />
      )}

      {catalogoItemsAbierto && (
        <CatalogoItemsModal
          onSelect={({ referencia, descripcion }) => setForm((f) => ({ ...f, codigo: referencia, descripcion }))}
          onClose={() => setCatalogoItemsAbierto(false)}
        />
      )}
    </div>
  );
}
