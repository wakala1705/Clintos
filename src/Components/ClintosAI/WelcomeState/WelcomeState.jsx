import './WelcomeState.css';
import ContextChip from '../ContextChip/ContextChip';

// Estado inicial del panel (STATE 02) — saludo con el nombre del usuario
// activo (mismo `userFirstName` derivado del `user` que ya recibe <Topbar>
// en la página) para que se sienta contextual desde el primer segundo. El
// chip de contexto (STATE 02/08, brief "Contexto dinámico") deja explícito
// si Clintos AI está mirando toda la pantalla o un paciente puntual.
export default function WelcomeState({
  userFirstName, selectedPaciente, screenLabel, onClearPaciente,
}) {
  return (
    <div className="cai-welcome">
      <p className="cai-welcome-greeting">Hola, {userFirstName} 👋</p>
      <p className="cai-welcome-lead">Soy Kora, tu asistente en hospitalización.</p>
      <p className="cai-welcome-support">
        Te ayudo a consultar información, entender datos y realizar tareas dentro de Clintos.
      </p>
      <ContextChip selectedPaciente={selectedPaciente} screenLabel={screenLabel} onClear={onClearPaciente} />
    </div>
  );
}
