'use client';

import { useEffect, useRef, useState } from 'react';
import '../PlantillaIngresoHospitalizacion/shared/shared.css';
import '../PlantillaIngresoHospitalizacion/PlantillaIngresoHospitalizacion.css';
import './shared/shared.css';
import './PlantillaEvaluacionPreanestesica.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import IngresoHospitalizacionNav from '../PlantillaIngresoHospitalizacion/IngresoHospitalizacionNav/IngresoHospitalizacionNav';
import ViewSettingsMenu from '../PlantillaIngresoHospitalizacion/ViewSettingsMenu/ViewSettingsMenu';
import SignosVitalesPanel from '../PlantillaIngresoHospitalizacion/SignosVitalesPanel/SignosVitalesPanel';
import DiagnosticosPanel from '../PlantillaIngresoHospitalizacion/DiagnosticosPanel/DiagnosticosPanel';
import SeccionCampos from './SeccionCampos/SeccionCampos';
import { SECCIONES_EVAPRE, estadoInicialEvapre } from '@/hooks/HistoriaClinica/evaluacionPreanestesicaCampos';
import { LuArrowLeft, LuMaximize2, LuMinimize2 } from 'react-icons/lu';

const PLANTILLA_NOMBRE = 'Evaluación preanestésica';

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Mismo formato DD.MES.AAAA - HH:mm que PlantillaIngresoHospitalizacion.
function formatFechaHoraCreacion(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dia}.${MESES_CORTOS[date.getMonth()]}.${date.getFullYear()} - ${hora}:${min}`;
}

const SCROLL_OFFSET = 32; // px desde el techo del panel que cuenta como "sección activa"

// Plantilla "Evaluación preanestésica" (EVAPRE), abierta desde el catálogo de
// plantillas de Hospitalización (ver AtencionPaciente.jsx). Mismo patrón que
// PlantillaIngresoHospitalizacion: rail lateral con scrollspy + un solo
// formulario continuo con todas las secciones visibles. Lleva el mismo aside
// (Signos vitales + Diagnósticos) pero a la izquierda, antes del rail de
// secciones (encargo explícito). Las 4 secciones y sus campos están definidos
// como datos en evaluacionPreanestesicaCampos.js. Abre en 2 columnas, como el
// legado.
export default function PlantillaEvaluacionPreanestesica({ onSalir, maximizada, onToggleMaximizar, registro }) {
  // `registro` (opcional): registro EVAPRE ya guardado cuyo `contenido` se abre
  // desde "Editar" (ver AtencionPaciente.jsx) -- precarga el formulario y el
  // aside en vez de arrancar con los textos por defecto.
  const contenido = registro?.contenido;
  const [activeSeccion, setActiveSeccion] = useState(SECCIONES_EVAPRE[0].id);
  const [creadaEn] = useState(() => new Date());
  const [columnLayout, setColumnLayout] = useState('dos-columnas');
  const [valores, setValores] = useState(() => ({ ...estadoInicialEvapre(), ...contenido?.valores }));
  const panelRef = useRef(null);
  const sectionRefs = useRef([]);

  function handleChange(key, value) {
    setValores((prev) => ({ ...prev, [key]: value }));
  }

  function handleSelectSeccion(id) {
    setActiveSeccion(id);
    const index = SECCIONES_EVAPRE.findIndex((s) => s.id === id);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    let ticking = false;
    function computeActive() {
      ticking = false;
      const containerTop = el.getBoundingClientRect().top;
      let next = SECCIONES_EVAPRE[0].id;
      sectionRefs.current.forEach((node, i) => {
        if (!node) return;
        if (node.getBoundingClientRect().top - containerTop <= SCROLL_OFFSET) next = SECCIONES_EVAPRE[i].id;
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

  // Sin backend (mock): solo confirma por toast y vuelve, como INGHOSP.
  function handleGuardarSalir() {
    window.ncToast?.('Evaluación preanestésica guardada.');
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
          <span className="pih-titlebar-meta">{registro ? `${registro.fecha} · ${registro.hora}` : formatFechaHoraCreacion(creadaEn)}</span>
          {registro ? (
            <Badge tone="neutral">Registro N° {registro.numero}</Badge>
          ) : (
            <Badge tone="success">Nuevo registro</Badge>
          )}
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
        <aside className="pih-aside pea-aside">
          <SignosVitalesPanel inicial={contenido?.signosVitales} />
          <DiagnosticosPanel inicial={contenido?.diagnosticos} />
        </aside>

        <IngresoHospitalizacionNav
          secciones={SECCIONES_EVAPRE}
          activeSeccion={activeSeccion}
          onSelectSeccion={handleSelectSeccion}
          ariaLabel="Secciones de la evaluación preanestésica"
        />

        <form
          className={`pih-content${columnLayout === 'dos-columnas' ? ' pih-cols-2' : ''}`}
          ref={panelRef}
          onSubmit={(e) => e.preventDefault()}
        >
          {SECCIONES_EVAPRE.map((seccion, i) => (
            <div
              key={seccion.id}
              id={`pea-${seccion.id}`}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className="pih-section-block"
            >
              <SeccionCampos seccion={seccion} valores={valores} onChange={handleChange} />
            </div>
          ))}

          <div className="pih-footer">
            <Button type="button" variant="secondary" onClick={onSalir}>Cancelar</Button>
            <Button type="button" variant="primary" onClick={handleGuardarSalir}>Guardar y salir</Button>
          </div>
        </form>
      </div>
    </>
  );
}
