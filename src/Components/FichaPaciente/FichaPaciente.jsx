'use client';

import { useEffect, useRef, useState } from 'react';
import './FichaPaciente.css';
import './shared/shared.css';
import { getPatientDetail, updatePatientFromWizardData } from '@/hooks/FichaPaciente/mockPatientDetail';
import { updatePatientEstado } from '@/hooks/ListaPacientes/mockPatientsData';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import {
  CURRENT_USER_ROLE,
  canEditPatient,
  canInactivatePatient,
  canScheduleAppointment,
  canViewHistoriaClinica,
} from '@/hooks/ListaPacientes/permissions';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import FichaHeader from '@/Components/FichaPaciente/FichaHeader/FichaHeader';
import FichaNav from '@/Components/FichaPaciente/FichaNav/FichaNav';
import FichaSkeleton from '@/Components/FichaPaciente/FichaSkeleton/FichaSkeleton';
import FichaNotFound from '@/Components/FichaPaciente/FichaNotFound/FichaNotFound';
import SectionCard from '@/Components/FichaPaciente/SectionCard/SectionCard';
import FieldList from '@/Components/FichaPaciente/FieldList/FieldList';
import AfiliacionSection from '@/Components/FichaPaciente/AfiliacionSection/AfiliacionSection';
import DocumentosSection from '@/Components/FichaPaciente/DocumentosSection/DocumentosSection';
import AuditoriaSection from '@/Components/FichaPaciente/AuditoriaSection/AuditoriaSection';
import { LuFileText, LuHistory, LuMapPin, LuShieldCheck, LuUser, LuUsers } from 'react-icons/lu';

const SECTIONS = [
  { id: 'datos-basicos', label: 'Datos básicos', icon: LuUser },
  { id: 'afiliacion', label: 'Afiliación', icon: LuShieldCheck },
  { id: 'ubicacion', label: 'Ubicación', icon: LuMapPin },
  { id: 'clasificacion', label: 'Clasificación socioeconómica', icon: LuUsers },
  { id: 'documentos', label: 'Documentos', icon: LuFileText },
  { id: 'auditoria', label: 'Auditoría', icon: LuHistory },
];

// TODO: no existe todavía un permiso específico "ver ficha completa" — se
// reutilizan los mismos helpers de permissions.js que ya usa Lista de
// Pacientes (no se duplica la lógica). Cuando el proyecto tenga roles reales,
// definir aquí quién puede ENTRAR a esta pantalla (hoy: cualquiera que vea la
// fila en la lista puede abrir la ficha).
export default function FichaPaciente({ id }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error | not-found
  const [patient, setPatient] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getPatientDetail(id)
      .then((detail) => {
        if (cancelled) return;
        if (!detail) { setStatus('not-found'); return; }
        setPatient(detail);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [id, reloadToken]);

  function reload() {
    setStatus('loading');
    setReloadToken((t) => t + 1);
  }

  // Mismo puente getPatient/setPatient que exige initNuevaCita — aquí "el
  // paciente activo" solo importa para el flujo de agendamiento disparado
  // desde el botón "Agendar cita" del header.
  const nuevaCitaPatientRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    const cleanupNuevaCita = initNuevaCita({
      getPatient: () => nuevaCitaPatientRef.current,
      setPatient: (p) => { nuevaCitaPatientRef.current = p; },
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
  }, []);

  // Optional chaining (patient?.x) es intencional aunque estos handlers solo
  // se disparan con status==='ready' (patient ya presente): el React
  // Compiler memoiza estas funciones evaluando patient?.nombre como
  // "dependencia" en CADA render (no perezosamente, solo al hacer clic), así
  // que con `patient.nombre` sin el "?" revienta en el primer render, cuando
  // patient todavía es null — antes de que el guard de status importe.
  function handleHistoriaClinica() {
    window.ncToast?.(`Historia clínica de ${patient?.nombre} (en desarrollo).`);
  }

  function handleAgendarCita() {
    nuevaCitaPatientRef.current = { nombre: patient?.nombre, documento: patient?.documento, eps: patient?.eps };
    window.ncOpen();
  }

  // Reabre el mismo wizard de 4 pasos que "Agregar paciente" (ap-overlay),
  // precargado con los datos de este paciente — ver apOpenEditExternal() en
  // legacy-nueva-cita.js. Al guardar, actualiza el mismo PATIENTS que
  // alimenta Lista de Pacientes (mockPatientsData.js) y recarga la ficha.
  function handleEditar() {
    window.apOpenEditExternal?.(patient?.formData, {
      titulo: patient?.nombre,
      subtitulo: `Documento ${patient?.documento}`,
      onSave: (datosFormulario) => {
        updatePatientFromWizardData(id, datosFormulario);
        reload();
      },
    });
  }

  function handleInactivar() {
    if (!window.confirm(`¿Inactivar a ${patient?.nombre}? El paciente no se elimina, solo cambia de estado.`)) return;
    updatePatientEstado(id, 'inactivo');
    window.ncToast?.(`${patient?.nombre} fue inactivado.`);
    reload();
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Consulta Externa', { label: 'Lista de Pacientes', href: '/lista-pacientes' }]}
          page="Ficha de paciente"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content fp-content">
          {status === 'loading' && <FichaSkeleton />}

          {status === 'not-found' && <FichaNotFound variant="not-found" />}
          {status === 'error' && <FichaNotFound variant="error" onRetry={reload} />}

          {status === 'ready' && patient && (
            <>
              <FichaHeader
                patient={patient}
                canViewHistoria={canViewHistoriaClinica(CURRENT_USER_ROLE)}
                canScheduleAppointment={canScheduleAppointment(CURRENT_USER_ROLE)}
                canEdit={canEditPatient(CURRENT_USER_ROLE)}
                canInactivate={canInactivatePatient(CURRENT_USER_ROLE)}
                onHistoriaClinica={handleHistoriaClinica}
                onAgendarCita={handleAgendarCita}
                onEditar={handleEditar}
                onInactivar={handleInactivar}
              />

              <div className="fp-body">
                <FichaNav sections={SECTIONS} />

                <div className="fp-sections">
                  <SectionCard id="datos-basicos" icon={LuUser} title="Datos básicos" description="Identidad del paciente">
                    <FieldList
                      columns={3}
                      fields={[
                        { label: 'Tipo de documento', value: patient.tipoDocumento },
                        { label: 'Número de documento', value: patient.documento },
                        { label: 'Documento Id.', value: patient.formData.documentoId },
                        { label: 'Primer nombre', value: patient.formData.primerNombre },
                        { label: 'Segundo nombre', value: patient.formData.segundoNombre },
                        { label: 'Primer apellido', value: patient.formData.primerApellido },
                        { label: 'Segundo apellido', value: patient.formData.segundoApellido },
                        { label: 'Fecha de nacimiento', value: patient.fechaNacimiento },
                        { label: 'Edad', value: `${patient.edad} años` },
                        { label: 'País de origen', value: patient.formData.paisOrigen },
                        { label: 'Ciudad de nacimiento', value: patient.formData.ciudadNacimiento },
                        { label: 'Ciudad de expedición', value: patient.formData.ciudadExpedicion },
                        { label: 'Sexo', value: patient.sexo },
                        { label: 'Género', value: patient.formData.genero },
                        { label: 'Estado civil', value: patient.formData.estadoCivil },
                        { label: 'Grupo sanguíneo', value: patient.formData.grupoSanguineo },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    id="afiliacion"
                    icon={LuShieldCheck}
                    title="Afiliación"
                    description="EPS, tipo de afiliado y estado — historizada por período de vigencia"
                  >
                    <AfiliacionSection actual={patient.afiliacionActual} anteriores={patient.afiliacionesAnteriores} />
                  </SectionCard>

                  <SectionCard id="ubicacion" icon={LuMapPin} title="Ubicación" description="Dirección y datos de contacto">
                    <FieldList
                      columns={3}
                      fields={[
                        { label: 'Dirección de residencia', value: patient.ubicacion.direccion },
                        { label: 'Zona', value: patient.ubicacion.zona },
                        { label: 'Zona postal', value: patient.ubicacion.zonaPostal },
                        { label: 'Ciudad', value: patient.ubicacion.ciudad },
                        { label: 'Localidad', value: patient.ubicacion.localidad },
                        { label: 'Celular', value: patient.ubicacion.celular },
                        { label: 'Teléfono residencia', value: patient.ubicacion.telefonoResidencia },
                        { label: 'Teléfono laboral', value: patient.ubicacion.telefonoLaboral },
                        { label: 'Correo electrónico', value: patient.ubicacion.correo },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    id="clasificacion"
                    icon={LuUsers}
                    title="Clasificación socioeconómica"
                    description="Variables poblacionales / RIPS"
                  >
                    <FieldList
                      columns={3}
                      fields={[
                        { label: 'Grupo poblacional', value: patient.clasificacion.grupoPoblacional },
                        { label: 'Tipo de discapacidad', value: patient.clasificacion.tipoDiscapacidad },
                        { label: 'Incapacidad', value: patient.clasificacion.incapacidad },
                        { label: 'Nivel socioeconómico', value: patient.clasificacion.nivelSocioeconomico },
                        { label: 'Grupo étnico', value: patient.clasificacion.grupoEtnico },
                        { label: 'Raza', value: patient.clasificacion.raza },
                        { label: 'Nivel educativo', value: patient.clasificacion.nivelEducativo },
                        { label: 'Ocupación', value: patient.clasificacion.ocupacion },
                        { label: 'Religión', value: patient.clasificacion.religion },
                        { label: 'Víctima de conflicto', value: patient.clasificacion.victimaConflicto },
                        { label: 'Situación de desplazamiento', value: patient.clasificacion.situacionDesplazamiento },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    id="documentos"
                    icon={LuFileText}
                    title="Documentos"
                    description="Alcance administrativo — documentos clínicos en Historia Clínica"
                  >
                    <DocumentosSection documentos={patient.documentos} />
                  </SectionCard>

                  <SectionCard id="auditoria" icon={LuHistory} title="Auditoría" description="Eventos sobre este registro">
                    <AuditoriaSection eventos={patient.auditoria} />
                  </SectionCard>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <NuevaCitaFlow />
    </div>
  );
}
