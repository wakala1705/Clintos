'use client';

import { useEffect, useState } from 'react';
import './AgregarItemModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CurrencyInput from '@/Components/CurrencyInput/CurrencyInput';
import CatalogoAreaFuncionalModal from '../CatalogoAreaFuncionalModal/CatalogoAreaFuncionalModal';
import CatalogoPrefijoModal from '../CatalogoPrefijoModal/CatalogoPrefijoModal';
import CatalogoCentroCostoModal from '../CatalogoCentroCostoModal/CatalogoCentroCostoModal';
import CatalogoContratacionModal from '../CatalogoContratacionModal/CatalogoContratacionModal';
import CatalogoServiciosAreaModal from '../CatalogoServiciosAreaModal/CatalogoServiciosAreaModal';
import {
  LuPlus, LuPencil, LuEye, LuCalculator, LuMapPin,
} from 'react-icons/lu';

// Mismo dominio que MODO_FACTURACION_OPTIONS de FacturaAgregarModalClasico
// (encargo explícito, ver imagen de referencia: "Contratación" como
// ejemplo) -- se repite acá en vez de importarla porque son dos conceptos
// distintos (Modo Facturación de la factura completa vs. Tipo Financiero de
// un ítem puntual) que hoy comparten valores por coincidencia, no por
// definición. Sin "Unión Temporal" (encargo explícito): a diferencia de
// MODO_FACTURACION_OPTIONS del padre, acá ese valor no aplica.
const TIPO_FINANCIERO_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'contratacion', label: 'Contratación' },
];

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// `item` (opcional) es la fila elegida vía "Editar" en la grilla de ítems
// del padre (encargo explícito: acciones rápidas "Editar"/"Borrar" por
// fila) -- si viene, precarga el form con sus valores en vez de los
// defaults de "Agregar" (ver AgregarItemModal más abajo); `valorIva`/
// `valorTotal` no se copian porque son calculados en vivo acá mismo, no
// datos propios del form. Sin `item`, `modoFacturacion` (el valor elegido en
// el bloque 3 "Información contractual" del paso 1 del padre, encargo
// explícito: "el campo de modo facturación... debe persistir al momento de
// agregar un ítem en el campo de tipo financiero") es solo el valor inicial
// de "Tipo Financiero" -- sigue editable a mano después por ítem. Cae a
// 'contratacion' (el default de siempre) si el valor no existe en
// TIPO_FINANCIERO_OPTIONS -- caso de "Unión Temporal", que no tiene
// equivalente acá (ver comentario de TIPO_FINANCIERO_OPTIONS).
function buildInitialForm(modoFacturacion, item) {
  if (item) {
    return {
      tipoFinanciero: item.tipoFinanciero,
      centroCosto: item.centroCosto,
      areaFuncional: item.areaFuncional,
      prefijo: item.prefijo,
      noContrato: item.noContrato,
      idContrato: item.idContrato,
      codigo: item.codigo,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      vlrItem: item.vlrItem,
      porcentajeIva: item.porcentajeIva,
      vrCopagos: item.vrCopagos,
      valorModeradora: item.valorModeradora,
      vrPagoCompartido: item.vrPagoCompartido,
      observaciones: item.observaciones,
    };
  }
  return {
    tipoFinanciero: TIPO_FINANCIERO_OPTIONS.some((o) => o.value === modoFacturacion)
      ? modoFacturacion
      : 'contratacion',
    centroCosto: '',
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
// apertura, mismo criterio que los Catalogo*Modal de esta feature). También
// cubre "Editar" (encargo explícito: acciones rápidas "Editar"/"Borrar" por
// fila en la grilla de ítems) -- pasarle `item` (la fila elegida) precarga
// el form con sus valores (ver buildInitialForm arriba) y cambia ícono/
// título del header a "Editar ítem"; "Aceptar" conserva su `id` original en
// vez de generar uno nuevo (ver handleAceptar más abajo), así el padre
// reemplaza la fila en vez de agregar una duplicada.
// `numeroFactura` es de solo lectura, mostrado como subtítulo del
// `ModalHeader` (encargo explícito: se borró `.aim-info-bar`, la barra de
// contexto que antes vivía bajo el header con No. Factura/Consecutivo/Tipo
// Factura -- viene del padre, placeholder de próximo consecutivo bajo
// Agregar, número real bajo Editar). "Tipo Financiero" (el FormSelect
// editable de la sección 1) es un campo distinto del propio ítem, ver el
// comentario de TIPO_FINANCIERO_OPTIONS arriba -- pero arranca precargado
// con "Modo Facturación" del paso 1 vía la prop `modoFacturacion` (encargo
// explícito: "el campo de modo facturación... debe persistir al momento de
// agregar un ítem en el campo de tipo financiero", ver buildInitialForm
// arriba). Es solo el valor inicial de cada ítem nuevo: sigue siendo
// editable a mano por ítem después, y no se sincroniza en vivo si el
// usuario cambia Modo Facturación mientras este modal ya está abierto
// (nunca puede pasar hoy: el modal es imperativo, se monta recién al abrir
// "Agregar ítem", ver comentario del componente arriba de este archivo).
// "No Contrato"/"Código" son
// buscadores que solo aparecen bajo Tipo Financiero "Contratación" (encargo
// explícito, ver isTipoFinancieroContratacion más abajo) -- "No Contrato"
// reusa CatalogoContratacionModal (se ignora `tipoContrato` que devuelve, acá
// no aplica), "Código" abre CatalogoServiciosAreaModal (encargo explícito,
// ver imagen de referencia "SERVICIOS CONTRATADOS POR AREA...", reemplaza al
// CatalogoItemsModal que tenía antes). "Descripción" (que
// CatalogoServiciosAreaModal también precarga junto con "Código") ya no
// tiene un input propio en este modal, pero sigue guardándose en `form` --
// alimenta la columna "Descripción" de la grilla de ítems del padre aunque
// acá no se vea ni se edite a mano.
// "Área Funcional"/"Centro Costo"/"Prefijo" son buscadores
// (`field-with-search`, encargo explícito: reemplazar el FormSelect por el
// mismo patrón que "No Contrato"/"Código") que abren
// CatalogoAreaFuncionalModal/CatalogoCentroCostoModal/CatalogoPrefijoModal.
// "Área Funcional"/"Centro Costo"/"Prefijo" traen catálogo real con
// búsqueda de texto libre (encargo explícito, ver imágenes de referencia
// "Tabla de AFU"/"Seleccionar Centro de Costo (CEN)"/prefijos) -- mismo
// patrón que CatalogoAseguradorasModal (buscador + tabla), sin paginación
// porque cada catálogo entero cabe en un solo scroll. Los 3 son
// feature-scoped bajo FacturaVistaClasica (no app-wide, ver AGENTS.md
// "Component organization"): se promueven a `src/Components/` recién el
// día que una pantalla fuera de Facturación los necesite, mismo criterio
// ya aplicado a CatalogoAseguradorasModal.
// "Valor IVA" (Vlr Item × %IVA) y "Valor Total" (Vlr Item + IVA + Copagos +
// Moderadora + P.Compartido) se calculan en vivo, nunca se tipean -- mismo
// criterio que "Total factura" del padre. Solo pinta el front (mismo
// criterio que el resto de la feature): "Aceptar" arma el objeto y se lo
// devuelve al padre vía `onSave`, que decide qué hacer con él (agregarlo a
// `items` y recalcular los totales del paso 1).
export default function AgregarItemModal({
  numeroFactura, modoFacturacion, item, onSave, onClose,
}) {
  const [form, setForm] = useState(() => buildInitialForm(modoFacturacion, item));
  const [catalogoAreaFuncionalAbierto, setCatalogoAreaFuncionalAbierto] = useState(false);
  const [catalogoPrefijoAbierto, setCatalogoPrefijoAbierto] = useState(false);
  const [catalogoCentroCostoAbierto, setCatalogoCentroCostoAbierto] = useState(false);
  const [catalogoContratacionAbierto, setCatalogoContratacionAbierto] = useState(false);
  const [catalogoServiciosAreaAbierto, setCatalogoServiciosAreaAbierto] = useState(false);

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

  // Vlr Item es un valor unitario (encargo explícito: "cantidad 2, valor
  // del item 2000, el valor total debería ser 4000" -- antes no
  // multiplicaba por Cantidad) -- IVA también se calcula sobre el
  // subtotal ya multiplicado, no sobre el valor unitario solo.
  const subtotalItem = toNumber(form.cantidad) * toNumber(form.vlrItem);
  const valorIva = subtotalItem * (toNumber(form.porcentajeIva) / 100);
  const valorTotal = subtotalItem + valorIva + toNumber(form.vrCopagos)
    + toNumber(form.valorModeradora) + toNumber(form.vrPagoCompartido);

  // "ID" (de "No Contrato", hoy oculto -- ver comentario del componente)
  // no aplica bajo Tipo Financiero "Manual" (encargo explícito): sin
  // contrato de por medio, no hay un ID que asociarle. La sección pasa de
  // 3 a 2 columnas para no dejar hueco (Tipo Financiero/Centro Costo/Área
  // Funcional/Prefijo arman un 2x2 limpio sin el quinto campo).
  const isTipoFinancieroManual = form.tipoFinanciero === 'manual';
  // "No Contrato"/"Código" solo aplican bajo Tipo Financiero "Contratación"
  // (encargo explícito): sin un contrato de por medio no hay No Contrato/
  // Código que buscar. "Código" queda obligatorio (ver disabled de
  // "Aceptar" más abajo) únicamente mientras está visible -- de lo
  // contrario "Aceptar" quedaría bloqueado para siempre bajo Manual.
  // "Vlr Item"/"Porcentaje IVA"/"Valor IVA" son al revés: se ocultan bajo
  // Contratación (encargo explícito) -- ahí el valor del ítem viene del
  // contrato, no se tipea a mano. `valorIva`/`valorTotal` (ver más arriba)
  // no se recalculan por esto: siguen sumando `form.vlrItem`/`valorIva`,
  // que quedan en su default '0.00' mientras el campo no se muestra, mismo
  // criterio que el resto de campos ocultos de este modal.
  const isTipoFinancieroContratacion = form.tipoFinanciero === 'contratacion';

  function handleAceptar() {
    onSave({
      id: item?.id ?? `item-${Date.now()}`,
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
          icon={item ? LuPencil : LuPlus}
          title={item ? 'Editar ítem' : 'Agregar ítem'}
          titleId="aim-title"
          subtitle={`Factura ${numeroFactura}`}
          onClose={onClose}
        />

        <div className="modal-body">
          <section className="fam-section">
            <div className="fam-section-header">
              <div className="fam-section-header-main">
                <div className="fam-section-icon"><LuMapPin className="icon" aria-hidden="true" /></div>
                <div><h4>Clasificación y ubicación</h4></div>
              </div>
            </div>
            <div className={`fam-fields ${isTipoFinancieroManual ? 'fam-fields-2' : 'fam-fields-3'}`}>
              <div className="form-field">
                <label htmlFor="aim-tipo-financiero">Tipo Financiero</label>
                <FormSelect
                  id="aim-tipo-financiero"
                  value={form.tipoFinanciero}
                  onChange={setField('tipoFinanciero')}
                  options={TIPO_FINANCIERO_OPTIONS}
                />
              </div>
              <div className="form-field">
                <label htmlFor="aim-centro-costo">Centro Costo</label>
                <div className="field-with-search">
                  <input
                    id="aim-centro-costo"
                    type="text"
                    value={form.centroCosto}
                    onChange={(e) => setField('centroCosto')(e.target.value)}
                    placeholder="Selecciona una opción"
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setCatalogoCentroCostoAbierto(true)}
                    aria-label="Buscar centro de costo"
                    title="Buscar centro de costo"
                  >
                    <LuEye className="icon" />
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="aim-area-funcional">Área Funcional</label>
                <div className="field-with-search">
                  <input
                    id="aim-area-funcional"
                    type="text"
                    value={form.areaFuncional}
                    onChange={(e) => setField('areaFuncional')(e.target.value)}
                    placeholder="Selecciona una opción"
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setCatalogoAreaFuncionalAbierto(true)}
                    aria-label="Buscar área funcional"
                    title="Buscar área funcional"
                  >
                    <LuEye className="icon" />
                  </button>
                </div>
              </div>

              <div className="form-field fam-col-span-full">
                <label htmlFor="aim-prefijo">Prefijo</label>
                <div className="field-with-search">
                  <input
                    id="aim-prefijo"
                    type="text"
                    value={form.prefijo}
                    onChange={(e) => setField('prefijo')(e.target.value)}
                    placeholder="Selecciona una opción"
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => setCatalogoPrefijoAbierto(true)}
                    aria-label="Buscar prefijo"
                    title="Buscar prefijo"
                  >
                    <LuEye className="icon" />
                  </button>
                </div>
              </div>
              {isTipoFinancieroContratacion && (
                <div className="form-field fam-col-start-1">
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
              )}
              {!isTipoFinancieroManual && (
                <div className="form-field">
                  <label htmlFor="aim-id-contrato">ID</label>
                  <input
                    id="aim-id-contrato"
                    type="number"
                    value={form.idContrato}
                    onChange={(e) => setField('idContrato')(e.target.value)}
                  />
                </div>
              )}
              {isTipoFinancieroContratacion && (
                <div className="form-field">
                  <label htmlFor="aim-codigo">Código<span className="fam-required-mark">*</span></label>
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
                      onClick={() => setCatalogoServiciosAreaAbierto(true)}
                      aria-label="Buscar ítem en el catálogo"
                      title="Buscar ítem en el catálogo"
                    >
                      <LuEye className="icon" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="fam-section">
            <div className="fam-section-header">
              <div className="fam-section-header-main">
                <div className="fam-section-icon"><LuCalculator className="icon" aria-hidden="true" /></div>
                <div><h4>Liquidación y valores</h4></div>
              </div>
            </div>
            <div className="fam-fields fam-fields-4">
              <div className="form-field">
                <label htmlFor="aim-cantidad">Cantidad<span className="fam-required-mark">*</span></label>
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
              {!isTipoFinancieroContratacion && (
                <div className="form-field">
                  <label htmlFor="aim-vlr-item">Vlr Item<span className="fam-required-mark">*</span></label>
                  <CurrencyInput
                    id="aim-vlr-item"
                    value={form.vlrItem}
                    onChange={setField('vlrItem')}
                    required
                  />
                </div>
              )}
              {!isTipoFinancieroContratacion && (
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
              )}
              {!isTipoFinancieroContratacion && (
                <div className="form-field">
                  <label htmlFor="aim-valor-iva">Valor IVA</label>
                  <input
                    id="aim-valor-iva"
                    type="text"
                    value={valorIva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    readOnly
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="aim-copagos">Vr. Copagos</label>
                <CurrencyInput id="aim-copagos" value={form.vrCopagos} onChange={setField('vrCopagos')} />
              </div>
              <div className="form-field">
                <label htmlFor="aim-moderadora">Valor Moderadora</label>
                <CurrencyInput id="aim-moderadora" value={form.valorModeradora} onChange={setField('valorModeradora')} />
              </div>
              <div className="form-field">
                <label htmlFor="aim-pago-compartido">Vr. P. Compartido</label>
                <CurrencyInput id="aim-pago-compartido" value={form.vrPagoCompartido} onChange={setField('vrPagoCompartido')} />
              </div>

              <div className="fam-col-span-full">
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

              <div className="form-field fam-col-span-full">
                <label htmlFor="aim-observaciones">Observaciones</label>
                <textarea
                  id="aim-observaciones"
                  value={form.observaciones}
                  onChange={(e) => setField('observaciones')(e.target.value)}
                  placeholder="Observaciones adicionales para el ítem o prefijo..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleAceptar}
            disabled={(isTipoFinancieroContratacion && !form.codigo) || toNumber(form.cantidad) <= 0}
          >
            Aceptar
          </Button>
        </div>
      </div>

      {catalogoAreaFuncionalAbierto && (
        <CatalogoAreaFuncionalModal
          onSelect={setField('areaFuncional')}
          onClose={() => setCatalogoAreaFuncionalAbierto(false)}
        />
      )}

      {catalogoPrefijoAbierto && (
        <CatalogoPrefijoModal
          onSelect={setField('prefijo')}
          onClose={() => setCatalogoPrefijoAbierto(false)}
        />
      )}

      {catalogoCentroCostoAbierto && (
        <CatalogoCentroCostoModal
          onSelect={setField('centroCosto')}
          onClose={() => setCatalogoCentroCostoAbierto(false)}
        />
      )}

      {catalogoContratacionAbierto && (
        <CatalogoContratacionModal
          idTercero=""
          tipoTercero=""
          fecha=""
          onSelect={({ noContrato, idContrato }) => setForm((f) => ({ ...f, noContrato, idContrato }))}
          onClose={() => setCatalogoContratacionAbierto(false)}
        />
      )}

      {catalogoServiciosAreaAbierto && (
        <CatalogoServiciosAreaModal
          bodega={form.centroCosto}
          prefijo={form.prefijo}
          area={form.areaFuncional}
          asegurador=""
          sexo=""
          fecha=""
          onSelect={({ referencia, descripcion }) => setForm((f) => ({ ...f, codigo: referencia, descripcion }))}
          onClose={() => setCatalogoServiciosAreaAbierto(false)}
        />
      )}
    </div>
  );
}
