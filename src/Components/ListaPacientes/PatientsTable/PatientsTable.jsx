import './PatientsTable.css';
import RowActionsMenu from './RowActionsMenu/RowActionsMenu';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import { calcularEdad } from '@/hooks/ListaPacientes/mockPatientsData';
import { LuCalendarPlus, LuEye, LuFileText } from 'react-icons/lu';

const ESTADO_LABEL = { activo: 'Activo', inactivo: 'Inactivo' };

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset — se
// renderizan ambas y la CSS decide cuál mostrar según el ancho (ver
// PatientsTable.css), así que no hay dos fuentes de verdad para las mismas
// filas.
export default function PatientsTable({
  patients,
  showSede,
  canViewHistoria,
  canScheduleAppointment,
  canEdit,
  canInactivate,
  onVerFicha,
  onHistoriaClinica,
  onAgendarCita,
  onEditar,
  onInactivar,
}) {
  return (
    <>
      <div className="lp-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Documento</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Asegurador</th>
              <th>Estado</th>
              <th>Celular</th>
              {showSede && <th>Sede</th>}
              <th className="lp-th-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="lp-patient-cell">
                    <PatientAvatar iniciales={p.iniciales} className="lp-avatar" />
                    <span className="lp-pname">{p.nombre}</span>
                  </div>
                </td>
                <td>{p.tipoDocumento} {p.documento}</td>
                <td>{calcularEdad(p.fechaNacimiento)} años</td>
                <td>{p.sexo}</td>
                <td>{p.eps}</td>
                <td><span className={`estado-badge ${p.estado}`}><span className="dot"></span>{ESTADO_LABEL[p.estado]}</span></td>
                <td>{p.celular}</td>
                {showSede && <td>{p.sede}</td>}
                <td>
                  <div className="lp-row-actions">
                    <button type="button" className="lp-row-action-btn" onClick={() => onVerFicha(p)} aria-label="Ver ficha completa" title="Ver ficha completa">
                      <LuEye className="icon" />
                    </button>
                    {canViewHistoria && (
                      <button type="button" className="lp-row-action-btn" onClick={() => onHistoriaClinica(p)} aria-label="Ir a historia clínica" title="Ir a historia clínica">
                        <LuFileText className="icon" />
                      </button>
                    )}
                    {canScheduleAppointment && (
                      <button type="button" className="lp-row-action-btn" onClick={() => onAgendarCita(p)} aria-label="Agendar cita" title="Agendar cita">
                        <LuCalendarPlus className="icon" />
                      </button>
                    )}
                    <RowActionsMenu
                      canEdit={canEdit}
                      canInactivate={canInactivate && p.estado === 'activo'}
                      onEditar={() => onEditar(p)}
                      onInactivar={() => onInactivar(p)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lp-cards">
        {patients.map((p) => (
          <div className="lp-card" key={p.id}>
            <div className="lp-card-top">
              <PatientAvatar iniciales={p.iniciales} className="lp-avatar" />
              <div className="lp-card-id">
                <div className="lp-pname">{p.nombre}</div>
                <div className="lp-card-doc">{p.tipoDocumento} {p.documento}</div>
              </div>
              <span className={`estado-badge ${p.estado}`}><span className="dot"></span>{ESTADO_LABEL[p.estado]}</span>
            </div>
            <div className="lp-card-meta">
              <span>{calcularEdad(p.fechaNacimiento)} años · {p.sexo}</span>
              <span>{p.eps}</span>
            </div>
            <div className="lp-card-actions">
              <button type="button" className="btn btn-secondary" onClick={() => onVerFicha(p)}>
                <LuEye className="icon" />Ver ficha
              </button>
              {canScheduleAppointment && (
                <button type="button" className="btn btn-primary" onClick={() => onAgendarCita(p)}>
                  <LuCalendarPlus className="icon" />Agendar
                </button>
              )}
              <RowActionsMenu
                canEdit={canEdit}
                canInactivate={canInactivate && p.estado === 'activo'}
                onEditar={() => onEditar(p)}
                onInactivar={() => onInactivar(p)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
