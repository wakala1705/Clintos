'use client';

import { useEffect } from 'react';
import './AtencionEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initGestionEnfermeria } from '@/hooks/GestionEnfermeria/legacy-app';
import PatientBanner from '@/Components/PatientBanner/PatientBanner';
import MedicamentosPanel from '@/Components/GestionEnfermeria/MedicamentosPanel/MedicamentosPanel';
import OrdenesMedicasPanel from '@/Components/GestionEnfermeria/OrdenesMedicasPanel/OrdenesMedicasPanel';
import PedidosPanel from '@/Components/GestionEnfermeria/PedidosPanel/PedidosPanel';
import Monitoreo from '@/Components/GestionEnfermeria/Monitoreo/Monitoreo';
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
import Topbar from '@/Components/Topbar/Topbar';
import { LuActivity, LuBox, LuClipboardList, LuFile, LuFileUp, LuMapPin, LuPill } from 'react-icons/lu';

// Atención de enfermería a UN paciente (Medicamentos/Órdenes/Pedidos, ver
// tabs abajo) — vivía en /gestion-enfermeria a secas; ahora que esa ruta es
// el Panel General (lista de pacientes del piso, ver
// src/Components/GestionEnfermeria/PanelGeneral/), esta pantalla se movió a
// /gestion-enfermeria/atencion/[id] (mismo patrón que
// /historia-clinica/atencion/[id] → AtencionPaciente.jsx). `id` se acepta
// por consistencia de ruta (así cada paciente del Panel General navega a su
// propia URL) pero todavía no selecciona datos por paciente — el resto de
// esta pantalla (PatientBanner, MEDS, timeline...) sigue viniendo de datos
// de ejemplo fijos, igual que antes del split; conectar `id` a datos reales
// por paciente queda para cuando este módulo deje de ser un mock.
export default function AtencionEnfermeria({ id }) {
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

    <Topbar
      section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
      page="Atención de enfermería"
      user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
    >
      <div className="meta-item">
        <LuFile className="icon" />
        <span className="lbl">Especialidad:</span> <b>Oncología</b>
      </div>
      <div className="meta-item">
        <LuMapPin className="icon" />
        <span className="lbl">Área:</span> <b>02-Hospitalización</b>
      </div>
    </Topbar>

    <div className="content">
      <PatientBanner
        patient={{
          iniciales: 'ID',
          nombre: 'Isabella Daniela Rodríguez Paternina',
          documento: '1234567890',
          edad: '34 años 10 meses 14 días',
          sexo: 'Femenino',
          eps: 'Salud Total Entidad Promotora de Salud del Régimen Contributivo y del Régimen S',
          ciudad: 'Bogotá D.C.',
          direccion: 'Calle 134 # 45-12, Apto 601',
          telefono: '310 842 9173',
          email: 'isabella.rodriguez@example.com',
          allergies: [
            { name: 'Penicilina', reaction: 'Reacción cutánea moderada' },
            { name: 'Mariscos', reaction: 'Anafilaxia leve' },
          ],
        }}
        secondRow={[
          { label: 'Admisión', value: '0200265899' },
          { label: 'N° contrato', value: '** No Especificado **' },
          { label: 'ID Contrato', value: '197' },
          { label: 'Cama', value: '305' },
          { label: 'Estado', value: <span className="badge status-active badge-dot-inline"><span className="dot"></span>Activo</span> },
        ]}
      />

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
          <button type="button" className="card-tab" role="tab" id="tab-monitoreo" aria-selected="false" aria-controls="panel-monitoreo" tabIndex="-1">
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
        <Monitoreo />
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
