import './WelcomeState.css';

// Estado inicial del panel (STATE 02) — saludo con el nombre del usuario
// activo (mismo `userFirstName` derivado del `user` que ya recibe <Topbar>
// en la página) para que se sienta contextual desde el primer segundo.
export default function WelcomeState({ userFirstName }) {
  return (
    <div className="cai-welcome">
      <p className="cai-welcome-greeting">Hola, {userFirstName} 👋</p>
      <p className="cai-welcome-lead">Soy Clintos AI, tu asistente en hospitalización.</p>
      <p className="cai-welcome-support">
        Te ayudo a consultar información, entender datos y realizar tareas dentro de Clintos.
      </p>
    </div>
  );
}
