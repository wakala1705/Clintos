'use client';

import { useEffect, useRef, useState } from 'react';
import './solicitud-consumo.css';
import '@/Components/SolicitudConsumo/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import ReposicionesCard from '@/Components/SolicitudConsumo/ReposicionesCard/ReposicionesCard';
import DetalleModal from '@/Components/SolicitudConsumo/modals/DetalleModal/DetalleModal';
import CabeceraModal from '@/Components/SolicitudConsumo/modals/CabeceraModal/CabeceraModal';
import ArticulosModal from '@/Components/SolicitudConsumo/modals/ArticulosModal/ArticulosModal';
import EliminarModal from '@/Components/SolicitudConsumo/modals/EliminarModal/EliminarModal';
import { INITIAL_REPOSICIONES, TIPOS_ARTICULO } from '@/hooks/SolicitudConsumo/mockSolicitudConsumoData';

// Ruta /solicitud-consumo: card maestra de reposiciones (ReposicionesCard) +
// el flujo de 2 pasos para crear una solicitud nueva (CabeceraModal ->
// ArticulosModal) + edición/detalle/eliminación de una existente. Todo el
// estado de negocio vive acá (mock en memoria, sin backend — igual que el
// resto del aplicativo) y baja como props; los modales son controlados
// (open + callbacks), sin lógica de datos propia salvo el carrito efímero de
// ArticulosModal — ver su comentario.
export default function SolicitudConsumo() {
  const [repos, setRepos] = useState(INITIAL_REPOSICIONES);
  const [selectedId, setSelectedId] = useState('REP-000482');
  const [detalleId, setDetalleId] = useState(null);
  const [eliminarRepId, setEliminarRepId] = useState(null);
  const [cabeceraOpen, setCabeceraOpen] = useState(false);
  const [tipoArticuloNuevo, setTipoArticuloNuevo] = useState(TIPOS_ARTICULO[0]);
  const [articulosOpen, setArticulosOpen] = useState(false);
  const [articulosMode, setArticulosMode] = useState('nuevo');
  const [articulosRepId, setArticulosRepId] = useState(null);
  const nextNumRef = useRef(488);

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const detalleRep = repos.find((r) => r.id === detalleId) || null;
  const articulosRep = repos.find((r) => r.id === articulosRepId) || null;

  function handleNuevo() {
    setTipoArticuloNuevo(TIPOS_ARTICULO[0]);
    setCabeceraOpen(true);
  }

  function handleCabeceraContinuar() {
    setCabeceraOpen(false);
    setArticulosMode('nuevo');
    setArticulosRepId(null);
    setArticulosOpen(true);
  }

  function handleEditar(id) {
    setArticulosMode('editar');
    setArticulosRepId(id);
    setArticulosOpen(true);
  }

  function handleArticulosBack() {
    setArticulosOpen(false);
    setCabeceraOpen(true);
  }

  function handleEliminarConfirm() {
    setRepos((prev) => prev.filter((r) => r.id !== eliminarRepId));
    if (selectedId === eliminarRepId) setSelectedId(null);
    if (detalleId === eliminarRepId) setDetalleId(null);
    setEliminarRepId(null);
  }

  function handleSubmitArticulos(payload) {
    if (payload.mode === 'editar') {
      setRepos((prev) => prev.map((r) => (r.id === payload.repId ? { ...r, articulos: payload.items } : r)));
      setSelectedId(payload.repId);
    } else {
      const num = nextNumRef.current++;
      const id = 'REP-0004' + num;
      const now = new Date();
      const fecha = now.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' · ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
      const nuevo = {
        id,
        bodega: 'Consulta Externa · Piso 2',
        bodegaDespacha: 'BI · Bodega Piso 11 Torre 3 Oncomed',
        cns: 'CNS-' + (77340 + num),
        procedencia: 'Manual',
        usuario: 'M. Hernández',
        fecha,
        estado: { text: 'Pendiente por confirmar', cls: 'amber' },
        tipoArticulo: payload.tipoArticulo,
        articulos: payload.items,
      };
      setRepos((prev) => [nuevo, ...prev]);
      setSelectedId(id);
    }
    setArticulosOpen(false);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Consulta Externa"
          page="Solicitud de consumo"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="page-head">
            <div>
              <h1>Solicitud de consumo</h1>
              <p>Solicita insumos para consumo asistencial y gestiona la reposición desde bodega.</p>
            </div>
            <div className="filters">
              <div className="select-field">
                <label>Bodega</label>
                <select defaultValue="03 · Consumo">
                  <option>03 · Consumo</option>
                  <option>01 · Central</option>
                  <option>02 · Farmacia</option>
                  <option>04 · Insumos médicos</option>
                </select>
              </div>
              <div className="select-field">
                <label>Tipo de artículo</label>
                <select defaultValue="Todos los artículos">
                  <option>Todos los artículos</option>
                  <option>Dispositivos médicos</option>
                  <option>Insumos asistenciales</option>
                  <option>Medicamentos</option>
                </select>
              </div>
            </div>
          </div>

          <ReposicionesCard
            repos={repos}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNuevo={handleNuevo}
            onVerDetalle={setDetalleId}
            onEditar={handleEditar}
            onEliminar={setEliminarRepId}
          />
        </div>
      </div>

      <DetalleModal
        open={detalleId !== null}
        rep={detalleRep}
        onClose={() => setDetalleId(null)}
        onCancelarPedido={setEliminarRepId}
      />

      <CabeceraModal
        open={cabeceraOpen}
        tipoArticulo={tipoArticuloNuevo}
        onChangeTipoArticulo={setTipoArticuloNuevo}
        onCancel={() => setCabeceraOpen(false)}
        onContinuar={handleCabeceraContinuar}
      />

      {articulosOpen && (
        <ArticulosModal
          mode={articulosMode}
          rep={articulosRep}
          tipoArticuloNuevo={tipoArticuloNuevo}
          onBack={handleArticulosBack}
          onClose={() => setArticulosOpen(false)}
          onSubmit={handleSubmitArticulos}
        />
      )}

      <EliminarModal
        open={eliminarRepId !== null}
        repId={eliminarRepId}
        onCancel={() => setEliminarRepId(null)}
        onConfirm={handleEliminarConfirm}
      />
    </div>
  );
}
