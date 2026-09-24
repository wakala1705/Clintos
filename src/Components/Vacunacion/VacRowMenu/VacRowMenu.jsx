'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuBellRing, LuFileText, LuSyringe } from 'react-icons/lu';

// Menú "⋯" de una fila — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Acciones sin pantalla propia todavía (ver encargo: "no
// diseñes esa vista todavía") — cada una es un placeholder vía
// window.ncToast, mismo criterio "en desarrollo" que el resto del aplicativo.
export default function VacRowMenu({ onRegistrarAplicacion, onVerEsquema, onEnviarRecordatorio }) {
  return (
    <DropdownMenu
      label="Más acciones"
      items={[
        {
          id: 'aplicacion', label: 'Registrar aplicación', icon: LuSyringe, onSelect: onRegistrarAplicacion,
        },
        {
          id: 'esquema', label: 'Ver esquema completo', icon: LuFileText, onSelect: onVerEsquema,
        },
        {
          id: 'recordatorio', label: 'Enviar recordatorio', icon: LuBellRing, onSelect: onEnviarRecordatorio,
        },
      ]}
    />
  );
}
