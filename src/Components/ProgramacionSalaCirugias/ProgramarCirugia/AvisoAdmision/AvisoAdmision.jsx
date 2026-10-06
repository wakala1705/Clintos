import { LuInfo } from 'react-icons/lu';
import './AvisoAdmision.css';

// Un paciente ambulatorio (Consulta externa u orden externa) no tiene
// admisión: se crea con los datos de la programación. Internación ya tiene
// una abierta.
export default function AvisoAdmision({ ambulatorio }) {
  return (
    <section className="gc-seccion" aria-labelledby="pc-admision">
      <h3 className="gc-seccion-titulo" id="pc-admision">Admisión</h3>
      <p className="gc-aviso">
        <LuInfo className="icon" aria-hidden="true" />
        <span>
          {ambulatorio
            ? 'El paciente es ambulatorio: la admisión se creará con los datos de esta programación.'
            : 'El paciente está en Internación: no se crea una admisión nueva.'}
        </span>
      </p>
    </section>
  );
}
