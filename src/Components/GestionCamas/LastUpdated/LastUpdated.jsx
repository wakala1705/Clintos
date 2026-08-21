'use client';

import './LastUpdated.css';
import { formatRelativeTime } from '@/hooks/GestionCamas/formatRelativeTime';
import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

// Indicador secundario de "tiempo real" (encargo: "sin competir visualmente
// con el título ni los KPIs" — por eso vive en .cb-status-row, fs-sm/ink-500,
// nunca cerca del tamaño de un KpiCard). Solo 3 estados reales en el código
// (`loading`/`error`/lo demás): el 4to estado del encargo ("Actualizado
// ahora") no necesita su propio flag — es lo que `formatRelativeTime` ya
// devuelve cuando `lastUpdatedAt` está a menos de 5s de `now` (ver
// formatRelativeTime.js), así que "idle recién actualizado" y "Actualizado
// ahora" son el mismo estado con distinto texto derivado.
export default function LastUpdated({
  status, lastUpdatedAt, now, onRefresh,
}) {
  if (status === 'loading') {
    return (
      <div className="cb-last-updated">
        <LuRefreshCw className="icon cb-last-updated-spin" aria-hidden="true" />
        <span>Actualizando…</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="cb-last-updated cb-last-updated-error">
        <LuTriangleAlert className="icon" aria-hidden="true" />
        <span>No se pudo actualizar</span>
        <button type="button" className="cb-last-updated-retry" onClick={onRefresh}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="cb-last-updated">
      <span>Actualizado {formatRelativeTime(lastUpdatedAt, now)}</span>
      <button
        type="button"
        className="cb-last-updated-refresh"
        onClick={onRefresh}
        aria-label="Actualizar ahora"
        title="Actualizar ahora"
      >
        <LuRefreshCw className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
