'use client';

import { useState } from 'react';
import './Monitoreo.css';
import { VITALES_READINGS } from '@/hooks/GestionEnfermeria/mockMonitoreo';
import Button from '@/Components/Button/Button';
import { LuPlus, LuActivity, LuListChecks } from 'react-icons/lu';
import HojaMedicamentosTab from './HojaMedicamentosTab/HojaMedicamentosTab';
import SignosVitalesTab from './SignosVitalesTab/SignosVitalesTab';
import RegistrarSignosVitalesModal from './modals/RegistrarSignosVitalesModal/RegistrarSignosVitalesModal';

// Shell del tab "Monitoreo": subnav Hoja de medicamentos/Signos vitales,
// mismo mecanismo genérico que ya usa PedidosPanel (legacy-app.js:882-910
// resuelve el show/hide de cualquier .subnav-bar/.sub-panel encontrado al
// montar — no hace falta tocar legacy-app.js). Ambos subtabs ya montan su
// contenido real (HojaMedicamentosTab y SignosVitalesTab); este shell solo
// resuelve el subnav y mantiene ambos montados.
//
// El botón "Registrar signos vitales" vive acá (fila de subnavegación) en
// vez de en el filter-bar de SignosVitalesTab — por eso `readings` y el
// modal de registro también subieron a este nivel: es la única forma de que
// un registro nuevo se refleje en SignosVitalesTab sin duplicar el estado.
export default function Monitoreo() {
  const [readings, setReadings] = useState(VITALES_READINGS);
  const [showModal, setShowModal] = useState(false);

  function handleConfirmRegistro(reading) {
    setReadings((prev) => [...prev, { id: `vt-${prev.length + 1}`, ...reading }]);
    setShowModal(false);
    window.ncToast?.('Signos vitales registrados.');
  }

  return (
    <div role="tabpanel" id="panel-monitoreo" aria-labelledby="tab-monitoreo" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Secciones de monitoreo">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-signos-vitales" aria-selected="true" aria-controls="subpanel-signos-vitales" tabIndex="0">
          <LuActivity className="icon" aria-hidden="true" />
          Signos vitales
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-hoja-medicamentos" aria-selected="false" aria-controls="subpanel-hoja-medicamentos" tabIndex="-1">
          <LuListChecks className="icon" aria-hidden="true" />
          Hoja de medicamentos
        </button>
        <div className="filter-spacer" />
        <Button
          variant="primary"
          icon={LuPlus}
          className="mon-btn-registrar"
          onClick={() => setShowModal(true)}
        >
          Registrar signos vitales
        </Button>
      </div>

      <SignosVitalesTab readings={readings} />
      <HojaMedicamentosTab />

      {showModal && (
        <RegistrarSignosVitalesModal
          registradoPor="Camilo Grondona"
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmRegistro}
        />
      )}
    </div>
  );
}
