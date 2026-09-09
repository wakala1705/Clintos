'use client';

import { useEffect, useState } from 'react';
import './FacturaEditarModalClasico.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoAseguradorasModal from '@/Components/CatalogoAseguradorasModal/CatalogoAseguradorasModal';
import { LuFilePenLine, LuEye } from 'react-icons/lu';

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
// mockFacturasData.js): "Guardar" no persiste, solo cierra el modal.
export default function FacturaEditarModalClasico({ factura, onClose }) {
  const [form, setForm] = useState(() => buildInitialForm(factura));
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const tipoTercero = TIPO_TERCERO_POR_CLASE[factura.clase] ?? '—';

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal fem-modal" role="dialog" aria-modal="true" aria-labelledby="fem-title">
        <ModalHeader
          icon={LuFilePenLine}
          title="Cambiando un registro"
          titleId="fem-title"
          subtitle={`Factura ${factura.numero}`}
          onClose={onClose}
        />

        <div className="modal-body">
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

            <div className="form-field">
              <label htmlFor="fem-fecha-vencimiento">Fecha Vencimiento<span className="fem-required-mark">*</span></label>
              <input
                id="fem-fecha-vencimiento"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setField(setForm, 'fechaVencimiento')(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="fem-fecha-factura">Fecha Factura<span className="fem-required-mark">*</span></label>
              <input
                id="fem-fecha-factura"
                type="date"
                value={form.fechaFactura}
                onChange={(e) => setField(setForm, 'fechaFactura')(e.target.value)}
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
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onClose}>Guardar</Button>
        </div>
      </div>

      {catalogoAbierto && (
        <CatalogoAseguradorasModal
          onSelect={setField(setForm, 'idTercero')}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </div>
  );
}
