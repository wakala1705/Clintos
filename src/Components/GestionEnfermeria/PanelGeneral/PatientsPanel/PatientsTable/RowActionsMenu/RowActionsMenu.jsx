'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuClipboardList, LuFileText, LuHeartPulse, LuIdCard, LuNotebookPen, LuPill,
} from 'react-icons/lu';

function enDesarrollo(mensaje) {
  window.ncToast?.(mensaje);
}

// Menú "⋯" de acciones por paciente — @/Components/DropdownMenu (ver
// AGENTS.md "Dropdowns"). Ver medicación/Ver órdenes navegan de verdad a la
// atención de ese paciente (mismas 2 secciones que ya existen ahí, ver
// AtencionEnfermeria.jsx); el resto dispara el mismo aviso "en desarrollo"
// que el resto del proyecto (window.ncToast, ver AGENTS.md) porque sus
// pantallas reales (signos vitales, historia clínica de hospitalización,
// nota de enfermería) todavía no existen. "Ver detalle" abre
// @/Components/DetalleAdmisionModal (el mismo de HC Hospitalización y
// Admisiones), montado en PatientsPanel.jsx.
export default function RowActionsMenu({
  paciente, onVerDetalle, onVerMedicacion, onVerOrdenes,
}) {
  return (
    <DropdownMenu
      label={`Más acciones para ${paciente}`}
      items={[
        { id: 'detalle', label: 'Ver detalle', icon: LuIdCard, onSelect: onVerDetalle },
        {
          id: 'historia', label: 'Ver historia clínica', icon: LuFileText, onSelect: () => enDesarrollo(`Historia clínica de ${paciente} (en desarrollo).`),
        },
        { id: 'medicacion', label: 'Ver medicación', icon: LuPill, onSelect: onVerMedicacion },
        {
          id: 'signos', label: 'Registrar signos vitales', icon: LuHeartPulse, onSelect: () => enDesarrollo(`Registro de signos vitales de ${paciente} (en desarrollo).`),
        },
        { id: 'ordenes', label: 'Ver órdenes', icon: LuClipboardList, onSelect: onVerOrdenes },
        {
          id: 'nota', label: 'Registrar nota de enfermería', icon: LuNotebookPen, onSelect: () => enDesarrollo(`Nota de enfermería de ${paciente} (en desarrollo).`),
        },
      ]}
    />
  );
}
