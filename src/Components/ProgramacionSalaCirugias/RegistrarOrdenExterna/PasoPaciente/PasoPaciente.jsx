import { LuInfo, LuSearch, LuUserRoundSearch } from 'react-icons/lu';
import './PasoPaciente.css';
import Button from '@/Components/Button/Button';

// Paso 1: el paciente se elige en el buscador de afiliados compartido
// (#ps-overlay de NuevaCitaFlow, el mismo de Programar cita); este paso solo
// dispara ese modal y muestra el afiliado elegido. Al elegirlo se precarga la
// entidad pagadora (se informa con un aviso status-info).
export default function PasoPaciente({ paciente, onBuscarAfiliado }) {
  return (
    <div className="pp-wrap gc-form">
      <div>
        <h2 className="gc-card-titulo">Paciente</h2>
        <p className="gc-card-sub">Busca al afiliado por número de documento o por nombre.</p>
      </div>

      {paciente ? (
        <>
          <div className="pp-card selected pp-elegido">
            <span className="pp-card-cuerpo">
              <span className="pp-nombre">{paciente.nombre}</span>
              <span className="pp-meta">{paciente.tipoDocumento} {paciente.numeroDocumento} · {paciente.edad} años · {paciente.sexo}</span>
              <span className="pp-meta">{paciente.eps} · {paciente.regimen}</span>
            </span>
            <Button variant="secondary" size="sm" icon={LuSearch} onClick={onBuscarAfiliado}>Cambiar paciente</Button>
          </div>
          <p className="gc-aviso" role="status">
            <LuInfo className="icon" aria-hidden="true" />
            <span>
              Entidad precargada desde la afiliación: <strong>{paciente.eps}</strong> · {paciente.regimen} · Contrato {paciente.contrato}.{' '}
              {paciente.ordenesActivas > 0
                ? `El paciente tiene ${paciente.ordenesActivas} orden${paciente.ordenesActivas > 1 ? 'es' : ''} activa${paciente.ordenesActivas > 1 ? 's' : ''}.`
                : 'No tiene otras órdenes activas.'}
            </span>
          </p>
        </>
      ) : (
        <div className="pp-vacio-card">
          <LuUserRoundSearch className="icon" aria-hidden="true" />
          <p>Aún no has seleccionado un paciente.</p>
          <Button icon={LuSearch} onClick={onBuscarAfiliado}>Buscar afiliado</Button>
        </div>
      )}
    </div>
  );
}
