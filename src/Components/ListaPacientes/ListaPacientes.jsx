'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import './ListaPacientes.css';
import { fetchPatients, updatePatientEstado, calcularEdad } from '@/hooks/ListaPacientes/mockPatientsData';
import { getPatientDetail, updatePatientFromWizardData } from '@/hooks/FichaPaciente/mockPatientDetail';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import {
  CURRENT_USER_ROLE,
  canEditPatient,
  canInactivatePatient,
  canScheduleAppointment,
  canViewHistoriaClinica,
  canViewSede,
} from '@/hooks/ListaPacientes/permissions';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import ActionsBar from '@/Components/ListaPacientes/ActionsBar/ActionsBar';
import FiltersRow from '@/Components/ListaPacientes/FiltersRow/FiltersRow';
import PatientsTable from '@/Components/ListaPacientes/PatientsTable/PatientsTable';
import PatientsTableSkeleton from '@/Components/ListaPacientes/PatientsTableSkeleton/PatientsTableSkeleton';
import PatientsEmptyState from '@/Components/ListaPacientes/PatientsEmptyState/PatientsEmptyState';
import Pagination from '@/Components/ListaPacientes/Pagination/Pagination';
import { LuDownload, LuUserPlus } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

const PAGE_SIZE = 10;
const SORT_BY = 'apellido';
const EMPTY_FILTERS = { estado: '', eps: '', sexo: '', rangoEdad: '', sede: '' };

// TODO: reemplazar por la sede real del usuario logueado (ver permissions.js
// — hoy el proyecto no tiene sesión/auth). Solo se usa cuando el rol actual
// no tiene visión multisede, para simular la restricción server-side.
const MOCK_CURRENT_USER_SEDE = 'Sede Norte';

export default function ListaPacientes() {
  const router = useRouter();
  const showSede = canViewSede(CURRENT_USER_ROLE);
  const sedeRestriction = showSede ? null : MOCK_CURRENT_USER_SEDE;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  // Empujarlo hace que el efecto de carga (abajo) se repita sin agregar una
  // función "loadPatients" separada que un efecto tendría que invocar — eso
  // es justo el patrón que dispara la regla `react-hooks/set-state-in-effect`
  // (setState síncrono dentro del cuerpo del efecto). Ver "Reintentar" e
  // handleInactivar más abajo.
  const [reloadToken, setReloadToken] = useState(0);

  // Búsqueda en tiempo real, pero con debounce de ~300ms para no golpear el
  // backend en cada tecla — filtra por nombre (parcial, sin tildes/mayúsculas)
  // y por documento, ver normalize()/fetchPatients() en mockPatientsData.js.
  // setStatus/setPage/setDebouncedQuery se disparan dentro del callback del
  // setTimeout (asíncrono), no de forma síncrona en el cuerpo del efecto.
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('loading');
      setPage(1);
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Único efecto que golpea el backend (mock). No hace ningún setState
  // síncrono en su cuerpo — todo pasa dentro de los callbacks then/catch de
  // la promesa, que corren de forma asíncrona.
  useEffect(() => {
    let cancelled = false;
    fetchPatients({
      query: debouncedQuery,
      filters,
      sortBy: SORT_BY,
      page,
      pageSize: PAGE_SIZE,
      sedeRestriction,
    })
      .then(({ items, total: totalCount }) => {
        if (cancelled) return;
        setPatients(items);
        setTotal(totalCount);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [debouncedQuery, filters, page, sedeRestriction, reloadToken]);

  // Dispara una recarga manual (botón "Reintentar" del estado de error, o
  // después de inactivar un paciente) — se llama siempre desde manejadores
  // de evento, así que puede marcar "loading" de una vez sin infringir la
  // regla de arriba (esa regla solo aplica a setState dentro de efectos).
  function reloadPatients() {
    setStatus('loading');
    setReloadToken((t) => t + 1);
  }

  // El flujo compartido "Nueva cita"/"Agregar paciente" (ver AGENTS.md) vive
  // en NuevaCitaFlow — este ref es solo el punto de enganche que le exige
  // initNuevaCita para saber "para quién" es la cita cuando se dispara desde
  // una fila (no hay banner de paciente activo en esta pantalla).
  const nuevaCitaPatientRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => nuevaCitaPatientRef.current,
      setPatient: (patient) => { nuevaCitaPatientRef.current = patient; },
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
  }, []);

  function handleChangeFilter(key, value) {
    setStatus('loading');
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleChangePage(newPage) {
    setStatus('loading');
    setPage(newPage);
  }

  function handleClearFilters() {
    setStatus('loading');
    setPage(1);
    setQuery('');
    setDebouncedQuery('');
    setFilters(EMPTY_FILTERS);
  }

  function handleVerFicha(patient) {
    router.push(`/pacientes/${patient.id}`);
  }

  function handleHistoriaClinica(patient) {
    window.ncToast?.(`Historia clínica de ${patient.nombre} (en desarrollo).`);
  }

  function handleAgendarCita(patient) {
    // ncOpen() exige un paciente activo — se lo pasamos vía el mismo puente
    // getPatient/setPatient que usa el resto del flujo (ver arriba).
    nuevaCitaPatientRef.current = {
      nombre: patient.nombre,
      documento: patient.documento,
      eps: patient.eps,
    };
    window.ncOpen();
  }

  function handleEditar(patient) {
    // Mismo wizard de 4 pasos que "Agregar paciente" (ap-overlay), en modo
    // edición "externo" — ver apOpenEditExternal() en legacy-nueva-cita.js y
    // FichaPaciente.jsx (Ver ficha completa usa el mismo mecanismo). Evita
    // duplicar el formulario solo porque este dataset (mockPatientsData.js)
    // no es el mismo array interno que usa AsignaciónCitas/ProgramarCita.
    getPatientDetail(patient.id).then((detail) => {
      if (!detail) return;
      window.apOpenEditExternal?.(detail.formData, {
        titulo: detail.nombre,
        subtitulo: `Documento ${detail.documento}`,
        onSave: (datosFormulario) => {
          updatePatientFromWizardData(patient.id, datosFormulario);
          reloadPatients();
        },
      });
    });
  }

  function handleInactivar(patient) {
    if (!window.confirm(`¿Inactivar a ${patient.nombre}? El paciente no se elimina, solo cambia de estado.`)) return;
    updatePatientEstado(patient.id, 'inactivo');
    window.ncToast?.(`${patient.nombre} fue inactivado.`);
    reloadPatients();
  }

  function handleExport() {
    // Exporta el resultado actualmente filtrado (no la base completa) — se
    // vuelve a pedir sin límite de página para incluir todas las coincidencias,
    // no solo la página visible. CSV (se abre directo en Excel); un export a
    // PDF real necesitaría una librería de generación de PDF — TODO.
    fetchPatients({
      query: debouncedQuery,
      filters,
      sortBy: SORT_BY,
      page: 1,
      pageSize: total || PAGE_SIZE,
      sedeRestriction,
    }).then(({ items }) => {
      const header = ['Nombre', 'Tipo documento', 'Documento', 'Edad', 'Sexo', 'Asegurador', 'Estado', 'Celular', 'Sede'];
      const rows = items.map((p) => [
        p.nombre, p.tipoDocumento, p.documento, calcularEdad(p.fechaNacimiento), p.sexo, p.eps,
        p.estado === 'activo' ? 'Activo' : 'Inactivo', p.celular, p.sede,
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pacientes.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const hasActiveFilters = Boolean(debouncedQuery) || Object.values(filters).some(Boolean);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Consulta Externa"
          page="Lista de Pacientes"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="lp-page-header">
            <div>
              <h1>Lista de pacientes</h1>
              <p>Consulta, filtra y gestiona la información de tus pacientes.</p>
            </div>
            <div className="lp-page-header-actions">
              <Button variant="secondary" icon={LuDownload} onClick={handleExport}>
                Exportar
              </Button>
              <Button icon={LuUserPlus} onClick={() => window.apOpen()}>
                Agregar paciente
              </Button>
            </div>
          </div>

          <div className="lp-card-shell">
            <div className="lp-toolbar">
              <ActionsBar query={query} onQueryChange={setQuery} />

              <FiltersRow
                filters={filters}
                onChangeFilter={handleChangeFilter}
                showSede={showSede}
              />
            </div>

            {status === 'loading' && <PatientsTableSkeleton columns={showSede ? 8 : 7} />}

            {status === 'error' && (
              <PatientsEmptyState variant="error" onPrimaryAction={reloadPatients} />
            )}

            {status === 'ready' && total === 0 && (
              <PatientsEmptyState
                variant={hasActiveFilters ? 'no-results' : 'empty'}
                onPrimaryAction={hasActiveFilters ? handleClearFilters : () => window.apOpen()}
              />
            )}

            {status === 'ready' && total > 0 && (
              <>
                <PatientsTable
                  patients={patients}
                  showSede={showSede}
                  canViewHistoria={canViewHistoriaClinica(CURRENT_USER_ROLE)}
                  canScheduleAppointment={canScheduleAppointment(CURRENT_USER_ROLE)}
                  canEdit={canEditPatient(CURRENT_USER_ROLE)}
                  canInactivate={canInactivatePatient(CURRENT_USER_ROLE)}
                  onVerFicha={handleVerFicha}
                  onHistoriaClinica={handleHistoriaClinica}
                  onAgendarCita={handleAgendarCita}
                  onEditar={handleEditar}
                  onInactivar={handleInactivar}
                />
                <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChangePage={handleChangePage} />
              </>
            )}
          </div>
        </div>
      </div>

      <NuevaCitaFlow />
    </div>
  );
}
