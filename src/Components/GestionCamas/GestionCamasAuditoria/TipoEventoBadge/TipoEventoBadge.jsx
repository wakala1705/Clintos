import './TipoEventoBadge.css';
import { TIPO_LABEL, TIPO_TONO } from '@/hooks/GestionCamas/mockAuditoriaData';

// Píldora de texto (sin ícono, a diferencia de EstadoAdminBadge/ImpactoBadge
// de las otras pantallas) — 12 tipos posibles acá (encargo sección 8 + 13),
// demasiados para un set de íconos distinguibles a simple vista; el color
// ya alcanza para escanear la columna rápido. Eliminación es el ÚNICO tono
// crítico (encargo explícito: "evitar rojo solo porque la acción es
// importante").
export default function TipoEventoBadge({ tipo }) {
  return (
    <span className={`cbau-tipo-badge cbau-tono-${TIPO_TONO[tipo]}`}>
      {TIPO_LABEL[tipo]}
    </span>
  );
}
