'use client';

import './MovimientosToolbar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import {
  CONTEXTO_BODEGA, TIPO_OPTIONS, TIPO_ARTICULO_OPTIONS, PROCEDENCIA_OPTIONS, ESTADO_OPTIONS, TRNS_OPTIONS,
} from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuDownload, LuRefreshCw } from 'react-icons/lu';

// Réplica del toolbar denso multi-campo de la pantalla legacy de referencia
// (encargo explícito) -- excepción ya validada por FacturaVistaClasica al
// filter-bar estándar de un listado normal (buscador + chips + selects en
// una sola fila, ver AGENTS.md "Barra de filtros de listado"): esta pantalla
// replica la estructura original, no la condensa. Año/Grp Bdg./Bodega/
// Id.Sede son de solo lectura (CONTEXTO_BODEGA) -- V1 no tiene selector de
// bodega, ver spec. "Seleccionar Movimiento" es visual-only (V1 sin backend).
export default function MovimientosToolbar({ filtros, onChange }) {
  return (
    <div className="mig-toolbar">
      <div className="mig-toolbar-row">
        <div className="mig-static-field">
          <span className="lbl">Año:</span>
          <span className="val">{CONTEXTO_BODEGA.anio}</span>
        </div>
        <div className="mig-static-field">
          <span className="lbl">Grp Bdg.:</span>
          <span className="val">{CONTEXTO_BODEGA.grupoBodega}</span>
        </div>
        <div className="mig-static-field">
          <span className="val">{CONTEXTO_BODEGA.bodega}</span>
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-tipo">Tipo:</label>
          <FormSelect id="mig-tipo" value={filtros.tipo} onChange={(v) => onChange({ tipo: v })} options={TIPO_OPTIONS} />
        </div>

        <div className="mig-static-field">
          <span className="lbl">Id.Sede:</span>
          <span className="val">{CONTEXTO_BODEGA.idSede}</span>
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-tipo-articulo">Tipo Artículo:</label>
          <FormSelect id="mig-tipo-articulo" value={filtros.tipoArticulo} onChange={(v) => onChange({ tipoArticulo: v })} options={TIPO_ARTICULO_OPTIONS} />
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-procedencia">Procedencia:</label>
          <FormSelect id="mig-procedencia" value={filtros.procedencia} onChange={(v) => onChange({ procedencia: v })} options={PROCEDENCIA_OPTIONS} />
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-estado">Estado:</label>
          <FormSelect id="mig-estado" value={filtros.estado} onChange={(v) => onChange({ estado: v })} options={ESTADO_OPTIONS} />
        </div>
      </div>

      <div className="mig-toolbar-row">
        <Button variant="secondary" size="sm" icon={LuDownload}>Seleccionar Movimiento</Button>

        <div className="mig-filter-field">
          <label htmlFor="mig-trns">Trns.:</label>
          <FormSelect id="mig-trns" value={filtros.trns} onChange={(v) => onChange({ trns: v })} options={TRNS_OPTIONS} />
        </div>

        <input
          type="text"
          className="mig-input"
          placeholder="No. Doc."
          aria-label="No. Doc."
          value={filtros.noDoc}
          onChange={(e) => onChange({ noDoc: e.target.value })}
        />
        <input
          type="text"
          className="mig-input"
          placeholder="Admisión"
          aria-label="Admisión"
          value={filtros.noAdmision}
          onChange={(e) => onChange({ noAdmision: e.target.value })}
        />
        <input
          type="text"
          className="mig-input"
          placeholder="Prestación"
          aria-label="Prestación"
          value={filtros.noPrestacion}
          onChange={(e) => onChange({ noPrestacion: e.target.value })}
        />

        <Button variant="secondary" size="sm" icon={LuRefreshCw} className="mig-refresh-btn">Refrescar</Button>
      </div>
    </div>
  );
}
