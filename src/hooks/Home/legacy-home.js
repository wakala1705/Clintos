// Home no tiene lógica de negocio propia (solo navega a otros módulos vía
// <Link>), pero comparte el mismo Sidebar/topbar chrome que Historia Clínica
// y Asignación de Citas, cuyos botones de tema/colapsar resuelven
// window.toggleTheme / window.toggleSidebar / window.toggleNavGroup vía
// onClick={() => window.fn()} (ver Sidebar.jsx). Este hook solo expone esas
// mismas funciones — sin el resto del estado de esos otros módulos — para que
// el chrome compartido funcione igual aquí.
export function initHome() {

  function applyTheme(dark){
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.getElementById('theme-switch').checked = dark;
  }
  function toggleTheme(){
    applyTheme(document.getElementById('theme-switch').checked);
  }
  function toggleThemeFromIcon(){
    const chk = document.getElementById('theme-switch');
    applyTheme(!chk.checked);
  }

  // Mismo comportamiento responsive que Historia Clínica (ver
  // applySidebarAutoState en src/hooks/HistoriaClinica/legacy-app.js): por
  // debajo de 1024px el sidebar se auto-colapsa al riel de íconos, salvo que
  // el usuario ya lo haya togglado a mano.
  const SIDEBAR_AUTO_BREAKPOINT = 1024;
  let sidebarUserOverride = null;
  function applySidebarAutoState(){
    const sidebar = document.getElementById('sidebar');
    if(!sidebar) return;
    const shouldCollapse = sidebarUserOverride !== null ? sidebarUserOverride : window.innerWidth < SIDEBAR_AUTO_BREAKPOINT;
    sidebar.classList.toggle('collapsed', shouldCollapse);
  }
  function toggleSidebar(){
    const sidebar = document.getElementById('sidebar');
    sidebarUserOverride = !sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed');
  }
  function toggleNavGroup(headEl){
    const sidebar = document.getElementById('sidebar');
    if(sidebar.classList.contains('collapsed')){
      sidebarUserOverride = false;
      sidebar.classList.remove('collapsed');
    }
    const group = headEl.parentElement;
    group.classList.toggle('open');
  }

  applySidebarAutoState();
  function handleResize(){
    applySidebarAutoState();
  }
  window.addEventListener('resize', handleResize);

  const exported = {
    toggleSidebar, toggleNavGroup, toggleThemeFromIcon, toggleTheme,
  };
  Object.assign(window, exported);

  return function cleanup() {
    window.removeEventListener('resize', handleResize);
    for (const name of Object.keys(exported)) delete window[name];
  };
}
