'use client';

import { useEffect, useRef, useState } from 'react';
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
import ViewSettingsMenu from './ViewSettingsMenu/ViewSettingsMenu';
import { LuArrowLeft, LuMaximize2, LuMinimize2 } from 'react-icons/lu';

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
// sola página, no como un wizard con validación. Un solo formulario continuo
// (encargo explícito) con las 4 secciones siempre visibles en vez de
// mostrar/ocultar una a la vez — el nav lateral pasa a ser scrollspy: hace
// scroll hasta la sección elegida (`handleSelectSeccion`) y se resalta solo
// según cuál sección cruzó el techo del panel al scrollear a mano (mismo
// patrón SCROLL_OFFSET/computeActive/requestAnimationFrame que
// ExamenFisicoStep.jsx de PlantillaCrecimt2, aplicado acá a las 4 secciones
// de nivel superior en vez de a las subsecciones de un solo step).
const SECCIONES = [
  { id: 'informacion-general', label: 'Información general' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'examen-fisico', label: 'Examen físico' },
  { id: 'plan-tratamiento', label: 'Plan de tratamiento' },
];

const SCROLL_OFFSET = 32; // px desde el techo del panel que cuenta como "sección activa"

export default function PlantillaIngresoHospitalizacion({ onSalir, maximizada, onToggleMaximizar }) {
  const [activeSeccion, setActiveSeccion] = useState(SECCIONES[0].id);
  const [creadaEn] = useState(() => new Date());
  const [columnLayout, setColumnLayout] = useState('flexible');
  const panelRef = useRef(null);
  const sectionRefs = useRef([]);

  function handleSelectSeccion(id) {
    setActiveSeccion(id);
    const index = SECCIONES.findIndex((s) => s.id === id);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    let ticking = false;
    function computeActive() {
      ticking = false;
      const containerTop = el.getBoundingClientRect().top;
      let next = SECCIONES[0].id;
      sectionRefs.current.forEach((node, i) => {
        if (!node) return;
        const top = node.getBoundingClientRect().top - containerTop;
        if (top <= SCROLL_OFFSET) next = SECCIONES[i].id;
      });
      setActiveSeccion(next);
    }
    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(computeActive);
    }
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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
        <button type="button" className="pih-titlebar-icon-btn" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <div className="pih-titlebar-info">
          <span className="pih-titlebar-label">PLANTILLA:</span>
          <span className="pih-titlebar-title">{PLANTILLA_NOMBRE}</span>
          <span className="pih-titlebar-meta">{formatFechaHoraCreacion(creadaEn)}</span>
          <Badge tone="success">Nuevo registro</Badge>
        </div>

        <div className="pih-titlebar-actions">
          <ViewSettingsMenu columnLayout={columnLayout} onColumnLayoutChange={setColumnLayout} />
          <button
            type="button"
            className="pih-titlebar-icon-btn"
            onClick={onToggleMaximizar}
            aria-label={maximizada ? 'Restaurar pantalla' : 'Expandir pantalla'}
            title={maximizada ? 'Restaurar pantalla' : 'Expandir pantalla'}
          >
            {maximizada ? (
              <LuMinimize2 className="icon" aria-hidden="true" />
            ) : (
              <LuMaximize2 className="icon" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div className="pih-body">
        <IngresoHospitalizacionNav
          secciones={SECCIONES}
          activeSeccion={activeSeccion}
          onSelectSeccion={handleSelectSeccion}
        />

        <form
          className={`pih-content${columnLayout === 'dos-columnas' ? ' pih-cols-2' : ''}`}
          ref={panelRef}
          onSubmit={(e) => e.preventDefault()}
        >
          <div id="pih-informacion-general" ref={(el) => { sectionRefs.current[0] = el; }} className="pih-section-block">
            <InformacionGeneralStep />
          </div>
          <div id="pih-antecedentes" ref={(el) => { sectionRefs.current[1] = el; }} className="pih-section-block">
            <AntecedentesStep />
          </div>
          <div id="pih-examen-fisico" ref={(el) => { sectionRefs.current[2] = el; }} className="pih-section-block">
            <ExamenFisicoStep />
          </div>
          <div id="pih-plan-tratamiento" ref={(el) => { sectionRefs.current[3] = el; }} className="pih-section-block">
            <PlanTratamientoStep />
          </div>

          <div className="pih-footer">
            <Button type="button" variant="secondary" onClick={onSalir}>Cancelar</Button>
            <Button type="button" variant="primary" onClick={handleGuardarSalir}>Guardar y salir</Button>
          </div>
        </form>

        <aside className="pih-aside">
          <DiagnosticosPanel />
        </aside>
      </div>
    </>
  );
}
