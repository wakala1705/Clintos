'use client';

import { useEffect } from 'react';
import './Kora.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import ClintosAI from '@/Components/ClintosAI/ClintosAI';

// Tercer punto de entrada a Kora (encargo explícito), además del trigger
// flotante y el botón del Topbar de las 2 pantallas contextuales (ver
// ClintosAI.jsx) — accesible desde el Sidebar (grupo "Otros soportes", misma
// pestaña, ver Sidebar.jsx) y pensado para "un contexto general de
// inteligencia artificial", no acotado a un piso/paciente.
//
// `pacientes={[]}` (no `undefined`): clintosAiEngine.answerPrompt hace
// `pacientes.filter/.length/.find` sin chequeo de nulidad — el composer
// sigue habilitado acá para texto libre, así que un array vacío real evita
// que cualquier prompt tipeado explote, y las respuestas "0 pacientes"/
// "no hay pacientes con..." siguen siendo honestas (no inventan datos).
// `generalContext` (ver ClintosAIPanel.jsx) oculta "Acciones sugeridas"/
// "Pregúntame" (esas 7 preguntas son 100% de piso/paciente) y cambia el
// saludo — sin él, esta pantalla mostraría cards de un piso/paciente que
// acá no existen.
export default function Kora() {
  // `startCollapsed:true` — mismo criterio que todo módulo salvo Inicio (ver
  // legacy-shell-chrome.js): el sidebar entra colapsado a riel de íconos,
  // encargo explícito ("el mismo comportamiento que tienen los otros módulos").
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar page="Kora" user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }} />

        <div className="kora-body-row">
          <ClintosAI
            autoOpen
            generalContext
            pacientes={[]}
            userFirstName="Camilo"
            screenLabel="Inicio"
          />
        </div>
      </div>
    </div>
  );
}
