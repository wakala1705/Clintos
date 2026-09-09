'use client';

import './MovimientosTotalesFooter.css';
import { formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const CARDS = [
  { key: 'costoConfirmado', label: 'Ttl Costo Art. Confir.' },
  { key: 'cantidadConfirmado', label: 'Ttl Cant. Art. Confir.' },
  { key: 'costoSinConfirmar', label: 'Ttl Costo Art. Sin Confir.' },
  { key: 'cantidadSinConfirmar', label: 'Ttl Cant. Art. Sin Confir.' },
  { key: 'totalIva', label: 'Total IVA' },
];

// Pie de totales -- puramente presentacional, el particionamiento
// Confir./Sin Confir. por artículo.confirmado ya lo hace Solicitudes.jsx
// (ver Task 8) para que este componente no dependa del shape completo de
// Movimiento, solo de los 5 números ya agregados.
export default function MovimientosTotalesFooter({ totales }) {
  return (
    <div className="mig-footer">
      {CARDS.map((c) => (
        <div className="mig-total-card" key={c.key}>
          <span className="mig-total-label">{c.label}</span>
          <span className="mig-total-value">{formatMoneda(totales[c.key])}</span>
        </div>
      ))}
    </div>
  );
}
