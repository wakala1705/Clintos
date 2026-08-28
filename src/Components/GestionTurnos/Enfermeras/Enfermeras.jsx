'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionTurnos.css';
import './Enfermeras.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import GestionTurnosSidebar from '../GestionTurnosSidebar/GestionTurnosSidebar';
import ConfiguracionEnfermeraDrawer from '../ConfiguracionEnfermeraDrawer/ConfiguracionEnfermeraDrawer';
import AgregarEnfermeraModal from './AgregarEnfermeraModal/AgregarEnfermeraModal';
import { TurnoBadge, EstadoConfigBadge } from '../TurnoBadges/TurnoBadges';
import { TIPOS_TURNO_INICIALES } from '@/hooks/GestionTurnos/mockTurnosData';
import {
  AREAS_ENFERMERA, ENFERMERAS_INICIALES, ENFERMERAS_DISPONIBLES, ESTADO_CONFIG_OPTIONS, estadoConfiguracion,
} from '@/hooks/GestionTurnos/mockEnfermerasData';
import { LuPlus, LuSearch } from 'react-icons/lu';

const TURNO_LABEL = Object.fromEntries(TIPOS_TURNO_INICIALES.map((t) => [t.id, t.nombre]));

// Página dedicada "Enfermeras" (encargo sección 4) — lista completa +
// filtros + drawer de configuración individual. Estado 100% local (mismo
// criterio que TiposTurno.jsx): esta pantalla no comparte su copia mutable
// de `enfermeras`/`tiposTurno` con la de Resumen, se remonta fresca en cada
// navegación (ver AGENTS.md, mismo comportamiento que GestionCamas).
export default function Enfermeras() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [tiposTurno] = useState(TIPOS_TURNO_INICIALES);
  const [enfermeras, setEnfermeras] = useState(ENFERMERAS_INICIALES);
  const [disponibles, setDisponibles] = useState(ENFERMERAS_DISPONIBLES);
  const [area, setArea] = useState('todas');
  const [estado, setEstado] = useState('todas');
  const [query, setQuery] = useState('');
  const [enfermeraConfigId, setEnfermeraConfigId] = useState(null);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);

  const opcionesEstado = useMemo(() => ESTADO_CONFIG_OPTIONS.map((f) => ({
    ...f,
    count: f.value === 'todas' ? enfermeras.length : enfermeras.filter((e) => e.estado === f.value).length,
  })), [enfermeras]);

  const enfermerasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enfermeras.filter((e) => {
      if (area !== 'todas' && e.area !== area) return false;
      if (estado !== 'todas' && e.estado !== estado) return false;
      if (q && !e.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [enfermeras, area, estado, query]);

  // Footer de la tabla (encargo): cuenta sobre `enfermerasFiltradas`, no
  // sobre el total del módulo — a diferencia de los chips de Estado (que
  // siempre muestran el universo completo), este resumen refleja lo que la
  // tabla está mostrando ahora mismo, filtros de búsqueda/Área incluidos.
  const resumenTabla = useMemo(() => ({
    total: enfermerasFiltradas.length,
    configuradas: enfermerasFiltradas.filter((e) => e.estado === 'configurada').length,
    pendientes: enfermerasFiltradas.filter((e) => e.estado === 'pendiente').length,
  }), [enfermerasFiltradas]);

  const enfermeraConfig = enfermeraConfigId ? enfermeras.find((e) => e.id === enfermeraConfigId) : null;

  function handleGuardarConfiguracion(enfermeraId, turnosPermitidos) {
    setEnfermeras((prev) => prev.map((e) => (
      e.id === enfermeraId
        ? { ...e, turnosPermitidos, estado: estadoConfiguracion(turnosPermitidos) }
        : e
    )));
    setEnfermeraConfigId(null);
    window.ncToast?.('Turnos permitidos actualizados.');
  }

  function handleAgregarEnfermera(enfermera) {
    setEnfermeras((prev) => [...prev, { ...enfermera, turnosPermitidos: [], estado: 'pendiente' }]);
    setDisponibles((prev) => prev.filter((e) => e.id !== enfermera.id));
    window.ncToast?.(`${enfermera.nombre} agregada a la configuración de turnos.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de turnos', href: '/gestion-turnos' }]}
          page="Enfermeras"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="ct-page-header">
              <div>
                <h1>Enfermeras</h1>
                <p>Configura los turnos permitidos para cada enfermera.</p>
              </div>
              <Button icon={LuPlus} onClick={() => setModalAgregarAbierto(true)}>Agregar enfermera</Button>
            </div>

            <div className="card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar enfermera..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar enfermera"
                  />
                </div>
                <div className="filter-spacer" />
                <SegmentedFilterBar
                  options={opcionesEstado}
                  value={estado}
                  onChange={setEstado}
                  ariaLabel="Filtrar por estado de configuración"
                />
                <AreaSelector label="Área" options={AREAS_ENFERMERA} value={area} onChange={setArea} />
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Enfermera</th>
                      <th>Cargo</th>
                      <th>Área</th>
                      <th>Turnos permitidos</th>
                      <th>Estado</th>
                      <th aria-hidden="true" />
                    </tr>
                  </thead>
                  <tbody>
                    {enfermerasFiltradas.length === 0 ? (
                      <tr><td colSpan={6} className="ct-empty-cell">No se encontraron enfermeras con estos filtros.</td></tr>
                    ) : enfermerasFiltradas.map((e) => (
                      <tr key={e.id}>
                        <td className="cell-primary">{e.nombre}</td>
                        <td className="cell-muted">{e.cargo}</td>
                        <td>{e.areaLabel}</td>
                        <td>
                          {e.turnosPermitidos.length === 0 ? (
                            <span className="cell-muted">—</span>
                          ) : (
                            <div className="ct-turnos-cell">
                              {e.turnosPermitidos.map((tId) => (
                                <TurnoBadge key={tId} turnoId={tId} label={TURNO_LABEL[tId]} />
                              ))}
                            </div>
                          )}
                        </td>
                        <td><EstadoConfigBadge estado={e.estado} /></td>
                        <td className="col-acciones">
                          <Button variant="outline" size="sm" onClick={() => setEnfermeraConfigId(e.id)}>
                            Configurar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {resumenTabla.total > 0 && (
                <div className="ct-table-footer">
                  <b>{resumenTabla.total}</b> {resumenTabla.total === 1 ? 'enfermera' : 'enfermeras'}
                  {' · '}<b>{resumenTabla.configuradas}</b> configuradas
                  {' · '}<b>{resumenTabla.pendientes}</b> pendientes
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {enfermeraConfig && (
        <ConfiguracionEnfermeraDrawer
          enfermera={enfermeraConfig}
          tiposTurno={tiposTurno}
          onClose={() => setEnfermeraConfigId(null)}
          onGuardar={handleGuardarConfiguracion}
        />
      )}

      {modalAgregarAbierto && (
        <AgregarEnfermeraModal
          disponibles={disponibles}
          onAgregar={handleAgregarEnfermera}
          onClose={() => setModalAgregarAbierto(false)}
        />
      )}
    </div>
  );
}
