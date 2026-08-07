'use client';

import { useEffect } from 'react';
import './gestion-enfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initGestionEnfermeria } from '@/hooks/GestionEnfermeria/legacy-app';
import PatientBanner from '@/Components/GestionEnfermeria/PatientBanner/PatientBanner';
import MedicamentosPanel from '@/Components/GestionEnfermeria/MedicamentosPanel/MedicamentosPanel';
import OrdenesMedicasPanel from '@/Components/GestionEnfermeria/OrdenesMedicasPanel/OrdenesMedicasPanel';
import PedidosPanel from '@/Components/GestionEnfermeria/PedidosPanel/PedidosPanel';
import Toast from '@/Components/GestionEnfermeria/modals/Toast/Toast';
import DosePopover from '@/Components/GestionEnfermeria/modals/DosePopover/DosePopover';
import AdminModal from '@/Components/GestionEnfermeria/modals/AdminModal/AdminModal';
import MultiAdminModal from '@/Components/GestionEnfermeria/modals/MultiAdminModal/MultiAdminModal';
import SuspendModal from '@/Components/GestionEnfermeria/modals/SuspendModal/SuspendModal';
import ReturnModal from '@/Components/GestionEnfermeria/modals/ReturnModal/ReturnModal';
import ProgramModal from '@/Components/GestionEnfermeria/modals/ProgramModal/ProgramModal';
import PedidoModal from '@/Components/GestionEnfermeria/modals/PedidoModal/PedidoModal';
import CatalogModal from '@/Components/GestionEnfermeria/modals/CatalogModal/CatalogModal';
import RestanteModal from '@/Components/GestionEnfermeria/modals/RestanteModal/RestanteModal';
import CerrarParcialModal from '@/Components/GestionEnfermeria/modals/CerrarParcialModal/CerrarParcialModal';
import OrdenDetalleModal from '@/Components/GestionEnfermeria/modals/OrdenDetalleModal/OrdenDetalleModal';
import Sidebar from '@/Components/Sidebar/Sidebar';
import UserMenu from '@/Components/UserMenu/UserMenu';
import { LuActivity, LuBox, LuClipboardList, LuFile, LuFileUp, LuMapPin, LuMenu, LuPill } from 'react-icons/lu';

export default function GestionEnfermeriaPage() {
  useEffect(() => {
    const cleanup = initGestionEnfermeria();
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
        <span className="current">Gestión de Enfermería</span>
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
