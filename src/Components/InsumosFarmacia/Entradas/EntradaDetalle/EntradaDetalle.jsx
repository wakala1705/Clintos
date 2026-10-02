'use client';

import './EntradaDetalle.css';
import { unidadesEntrada } from '@/hooks/InsumosFarmacia/entradasAsistenciales';

// Panel de detalle debajo de la grilla: los insumos devueltos por la entrada
// seleccionada (código, descripción, lote y cantidad). Misma tarjeta .mig-items-card
// que el detalle de Salidas asistenciales.
export default function EntradaDetalle({ entrada }) {
  if (!entrada) {
    return (
      <div className="ent-detalle ent-detalle-empty">
        Selecciona una entrada en la grilla para ver los insumos devueltos.
      </div>
    );
  }

  return (
    <div className="ent-detalle">
      <div className="ent-detalle-header">
        <h3 className="mig-section-title">Insumos devueltos ({entrada.items.length})</h3>
        <span className="ent-detalle-meta">
          {entrada.consecutivo} · {unidadesEntrada(entrada)} {unidadesEntrada(entrada) === 1 ? 'unidad' : 'unidades'}
        </span>
      </div>
      <div className="mig-items-card">
        <div className="mig-items-scroll">
          <table className="mig-grid">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Lote</th>
                <th className="mig-num">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {entrada.items.map((i) => (
                <tr key={`${i.codigo}-${i.noLote ?? ''}`}>
                  <td className="mig-strong">{i.codigo}</td>
                  <td>{i.nombre}</td>
                  <td>{i.manejaLote && i.noLote ? i.noLote : '—'}</td>
                  <td className="mig-num">{i.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
