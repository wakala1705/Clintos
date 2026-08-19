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
import { generarAgendaMedico } from '@/hooks/AsignacionCitas/filtrosData';

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

  // El panel solo se puebla mientras el wizard "Nueva cita" está en su paso
  // "Servicios" (ver onServiciosStepChange más abajo, initNuevaCita) — antes
  // se llenaba apenas se elegía el paciente, mostrando datos mock detrás del
  // wizard antes de que el usuario llegara siquiera a ese paso.
  let serviciosStepActivo = false;
  function setServiciosStepActivo(activo){
    serviciosStepActivo = activo;
    renderServiciosPanel();
  }

  function renderServiciosPanel(){
    const list = document.getElementById('services-list');
    const count = document.getElementById('servicios-count');
    if(!currentPatient || !serviciosStepActivo){
      count.textContent = '0';
      const texto = currentPatient
        ? 'Los servicios contratados aparecen acá al llegar al paso "Servicios" de Nueva cita'
        : 'Selecciona un paciente para ver sus servicios contratados';
      list.innerHTML = `<div class="services-empty">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" /></svg>
        <div class="se-text">${texto}</div>
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

  /* ================= AGENDA DEL DÍA =================
     Ya no es una lista fija: se genera por médico (7:00-18:00, franjas de
     30 min) al elegir especialidad + médico en el toolbar de page.jsx —
     ver setMedicoAgenda()/generarAgendaMedico() (filtrosData.js) más abajo.
     `medicoAgendaId` es independiente de `currentPatient`: el banner es
     sobre a quién se está atendiendo, esta tabla es la agenda del día de
     ese consultorio. */
  let AGENDA = [];
  let medicoAgendaId = null;

  const ESTADO_LABEL = {
    disponible:'Disponible', ocupado:'Ocupado', expirado:'Expirado', bloqueado:'Bloqueado'
  };

  let selectedHora = null;

  function setMedicoAgenda(medicoId){
    medicoAgendaId = medicoId || null;
    AGENDA = medicoAgendaId ? generarAgendaMedico(medicoAgendaId) : [];
    // Preselecciona la primera cita ocupada (si hay) para que la fila
    // resaltada y el footer ("Cita seleccionada: ...") arranquen en algo
    // real en vez de quedar apuntando a una hora que puede no existir en
    // esta grilla — mismo criterio que el '08:20' fijo que había antes.
    const primeraOcupada = AGENDA.find(c => c.estado === 'ocupado');
    selectedHora = primeraOcupada ? primeraOcupada.hora : (AGENDA[0]?.hora ?? null);
    renderAgenda();
    reaplicarSeleccion();
    if(selectedHora) actualizarFooter(selectedHora);
  }

  // Mismo ícono (lucide "calendar-search") que .pc-agenda-empty en
  // ProgramarCita.jsx — acá va como string porque este módulo genera HTML a
  // mano (innerHTML), no JSX; mismo patrón que NC_INFO_SVG/NC_CLIPBOARD_SVG
  // en legacy-nueva-cita.js para inyectar íconos Lucide en HTML imperativo.
  const AC_CALENDAR_SEARCH_SVG = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2v4"/><path d="M21 11.75V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.25"/><path d="m22 22-1.875-1.875"/><path d="M3 10h18"/><path d="M8 2v4"/><circle cx="18" cy="18" r="3"/></svg>';

  function renderAgenda(){
    const tbody = document.getElementById('agenda-tbody');
    if(!medicoAgendaId){
      // Mismo patrón que .pc-agenda-empty en ProgramarCita.css (ícono en
      // círculo + título + subtítulo) — ver AGENTS.md, "reutiliza el mismo
      // empty state" no significa importar esa CSS (no carga en esta
      // página, mismo riesgo de colisión que .pc-modal-sm) sino replicar el
      // patrón visual con clases propias de esta feature. Depende de
      // medicoAgendaId (especialidad + médico elegidos en el toolbar), no
      // de currentPatient — son cosas independientes, ver setMedicoAgenda().
      tbody.innerHTML = `<tr class="row-empty"><td colspan="8">
        <div class="agenda-empty-row">
          <div class="ae-icon-circle">${AC_CALENDAR_SEARCH_SVG}</div>
          <div class="ae-title">Configura la agenda para continuar</div>
          <div class="ae-text">Elegí una especialidad y un médico arriba para ver su agenda del día.</div>
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
    onServiciosStepChange: setServiciosStepActivo,
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
  // Puente React → legacy (dirección inversa a __setAsignacionCitasPatient,
  // que va de legacy a React): page.jsx llama esto cada vez que cambia el
  // médico elegido en el toolbar (FiltroPickerModal), ver useEffect ahí.
  window.__setAsignacionCitasMedicoAgenda = setMedicoAgenda;
  Object.assign(window, exported);

  return function cleanup() {
    document.removeEventListener('click', cerrarRowMenu);
    agendaTbodyEl?.removeEventListener('scroll', cerrarRowMenu);
    document.removeEventListener('keydown', handleKeydown);
    cleanupShellChrome?.();
    cleanupNuevaCita?.();
    for (const name of Object.keys(exported)) delete window[name];
    delete window.__setAsignacionCitasMedicoAgenda;
  };
}
