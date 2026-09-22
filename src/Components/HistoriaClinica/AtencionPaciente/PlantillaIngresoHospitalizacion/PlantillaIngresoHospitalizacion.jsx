'use client';

import { useRef, useState } from 'react';
import './shared/shared.css';
import './PlantillaIngresoHospitalizacion.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import IngresoHospitalizacionNav from './IngresoHospitalizacionNav/IngresoHospitalizacionNav';
import InformacionGeneralStep from './InformacionGeneralStep/InformacionGeneralStep';
import AntecedentesStep from './AntecedentesStep/AntecedentesStep';
import ExamenFisicoStep from './ExamenFisicoStep/ExamenFisicoStep';
import PlanTratamientoStep from './PlanTratamientoStep/PlanTratamientoStep';
import DiagnosticosPanel from './DiagnosticosPanel/DiagnosticosPanel';
import { LuArrowLeft } from 'react-icons/lu';

const PLANTILLA_NOMBRE = 'Ingreso a hospitalización';

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Fecha/hora de creación de la plantilla — se fija una sola vez al montar
// (no en cada render) porque es "cuándo se empezó a crear", no un reloj en
// vivo. Formato pedido explícitamente (DD.MES.AAAA, mes corto en mayúsculas
// con puntos) en vez del `formatFechaHora` de GestionCamas (que usa coma y
// mes en minúscula) — no hay precedente de este formato exacto en el resto
// del proyecto.
function formatFechaHoraCreacion(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = MESES_CORTOS[date.getMonth()];
  const hora = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dia}.${mes}.${date.getFullYear()} · ${hora}`;
}

// Plantilla "Ingreso a hospitalización" (INGHOSP), abierta desde "Nueva
// atención" → catálogo de plantillas (ver PlantillaModal en
// AtencionPaciente.jsx) — mismo patrón que PlantillaCrecimt2 (se monta
// DENTRO de la card de AtencionPaciente.jsx en vez de ser una ruta propia,
// ver su comentario para el porqué). Reemplaza el shell placeholder
// anterior ("Formulario en construcción") con el formulario real: 4
// secciones (encargo explícito) transcritas de las capturas del sistema
// legado — ver comentario de cada Step para el detalle de campos.
//
// Mismo patrón estructural que las plantillas de Consulta Externa
// (PlantillaCrecimt2: rail de navegación lateral + contenido a la derecha,
// ver IngresoHospitalizacionNav.jsx) — a diferencia de esa plantilla (wizard
// de 13 pasos con navegación bloqueante en el paso 1), acá las 4 secciones
// son de navegación libre: el legado las muestra como anclas simples en una
// sola página, no como un wizard con validación, así que el nav no trae
// numeración/checkmarks de completado ni subsecciones. Los 4 pasos quedan
// SIEMPRE montados (ocultos con `hidden`, mismo criterio que
// PlantillaCrecimt2) para no perder lo diligenciado al cambiar de sección.
const SECCIONES = [
  { id: 'informacion-general', label: 'Información general' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'examen-fisico', label: 'Examen físico' },
  { id: 'plan-tratamiento', label: 'Plan de tratamiento' },
];

export default function PlantillaIngresoHospitalizacion({ onSalir }) {
  const [activeSeccion, setActiveSeccion] = useState(SECCIONES[0].id);
  const [creadaEn] = useState(() => new Date());
  const panelRef = useRef(null);

  // Al cambiar de sección, la nueva vuelve a mostrarse desde arriba (mismo
  // criterio que goToStep en PlantillaCrecimt2.jsx) — sin esto, el panel
  // conserva el scrollTop de la sección anterior y la sección recién
  // seleccionada puede aparecer a mitad de scroll.
  function handleSelectSeccion(id) {
    setActiveSeccion(id);
    panelRef.current?.scrollTo({ top: 0 });
  }

  // Sin backend real (mock: "solo pinta el front"), Guardar y salir solo
  // confirma la acción por toast y vuelve a la vista de pestañas — mismo
  // criterio que el resto del proyecto para flujos sin persistencia real.
  function handleGuardarSalir() {
    window.ncToast?.('Ingreso a hospitalización guardado.');
    onSalir();
  }

  return (
    <>
      <div className="pih-titlebar">
        <button type="button" className="pih-titlebar-back" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <div className="pih-titlebar-info">
          <Badge tone="info">Nuevo registro</Badge>
          <span className="pih-titlebar-title">{PLANTILLA_NOMBRE}</span>
          <span className="pih-titlebar-meta">{formatFechaHoraCreacion(creadaEn)}</span>
        </div>
      </div>

      <div className="pih-body">
        <IngresoHospitalizacionNav
          secciones={SECCIONES}
          activeSeccion={activeSeccion}
          onSelectSeccion={handleSelectSeccion}
        />

        <div className="pih-content" ref={panelRef}>
          <InformacionGeneralStep hidden={activeSeccion !== 'informacion-general'} />
          <AntecedentesStep hidden={activeSeccion !== 'antecedentes'} />
          <ExamenFisicoStep hidden={activeSeccion !== 'examen-fisico'} />
          <PlanTratamientoStep hidden={activeSeccion !== 'plan-tratamiento'} />
        </div>

        <aside className="pih-aside">
          <DiagnosticosPanel />
        </aside>
      </div>

      <div className="pih-footer">
        <Button variant="secondary" onClick={onSalir}>Cancelar</Button>
        <Button variant="primary" onClick={handleGuardarSalir}>Guardar y salir</Button>
      </div>
    </>
  );
}
