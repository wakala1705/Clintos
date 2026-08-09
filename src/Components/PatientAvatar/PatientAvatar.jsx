import './PatientAvatar.css';

// Avatar de paciente global (usado por Lista de Pacientes, Ficha del
// paciente y PatientBanner) — el color de fondo es único y neutral para
// TODOS los pacientes, ver PatientAvatar.css. Antes cada paciente tenía un
// color asignado al azar (mockPatientsData.js AVATAR_COLORS + seededRandom),
// sin ningún criterio semántico: generaba falsos patrones visuales entre
// pacientes sin relación y competía con los tokens de estado clínico, donde
// el color sí significa algo (aislamiento, alergia...). La diferenciación
// entre pacientes queda dada solo por las iniciales.
// El tamaño/tipografía los sigue definiendo la clase que pasa cada caller
// (.lp-avatar, .fp-avatar, .patient-avatar...) vía `className` — esta
// clase compartida solo fija color+forma para centralizar el criterio.
export default function PatientAvatar({ iniciales, className = '' }) {
  return (
    <span className={`patient-avatar-badge ${className}`.trim()}>
      {iniciales}
    </span>
  );
}
