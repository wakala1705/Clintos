'use client';

// Mismo panel que MovimientoDetalleInline de Salidas: se reusan sus clases
// .mig-detalle-inline-* (el CSS lo carga este import, igual que Solicitudes.css).
import '../../Solicitudes/MovimientoDetalleInline/MovimientoDetalleInline.css';
import EntradaItemsTable from '../EntradaItemsTable/EntradaItemsTable';
import { unidadesEntrada } from '@/hooks/InsumosFarmacia/entradasAsistenciales';

// Panel de detalle debajo de la grilla: los insumos devueltos por la entrada
// seleccionada. `fill` (modo "Dividida", montado como `bottom` de SplitPane): ocupa
// todo el alto que le da el split.
export default function EntradaDetalle({ entrada, fill = false }) {
  const className = `mig-detalle-inline${fill ? ' mig-detalle-inline-fill' : ''}`;

  if (!entrada) {
    return (
      <div className={`${className} mig-detalle-inline-empty`}>
        Selecciona una entrada en la grilla para ver los insumos devueltos.
      </div>
    );
  }

  const unidades = unidadesEntrada(entrada);
  return (
    <div className={className}>
      <div className="mig-detalle-inline-header">
        <h3 className="mig-section-title">Insumos devueltos ({entrada.items.length})</h3>
        <span className="mig-detalle-inline-consecutivo">
          {entrada.consecutivo} · {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
        </span>
      </div>
      <div className="mig-items-card">
        <EntradaItemsTable key={entrada.id} items={entrada.items} />
      </div>
    </div>
  );
}
