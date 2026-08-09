// Ported from the original static-HTML mockup's inline <script>. It owns its
// own state and re-renders by writing innerHTML into containers that the React
// shell (page.jsx) renders once and never touches again. Because inline HTML
// event attributes (onclick="...", oninput="...") always resolve identifiers
// in the *global* scope, every function/value reachable from generated markup
// is attached to `window` — see the exports block near the end of this file.
// La búsqueda/alta de paciente y el wizard "Nueva cita" ahora viven en
// src/hooks/NuevaCita/legacy-nueva-cita.js (compartidos con /programar-cita) —
// ver initNuevaCita() más abajo. Este archivo sigue siendo dueño de
// currentPatient (alimenta el PatientBanner, el panel de contrato/servicios y
// la agenda de hoy) y se lo pasa al flujo compartido vía getPatient/setPatient.
// Tema claro/oscuro + colapsar/expandir el Sidebar (con auto-colapso
// responsive) viven en el chrome global — ver src/hooks/Shell/legacy-shell-chrome.js.
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';

export function initAsignacionCitas() {

  const cleanupShellChrome = initShellChrome({ startCollapsed: true });

  /* ================= SELECCIÓN DE PACIENTE =================
     La lista de pacientes candidatos y la búsqueda/alta viven ahora en el
     flujo compartido (initNuevaCita, más abajo). currentPatient es "quién
     está activo en esta página" — el flujo compartido lo lee/escribe vía
     getPatient/setPatient sin conocer el resto de este archivo. */

  let currentPatient = null;

  // Datos mock del contrato y servicios contratados (se muestran solo con paciente seleccionado)
  const CONTRATO_ACTIVO = { numero:'CTR-2025-0842', tipo:'Capitación' };
  const SIDEBAR_SERVICIOS = [
    { nombre:'Consulta médica general',       codigo:'890301', precio:'$ 28.500' },
    { nombre:'Consulta de urgencias',         codigo:'890302', precio:'$ 42.000' },
    { nombre:'Consulta especializada ...',    codigo:'890401', precio:'$ 68.000' },
    { nombre:'Consulta especializada ...',    codigo:'890402', precio:'$ 71.000' },
    { nombre:'Consulta especializada ...',    codigo:'890403', precio:'$ 65.000' },
    { nombre:'Hemograma completo',            codigo:'840001', precio:'$ 18.500' },
    { nombre:'Glicemia en ayunas',            codigo:'840101', precio:'$ 8.200'  },
    { nombre:'Perfil lipídico completo',      codigo:'840201', precio:'$ 24.000' },
    { nombre:'Radiografía tórax PA y l...',   codigo:'870201', precio:'$ 32.000' },
    { nombre:'Ecografía abdominal',           codigo:'870301', precio:'$ 58.000' },
    { nombre:'Electrocardiograma',            codigo:'850101', precio:'$ 35.000' },
    { nombre:'Espirometría',                  codigo:'850201', precio:'$ 45.000' },
  ];

  function renderContratoPanel(){
    document.getElementById('contrato-numero').textContent = currentPatient ? CONTRATO_ACTIVO.numero : '—';
    document.getElementById('contrato-tipo').textContent = currentPatient ? CONTRATO_ACTIVO.tipo : '—';
  }

  function renderServiciosPanel(){
    const list = document.getElementById('services-list');
    const count = document.getElementById('servicios-count');
    if(!currentPatient){
      count.textContent = '0';
      list.innerHTML = `<div class="services-empty">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" /></svg>
        <div class="se-text">Selecciona un paciente para ver sus servicios contratados</div>
      </div>`;
      return;
    }
    count.textContent = String(SIDEBAR_SERVICIOS.length);
    list.innerHTML = SIDEBAR_SERVICIOS.map(s=>`
      <div class="service-item">
        <div class="s-info"><div class="s-name">${s.nombre}</div><div class="s-code">${s.codigo}</div></div>
        <div class="s-price">${s.precio}</div>
      </div>`).join('');
  }

  // El banner en sí (identidad, alergias, fila de admisión) ahora es el
  // componente React global PatientBanner — ver src/Components/PatientBanner.
  // renderPatientBanner() sigue siendo el punto único que reacciona a cambios
  // de currentPatient para todo lo demás (footer, panel de contrato,
  // servicios, agenda) y empuja el paciente actual al estado de React vía el
  // setter que page.jsx expone en window.
  function renderPatientBanner(){
    document.getElementById('footer-note').style.visibility = currentPatient ? 'visible' : 'hidden';
    ['footer-editar-btn','footer-cancelar-btn','footer-imprimir-btn'].forEach(id=>{
      document.getElementById(id).disabled = !currentPatient;
    });
    renderContratoPanel();
    renderServiciosPanel();
    renderAgenda();
    window.__setAsignacionCitasPatient?.(currentPatient);
  }

  function clearPatient(){
    currentPatient = null;
    renderPatientBanner();
  }

  function setCurrentPatient(patient){
    currentPatient = patient;
    renderPatientBanner();
  }

  /* ================= AGENDA DEL DÍA ================= */
  const AGENDA = [
    { hora:'07:00', dur:'20min', paciente:'Pedro Arango Ruiz', tipo:'Consulta general', eps:'Sura', valor:'$ 28.500', tel:'300 123 4567', fsol:'02/07/2025', estado:'expirado' },
    { hora:'07:20', dur:'20min', paciente:'Camila Torres Mesa', tipo:'Control', eps:'Nueva EPS', valor:'$ 28.500', tel:'316 234 5678', fsol:'01/07/2025', estado:'expirado' },
    { hora:'07:40', dur:'20min', paciente:'Roberto Cárdenas', tipo:'Primera vez', eps:'Compensar', valor:'$ 28.500', tel:'314 345 6789', fsol:'30/06/2025', estado:'expirado' },
    { hora:'08:00', dur:'20min', paciente:'Ana Lucía Vargas', tipo:'Control crónico', eps:'Sura', valor:'$ 28.500', tel:'312 456 7890', fsol:'05/07/2025', estado:'ocupado', llegada:'07:55' },
    { hora:'08:20', dur:'20min', paciente:'Mario Pineda León', tipo:'Consulta general', eps:'Colsanitas', valor:'$ 28.500', tel:'321 567 8901', fsol:'06/07/2025', estado:'ocupado' },
    { hora:'08:40', dur:'20min', paciente:null, tipo:null, estado:'disponible' },
    { hora:'09:00', dur:'20min', paciente:null, tipo:null, estado:'disponible' },
    { hora:'09:20', dur:'20min', paciente:null, tipo:null, estado:'disponible' },
    { hora:'09:40', dur:'20min', paciente:'Gloria Estela Ríos', tipo:'Seguimiento', eps:'Famisanar', valor:'$ 28.500', tel:'315 678 9012', fsol:'04/07/2025', estado:'ocupado' },
    { hora:'10:00', dur:'20min', paciente:null, tipo:null, estado:'bloqueado' },
    { hora:'10:20', dur:'20min', paciente:null, tipo:null, estado:'bloqueado' },
    { hora:'10:40', dur:'20min', paciente:null, tipo:null, estado:'disponible' },
  ];

  const ESTADO_LABEL = {
    disponible:'Disponible', ocupado:'Ocupado', expirado:'Expirado', bloqueado:'Bloqueado'
  };

  let selectedHora = '08:20';

  function renderAgenda(){
    const tbody = document.getElementById('agenda-tbody');
    if(!currentPatient){
      tbody.innerHTML = `<tr class="row-empty"><td colspan="8">
        <div class="agenda-empty-row">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 2v4" /><path d="M16 2v4" /></svg>
          <div class="ae-text">Selecciona un paciente para ver la agenda del día</div>
        </div>
      </td></tr>`;
      return;
    }
    tbody.innerHTML = AGENDA.map(c=>{
      const nombreCell = c.paciente
        ? `<span class="p-name">${c.paciente}</span>`
        : `<span class="p-name muted">Disponible</span>`;
      const menuBtn = c.paciente
        ? `<button class="row-menu-btn" onclick="toggleRowMenu(event,'${c.hora}')" aria-label="Más acciones" title="Más acciones"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" />
  <circle cx="19" cy="12" r="1" />
  <circle cx="5" cy="12" r="1" /></svg></button>`
        : '';
      const llegadaCell = c.llegada
        ? `<span class="llegada-chip"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>${c.llegada}</span>`
        : `<span class="llegada-dash">—</span>`;
      const epsCell = c.eps ? `<span class="badge eps">${c.eps}</span>` : '';
      const rowCls = c.hora === selectedHora ? 'selected' : '';
      return `<tr class="${rowCls}" tabindex="0" onclick="seleccionarCita(this,'${c.hora}')">
        <td class="hora-cell"><span class="h">${c.hora}</span></td>
        <td class="llegada-cell">${llegadaCell}</td>
        <td class="paciente-cell">${nombreCell}${menuBtn}</td>
        <td>${epsCell}</td>
        <td>${c.valor || ''}</td>
        <td>${c.tel || ''}</td>
        <td>${c.fsol || ''}</td>
        <td>
          <span class="estado-badge ${c.estado}"><span class="dot"></span>${ESTADO_LABEL[c.estado]}</span>
        </td>
      </tr>`;
    }).join('');
  }

  function actualizarFooter(hora){
    const c = AGENDA.find(x=>x.hora===hora);
    const label = c && c.paciente ? `${hora} — ${c.paciente}` : `${hora} — Disponible`;
    document.getElementById('footer-selected').textContent = label;
  }

  function seleccionarCita(tr, hora){
    selectedHora = hora;
    document.querySelectorAll('#agenda-tbody tr').forEach(r=>r.classList.remove('selected'));
    tr.classList.add('selected');
    actualizarFooter(hora);
  }

  /* ================= MENÚ CONTEXTUAL DE LA FILA ================= */
  function toggleRowMenu(evt, hora){
    evt.stopPropagation();
    const menu = document.getElementById('row-context-menu');
    const yaAbiertoParaEstaFila = menu.classList.contains('open') && menu.dataset.hora === hora;
    cerrarRowMenu();
    if(yaAbiertoParaEstaFila) return;
    const rect = evt.currentTarget.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = (rect.right - 190) + 'px';
    menu.dataset.hora = hora;
    menu.classList.add('open');
  }

  function cerrarRowMenu(){
    document.getElementById('row-context-menu').classList.remove('open');
  }

  function accionMarcarLlegada(){
    const hora = document.getElementById('row-context-menu').dataset.hora;
    const c = AGENDA.find(x=>x.hora===hora);
    if(c){
      const now = new Date();
      c.llegada = now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false});
    }
    cerrarRowMenu();
    renderAgenda();
    reaplicarSeleccion();
  }

  function accionCancelar(){
    const hora = document.getElementById('row-context-menu').dataset.hora;
    const c = AGENDA.find(x=>x.hora===hora);
    if(c){
      c.paciente = null; c.tipo = null; c.eps = null;
      c.valor = null; c.tel = null; c.fsol = null; c.llegada = null;
      c.estado = 'disponible';
    }
    cerrarRowMenu();
    renderAgenda();
    reaplicarSeleccion();
    actualizarFooter(hora);
  }

  function accionReprogramar(){
    // TODO: conectar con el flujo de reprogramación de citas
    cerrarRowMenu();
  }

  function accionVerDetalle(){
    // TODO: conectar con el detalle del paciente / historia clínica
    cerrarRowMenu();
  }

  function reaplicarSeleccion(){
    const tr = Array.from(document.querySelectorAll('#agenda-tbody tr'))
      .find(r => r.querySelector('.hora-cell .h')?.textContent === selectedHora);
    if(tr) tr.classList.add('selected');
  }

  const agendaTbodyEl = document.getElementById('agenda-tbody');
  document.addEventListener('click', cerrarRowMenu);
  agendaTbodyEl?.addEventListener('scroll', cerrarRowMenu);

  // Activa con Enter/Espacio los elementos no-nativos con tabindex="0"
  // (filas de tabla, tarjetas de horario, ítems de navegación) — el foco visible
  // solo tiene sentido si también son operables por teclado.
  function handleKeydown(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target;
    if(el.getAttribute && el.getAttribute('tabindex') === '0'){
      e.preventDefault();
      el.click();
    }
  }
  document.addEventListener('keydown', handleKeydown);

  function cambiarTab(el){
    document.querySelectorAll('.tab').forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    el.classList.add('active');
    el.setAttribute('aria-selected','true');
  }

  renderPatientBanner();

  // La agenda "de hoy" solo se actualiza si la cita agendada por el wizard es
  // para hoy — reutiliza la misma lógica que antes vivía dentro de ncConfirmar
  // cuando ese código estaba en este archivo (ver legacy-nueva-cita.js).
  function handleAppointmentConfirmed(filaNueva, { dia }){
    if(dia !== 0) return;
    let fila = AGENDA.find(c=>c.hora===filaNueva.hora);
    if(fila){
      Object.assign(fila, filaNueva);
    } else {
      AGENDA.push(filaNueva);
      AGENDA.sort((a,b)=>a.hora.localeCompare(b.hora));
    }
    selectedHora = filaNueva.hora;
    renderAgenda();
    reaplicarSeleccion();
    actualizarFooter(filaNueva.hora);
  }

  const cleanupNuevaCita = initNuevaCita({
    getPatient: () => currentPatient,
    setPatient: setCurrentPatient,
    onAppointmentConfirmed: handleAppointmentConfirmed,
  });

  // Every function/value called from HTML generated via innerHTML (or wired up
  // as a plain onClick={() => window.fn()} from the static JSX shell) has to
  // live on `window`, because inline HTML event attributes resolve identifiers
  // in the global scope, not in this closure. El chrome (tema/sidebar) y el
  // flujo "Nueva cita" (búsqueda de paciente, wizard de agendamiento) exportan
  // las suyas por su cuenta — ver initShellChrome()/initNuevaCita() más arriba.
  const exported = {
    cambiarTab, clearPatient, seleccionarCita, toggleRowMenu,
    accionMarcarLlegada, accionCancelar, accionReprogramar, accionVerDetalle,
  };
  Object.assign(window, exported);

  return function cleanup() {
    document.removeEventListener('click', cerrarRowMenu);
    agendaTbodyEl?.removeEventListener('scroll', cerrarRowMenu);
    document.removeEventListener('keydown', handleKeydown);
    cleanupShellChrome?.();
    cleanupNuevaCita?.();
    for (const name of Object.keys(exported)) delete window[name];
  };
}
