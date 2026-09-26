'use client';

import { useEffect, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import './Triage.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import TriagePanel from './TriagePanel/TriagePanel';
import ValoracionTriageModal from './modals/ValoracionTriageModal/ValoracionTriageModal';
import { CLASIFICADOS, EN_ESPERA } from '@/hooks/Triage/triageData';

// Registro de triage del módulo Hospitalización: réplica de la pantalla legacy
// "Registro de triage" (pestañas En espera / Clasificados, resumen de tiempos
// de espera y tabla de pacientes) con el esqueleto del resto de rutas de
// Hospitalización (encabezado + card con la lista, ver Interconsulta.jsx).
//
// Valoración (ValoracionTriageModal): "Iniciar valoración" la abre para el
// paciente de esa fila; "Nueva valoración" para el siguiente de la cola (el
// que más lleva esperando) y se deshabilita con la cola vacía. Las dos listas
// viven en estado porque clasificar mueve al paciente de "En espera" a
// "Clasificados" (sin backend: solo en memoria).
export default function Triage() {
  const [enEspera, setEnEspera] = useState(EN_ESPERA);
  const [clasificados, setClasificados] = useState(CLASIFICADOS);
  const [valorandoId, setValorandoId] = useState(null);
  const valorando = enEspera.find((p) => p.id === valorandoId);
  const siguiente = enEspera.reduce((max, p) => (!max || p.esperaMin > max.esperaMin ? p : max), null);

  // TODO: "Continuar valoración" desde el formulario de datos (motivo,
  // condición especial, signos vitales) → siguiente paso de la valoración
  // completa. Por ahora solo cierra el modal.
  function handleContinuar() {
    setValorandoId(null);
  }

  // Criterio de atención inmediata confirmado ("Finalizar clasificación"):
  // sale de la cola y entra a Clasificados con el nivel sugerido, la hora
  // actual y el usuario en sesión.
  function handleClasificar(nivel) {
    const { banderas: _b, observacion: _o, ...datos } = valorando;
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
    setEnEspera((lista) => lista.filter((p) => p.id !== valorando.id));
    setClasificados((lista) => [{ ...datos, nivel, hora, clasificadoPor: 'Camilo Grondona' }, ...lista]);
    setValorandoId(null);
  }

  // Theme claro/oscuro + colapsar/expandir el Sidebar — sin este efecto los
  // onClick de Sidebar.jsx (window.toggleTheme/toggleSidebar/toggleNavGroup)
  // quedan sin definir.
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización']}
          page="Triage"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content tg-content">
          <div className="tg-header">
            <div>
              <h1>Registro de triage</h1>
              <p>Clasificación y priorización de pacientes al ingreso.</p>
            </div>
            <Button variant="primary" icon={LuPlus} disabled={!siguiente} onClick={() => setValorandoId(siguiente.id)}>
              Nueva valoración
            </Button>
          </div>

          <TriagePanel enEspera={enEspera} clasificados={clasificados} onIniciar={setValorandoId} />
        </div>
      </div>

      {valorando && (
        <ValoracionTriageModal
          key={valorando.id}
          paciente={valorando}
          onClose={() => setValorandoId(null)}
          onContinuar={handleContinuar}
          onClasificar={handleClasificar}
        />
      )}
    </div>
  );
}
