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
import MultiAdminModal from '@/Components/HistoriaClinica/modals/MultiAdminModal/MultiAdminModal';
import SuspendModal from '@/Components/HistoriaClinica/modals/SuspendModal/SuspendModal';
import ReturnModal from '@/Components/HistoriaClinica/modals/ReturnModal/ReturnModal';
import ProgramModal from '@/Components/HistoriaClinica/modals/ProgramModal/ProgramModal';
import PedidoModal from '@/Components/HistoriaClinica/modals/PedidoModal/PedidoModal';
import CatalogModal from '@/Components/HistoriaClinica/modals/CatalogModal/CatalogModal';
import RestanteModal from '@/Components/HistoriaClinica/modals/RestanteModal/RestanteModal';
import CerrarParcialModal from '@/Components/HistoriaClinica/modals/CerrarParcialModal/CerrarParcialModal';
import OrdenDetalleModal from '@/Components/HistoriaClinica/modals/OrdenDetalleModal/OrdenDetalleModal';
import Sidebar from '@/Components/Sidebar/Sidebar';
import UserMenu from '@/Components/UserMenu/UserMenu';
import { LuActivity, LuBox, LuClipboardList, LuFile, LuFileUp, LuMapPin, LuMenu, LuPill } from 'react-icons/lu';

export default function HistoriaClinicaPage() {
  useEffect(() => {
    const cleanup = initHistoriaClinica();
    return cleanup;
  }, []);

  return (
    <>
<div className="app" id="app-shell">

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
        <UserMenu name="Manuel Hernández" role="Médico" initials="CG" />
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
          <button type="button" className="card-tab" role="tab" id="tab-monitoreo" aria-selected="false" tabIndex="-1" disabled aria-disabled="true" title="Próximamente">
            <LuActivity className="icon" aria-hidden="true" />
            Monitoreo
          </button>
          <button type="button" className="card-tab" role="tab" id="tab-notas" aria-selected="false" tabIndex="-1" disabled aria-disabled="true" title="Próximamente">
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
<MultiAdminModal />
<SuspendModal />
<ReturnModal />
<ProgramModal />
<PedidoModal />
<CatalogModal />
<RestanteModal />
<CerrarParcialModal />
<OrdenDetalleModal />
    </>
  );
}
