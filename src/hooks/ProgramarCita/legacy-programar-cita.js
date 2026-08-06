// Igual que src/hooks/Home/legacy-home.js: esta pantalla no tiene lógica de
// negocio imperativa propia (el flujo vive en estado de React dentro de
// ProgramarCita.jsx), pero comparte el Sidebar/topbar chrome cuyo botón de
// tema/colapsar resuelve window.toggleTheme / window.toggleSidebar /
// window.toggleNavGroup vía onClick={() => window.fn()} (ver Sidebar.jsx).
export function initProgramarCita() {

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

  // El override arranca en `true` (no en `null`): a diferencia de Inicio, un
  // módulo siempre debe entrar con el sidebar colapsado — le ahorra al
  // usuario el click manual en el chevron. Sigue siendo un "override" real:
  // si el usuario lo expande a mano, esa elección manda sobre el ancho de
  // pantalla igual que antes (ver mismo criterio en HistoriaClinica/legacy-app.js).
  const SIDEBAR_AUTO_BREAKPOINT = 1024;
  let sidebarUserOverride = true;
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
