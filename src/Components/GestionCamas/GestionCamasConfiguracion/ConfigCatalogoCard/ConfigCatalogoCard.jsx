'use client';

import './ConfigCatalogoCard.css';
import {
  LuArrowRight, LuBedDouble, LuBell, LuClipboardList, LuListChecks, LuSettings2, LuShieldCheck, LuTimer, LuWrench,
} from 'react-icons/lu';

// Un ícono por catálogo (encargo, secciones 5-12) — mapa local en vez de
// guardar el componente de ícono en el mock (mockConfiguracionData.js es
// solo datos, ver AGENTS.md).
const ICONS = {
  LuBedDouble, LuListChecks, LuClipboardList, LuWrench, LuShieldCheck, LuSettings2, LuTimer, LuBell,
};

// Estructura fija del encargo (sección 4): ícono, nombre, descripción breve,
// cantidad configurada, flecha — la card entera es el trigger (mismo
// criterio que .cbau-row en Auditoría), la acción principal es "entrar al
// catálogo", nunca convertirla en su propio mini-dashboard.
export default function ConfigCatalogoCard({ catalogo, onOpen }) {
  const Icon = ICONS[catalogo.icon];
  return (
    <button type="button" className="cbc-cat-card" onClick={() => onOpen(catalogo)}>
      <div className="cbc-cat-top">
        <div className="cbc-cat-icon"><Icon className="icon" aria-hidden="true" /></div>
        <div className="cbc-cat-arrow"><LuArrowRight className="icon" aria-hidden="true" /></div>
      </div>
      <div>
        <div className="cbc-cat-nombre">{catalogo.nombre}</div>
        <div className="cbc-cat-desc">{catalogo.descripcion}</div>
      </div>
      <div className="cbc-cat-count">{catalogo.cantidad} {catalogo.unidad}</div>
    </button>
  );
}
