'use client';

import { useEffect, useState } from 'react';
import './CatalogoContratacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuTriangleAlert } from 'react-icons/lu';

// Picker fijo de "Contratación" (encargo explícito, ver imagen de
// referencia) para los campos "No Contrato"/"ID"/"Tipo Contrato" de
// FacturaAgregarModalClasico -- `onSelect` entrega los 3 a la vez
// ({ noContrato, idContrato, tipoContrato }, la fila elegida ya trae su ID y
// su Evento/PGP, encargo explícito) en vez de un solo valor como
// CatalogoAseguradorasModal/CatalogoTipoTerceroModal. Mismo criterio que
// CatalogoTipoTerceroModal para el resto (sin búsqueda/paginación, vive en
// FacturaVistaClasica en vez de ser app-wide, reusa el scaffolding
// .modal-overlay/.modal/.modal-body/.modal-footer de ../../shared/shared.css).
// Sin tab "Contratación" (la imagen de referencia la traía, pero se sacó acá
// desde el arranque siguiendo el mismo ajuste ya pedido en
// CatalogoTipoTerceroModal: un tab único que no alterna nada es puro chrome
// de más). Footer sin íconos y "Cancelar" en vez de "Salir"/"Aceptar" con
// ícono -- mismo criterio ya aplicado en CatalogoTipoTerceroModal.
// `tipoContrato` es el mismo dominio evento/capita/pgp que
// TIPO_CONTRATO_OPTIONS en FacturaAgregarModalClasico (encargo explícito:
// "Tipo Contrato" del formulario padre se autocompleta según la fila
// elegida acá) -- separado de `tipoContratoRegimen` (el texto libre "PGP,
// EPS:Contributivo" que solo se muestra en la tabla) porque uno es dato de
// negocio y el otro es presentación.
const CONTRATOS_MOCK = [
  {
    id: 245,
    noContrato: '',
    tipoContrato: 'pgp',
    tipoContratoRegimen: 'PGP, EPS:Contributivo',
    claseCobertura: 'SALUD TOTAL PGP ONCOLOGIA CANCER',
    administradora: 'SALUD TOTAL ENTIDAD PROMOTORA DE SALUD',
    estadoAfiliadoBD: 'No en BD',
    bdPropia: 0,
  },
  {
    id: 523,
    noContrato: '026Cardio',
    tipoContrato: 'evento',
    tipoContratoRegimen: 'Evento, EPS:Contributivo',
    claseCobertura: 'SALUD TOTAL CONTRIBUTIVO C/APORTE',
    administradora: 'SALUD TOTAL ENTIDAD PROMOTORA DE SALUD',
    estadoAfiliadoBD: 'No en BD',
    bdPropia: 0,
  },
];

// Mismo formato día.mes.año numérico que la imagen de referencia ("9.09.2026")
// -- distinto de formatFechaClasica (día.MES-abreviado.año) de
// mockFacturasData.js, por eso no se reusa ese helper acá.
function formatFechaNumerica(iso) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-');
  return `${Number(day)}.${month}.${year}`;
}

function Field({ label, value }) {
  return (
    <div className="ccm-field">
      <span className="ccm-field-label">{label}:</span>
      <span className="ccm-field-value">{value || '—'}</span>
    </div>
  );
}

export default function CatalogoContratacionModal({
  idTercero, tipoTercero, fecha, onSelect, onClose,
}) {
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleAceptar() {
    if (!seleccion) return;
    onSelect({
      noContrato: seleccion.noContrato,
      idContrato: String(seleccion.id),
      tipoContrato: seleccion.tipoContrato,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ccm-modal" role="dialog" aria-modal="true" aria-labelledby="ccm-title">
        <ModalHeader
          icon={LuTriangleAlert}
          tone="warning"
          title="Contratación"
          titleId="ccm-title"
          onClose={onClose}
          closeLabel="Cerrar contratación"
        />

        <div className="modal-body">
          <div className="ccm-info-panel">
            <Field label="Modo" value="Admisión" />
            <Field label="Tipo Tercero" value={tipoTercero} />
            <Field label="ID Servicio" value="" />
            <div />

            <Field label="ID Sede" value="02" />
            <Field label="ID Afiliado" value="" />
            <Field label="Fecha" value={formatFechaNumerica(fecha)} />
            <div />

            <Field label="ID Tercero" value={idTercero} />
            <Field label="ID Area" value="" />
            <Field label="Clase Orden" value="" />
            <Field label="Servicio Adm." value="" />
          </div>

          <div className="ccm-table">
            <div className="ccm-row ccm-row-head">
              <span>ID</span>
              <span>No. Contrato</span>
              <span>Tipo Contrato y Régimen</span>
              <span>Clase Cobertura</span>
              <span>Administradora del Afiliado</span>
              <span>Est. Afi.BD</span>
              <span>BD Propia</span>
            </div>
            <div className="ccm-list" role="listbox" aria-labelledby="ccm-title">
              {CONTRATOS_MOCK.map((c) => {
                const active = seleccion?.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    role="option"
                    aria-selected={active}
                    className={`ccm-row ccm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c)}
                  >
                    <span className="ccm-num">{c.id}</span>
                    <span>{c.noContrato}</span>
                    <span>{c.tipoContratoRegimen}</span>
                    <span className="ccm-ellipsis">{c.claseCobertura}</span>
                    <span className="ccm-ellipsis">{c.administradora}</span>
                    <span>{c.estadoAfiliadoBD}</span>
                    <span className="ccm-num">{c.bdPropia}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleAceptar} disabled={!seleccion}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
