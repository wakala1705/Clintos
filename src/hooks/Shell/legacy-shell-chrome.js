// Chrome global compartido por TODAS las rutas: Sidebar.jsx resuelve el botón
// de tema y el de colapsar/expandir vía window.toggleTheme / toggleThemeFromIcon
// / toggleSidebar / toggleNavGroup, sin importar qué página esté montada (ver
// onClick={() => window.fn()} en Sidebar.jsx). Antes esta misma lógica estaba
// duplicada en el legacy-app.js/legacy-*.js de cada feature (Home,
// GestionEnfermeria, ProgramarCita, AsignacionCitas) — se extrajo aquí para
// que cada página nueva (como /lista-pacientes) no tenga que reinventarla ni
// arriesgarse a olvidarla (window.toggleSidebar undefined → crash del botón).
//
// startCollapsed=true (todo módulo salvo Inicio): el sidebar siempre entra
// colapsado — le ahorra al usuario el click manual en el chevron. Sigue
// siendo un override real: si el usuario lo expande a mano, esa elección
// manda sobre el ancho de pantalla hasta que se recargue la página.
// startCollapsed=false (Inicio): el sidebar entra expandido, y por debajo de
// SIDEBAR_AUTO_BREAKPOINT se auto-colapsa al riel de íconos según el ancho.
export function initShellChrome({ startCollapsed = false } = {}) {

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

  const SIDEBAR_AUTO_BREAKPOINT = 1024;
  let sidebarUserOverride = startCollapsed ? true : null;
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
