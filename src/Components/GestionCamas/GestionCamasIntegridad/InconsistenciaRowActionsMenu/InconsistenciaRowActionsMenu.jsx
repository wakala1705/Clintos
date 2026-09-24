'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { PUEDE_IGNORAR } from '@/hooks/GestionCamas/mockIntegridadData';
import {
  LuEye, LuEyeOff, LuHistory, LuWrench,
} from 'react-icons/lu';

// Menú "⋯" de la fila — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). "Ignorar" solo aparece si PUEDE_IGNORAR (encargo, sección
// 7/8: "solo mostrarla si el usuario tiene permisos suficientes" — stand-in
// local de permisos, ver mockIntegridadData.js), y "Corregir"/"Ignorar"
// solo tienen sentido mientras la inconsistencia sigue Activa. Íconos
// agregados al homologar: era el único menú del proyecto sin ellos.
export default function InconsistenciaRowActionsMenu({
  inconsistencia, onVer, onCorregir, onIgnorar, onVerHistorial,
}) {
  const esActiva = inconsistencia.estado === 'activa';
  return (
    <DropdownMenu
      label={`Más acciones para ${inconsistencia.titulo}`}
      items={[
        { id: 'ver', label: 'Ver', icon: LuEye, onSelect: onVer },
        esActiva && {
          id: 'corregir', label: 'Corregir', icon: LuWrench, onSelect: onCorregir,
        },
        esActiva && PUEDE_IGNORAR && {
          id: 'ignorar', label: 'Ignorar', icon: LuEyeOff, onSelect: onIgnorar,
        },
        {
          id: 'historial', label: 'Ver historial', icon: LuHistory, onSelect: onVerHistorial,
        },
      ].filter(Boolean)}
    />
  );
}
