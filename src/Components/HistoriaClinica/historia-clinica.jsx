'use client';

import { useEffect } from 'react';
import './historia-clinica.css';
import '@/Components/HistoriaClinica/shared/shared.css';
import { initHistoriaClinica } from '@/hooks/HistoriaClinica/legacy-app';
import PatientBanner from '@/Components/HistoriaClinica/PatientBanner/PatientBanner';
import MedicamentosPanel from '@/Components/HistoriaClinica/MedicamentosPanel/MedicamentosPanel';
import OrdenesMedicasPanel from '@/Components/HistoriaClinica/OrdenesMedicasPanel/OrdenesMedicasPanel';
import PedidosPanel from '@/Components/HistoriaClinica/PedidosPanel/PedidosPanel';
import Toast from '@/Components/HistoriaClinica/modals/Toast/Toast';
import DosePopover from '@/Components/HistoriaClinica/modals/DosePopover/DosePopover';
import AdminModal from '@/Components/HistoriaClinica/modals/AdminModal/AdminModal';
import SuspendModal from '@/Components/HistoriaClinica/modals/SuspendModal/SuspendModal';
import ReturnModal from '@/Components/HistoriaClinica/modals/ReturnModal/ReturnModal';
import ProgramModal from '@/Components/HistoriaClinica/modals/ProgramModal/ProgramModal';
import PedidoModal from '@/Components/HistoriaClinica/modals/PedidoModal/PedidoModal';
import CatalogModal from '@/Components/HistoriaClinica/modals/CatalogModal/CatalogModal';
import RestanteModal from '@/Components/HistoriaClinica/modals/RestanteModal/RestanteModal';
import CerrarParcialModal from '@/Components/HistoriaClinica/modals/CerrarParcialModal/CerrarParcialModal';
import Sidebar from '@/Components/Sidebar/Sidebar';
import { LuActivity, LuBox, LuClipboardList, LuFile, LuFileUp, LuMapPin, LuMenu, LuPill } from 'react-icons/lu';

export default function HistoriaClinicaPage() {
  useEffect(() => {
    const cleanup = initHistoriaClinica();
    return cleanup;
  }, []);

  return (
    <>
<div className="app">

  <Sidebar />

  {/* MAIN */}
  <div className="main">

    {/* TOPBAR */}
    <header className="topbar">
      <LuMenu className="hamburger icon" />
      <div className="breadcrumb">
        <span>Hospitalización</span><span className="sep">/</span>
        <span className="current">Historia Clínica</span>
      </div>
      <div className="spacer"></div>
      <div className="topbar-right">
        <div className="meta-item">
          <LuFile className="icon" />
          <span className="lbl">Especialidad:</span> <b>Oncología</b>
        </div>
        <div className="meta-item">
          <LuMapPin className="icon" />
          <span className="lbl">Área:</span> <b>02-Hospitalización</b>
        </div>
        <div className="divider-v"></div>
        <div className="user-chip">
          <div className="user-avatar">CG</div>
          <div className="who">
            <div className="name">Manuel Hernández</div>
            <div className="role">Médico</div>
          </div>
        </div>
      </div>
    </header>

    <div className="content">
      <PatientBanner />

      {/* CARD: CRONOGRAMA (con tabs de módulo integradas) */}
      <div className="card">
        <div className="card-tabs-bar" role="tablist" aria-label="Secciones de la historia clínica">
          <button type="button" className="card-tab active" role="tab" id="tab-medicamentos" aria-selected="true" aria-controls="panel-medicamentos" tabIndex="0">
            <LuPill className="icon" aria-hidden="true" />
            Gestión de medicamentos
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-ordenes" aria-selected="false" aria-controls="panel-ordenes" tabIndex="-1">
            <LuClipboardList className="icon" aria-hidden="true" />
            Órdenes médicas
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-pedidos" aria-selected="false" aria-controls="panel-pedidos" tabIndex="-1">
            <LuBox className="icon" aria-hidden="true" />
            Pedidos
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-monitoreo" aria-selected="false" aria-controls="panel-medicamentos" tabIndex="-1">
            <LuActivity className="icon" aria-hidden="true" />
            Monitoreo
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-notas" aria-selected="false" aria-controls="panel-medicamentos" tabIndex="-1">
            <LuFileUp className="icon" aria-hidden="true" />
            Notas de enfermería
          </button>
        </div>

        <MedicamentosPanel />
        <PedidosPanel />
        <OrdenesMedicasPanel />
      </div>

    </div>
  </div>
</div>

<Toast />
<DosePopover />
<AdminModal />
<SuspendModal />
<ReturnModal />
<ProgramModal />
<PedidoModal />
<CatalogModal />
<RestanteModal />
<CerrarParcialModal />
    </>
  );
}
