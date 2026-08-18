// Flujo compartido 'Nueva cita': búsqueda/alta de paciente + wizard de
// agendamiento. Extraído de AsignacionCitas/legacy-app.js (única fuente
// hasta ahora) para que /programar-cita dispare exactamente el mismo flujo
// — ver AGENTS.md y src/Components/NuevaCita/NuevaCitaFlow.jsx.
// getPatient()/setPatient() son inyectados por la página anfitriona: quién
// es 'el paciente activo' para fines de agendamiento sigue siendo dueño de
// esa página (en AsignacionCitas también alimenta el PatientBanner y debe
// seguir activo tras agendar, para poder hacer más cosas con ese mismo
// paciente sin re-buscarlo; en ProgramarCita el ref solo vive para este
// flujo — ver clearPatientAfterConfirm más abajo). onAppointmentConfirmed es
// opcional y solo lo usa AsignacionCitas hoy, para reflejar la cita en su
// tabla "Agenda del día" cuando es para hoy — ver ncConfirmar(). El catálogo
// de especialidades/médicos del paso "Selecciona la especialidad"/"Selecciona
// el médico" se deriva de SPECIALTIES/DOCTORS (agendaMockData.js) en vez de
// tener su propia lista — mismas especialidades y médicos que ya usa
// Programar Cita, para que se sientan la misma base de datos en todo el
// producto (ver NC_ESPECIALIDADES/NC_MEDICOS/NC_SLOTS más abajo).
import { SPECIALTIES, DOCTORS } from '@/hooks/ProgramarCita/agendaMockData';

export function initNuevaCita({
  getPatient = () => null, setPatient = () => {}, onAppointmentConfirmed,
  // true en páginas donde el paciente solo existe para este wizard (ver
  // ProgramarCita.jsx): al confirmar, se limpia para que la próxima cita
  // vuelva a arrancar en el buscador de pacientes en vez de reutilizar en
  // silencio al mismo paciente de la cita anterior.
  clearPatientAfterConfirm = false,
  // Opcional — cuando el consumidor SÍ lo pasa, elegir un paciente en el
  // buscador (fila existente + "Aceptar", o "Agregar paciente" nuevo) llama
  // a esto en vez de encadenar directo al wizard de agendamiento (ncOpen).
  // Pensado para páginas que reutilizan el mismo modal de búsqueda/alta de
  // pacientes (.ps-overlay/.ap-overlay) para un flujo que NO es agendar una
  // cita — ej. Admisiones/pre-ingreso (ver Admisiones.jsx). Sin este
  // callback, el comportamiento por defecto (asignacion-citas, programar-cita,
  // ListaPacientes) no cambia.
  onPatientConfirmed,
} = {}) {

  const PATIENTS = [
    { iniciales:'LS', nombre:'Laura Sofía Martínez Gómez',   edad:34, sexo:'Femenino',  ciudad:'Bogotá D.C.',    documento:'1.032.847.291', telefono:'310 842 9173', eps:'Sura',       estado:'activo',     citasFuturas:2 },
    { iniciales:'AF', nombre:'Andrés Felipe Herrera Rincón', edad:47, sexo:'Masculino', ciudad:'Medellín',       documento:'79.834.125',    telefono:'300 555 1234', eps:'Nueva EPS',  estado:'activo',     citasFuturas:0 },
    { iniciales:'MI', nombre:'María Isabel Correa Patiño',   edad:58, sexo:'Femenino',  ciudad:'Cali',           documento:'43.729.381',    telefono:'301 555 2345', eps:'Compensar',  estado:'activo',     citasFuturas:1 },
    { iniciales:'JL', nombre:'Jorge Luis Pedraza Mora',      edad:65, sexo:'Masculino', ciudad:'Barranquilla',   documento:'17.284.930',    telefono:'302 555 3456', eps:'Salud Total',estado:'inactivo',  citasFuturas:0 },
    { iniciales:'VO', nombre:'Valentina Ospina Castaño',     edad:26, sexo:'Femenino',  ciudad:'Bucaramanga',    documento:'1.130.648.702', telefono:'303 555 4567', eps:'Colsanitas', estado:'activo',     citasFuturas:3 },
    { iniciales:'CE', nombre:'Carlos Eduardo Ramírez Torres',edad:52, sexo:'Masculino', ciudad:'Bogotá D.C.',    documento:'80.124.478',    telefono:'304 555 5678', eps:'Famisanar',  estado:'suspendido',citasFuturas:0 },
    { iniciales:'SM', nombre:'Sandra Milena Vargas Díaz',    edad:41, sexo:'Femenino',  ciudad:'Pereira',        documento:'52.483.917',    telefono:'305 555 6789', eps:'Coomeva',    estado:'activo',     citasFuturas:1 },
  ];
  const PATIENT_ESTADO_LABEL = { activo:'Activo', inactivo:'Inactivo', suspendido:'Suspendido' };

  // Este flujo se monta de forma independiente en varias páginas
  // (AsignacionCitas, FichaPaciente, ProgramarCita), cada una con su propia
  // instancia de <NuevaCitaFlow/> pero usando los MISMOS ids de overlay
  // (nc-overlay, ps-overlay...). Si la navegación entre rutas ocurre
  // mientras el wizard estaba abierto en la página anterior (ej. se
  // abandona sin cerrar), el nuevo montaje puede heredar visualmente ese
  // estado "open" antes de que este módulo vuelva a tomar control — se
  // fuerza a cerrado acá para que cada montaje arranque siempre limpio, sin
  // depender de en qué estado haya quedado la página anterior.
  ['ps-overlay', 'nc-overlay', 'nc-discard-overlay', 'ap-overlay', 'ps-context-menu'].forEach((id) => {
    document.getElementById(id)?.classList.remove('open');
  });

  let psSelectedIdx = null;

  function openPatientSearch(){
    psSelectedIdx = null;
    document.getElementById('ps-overlay').classList.add('open');
    filterPatients('');
    document.getElementById('ps-accept-btn').disabled = true;
    const input = document.querySelector('#ps-overlay .ps-search-field input');
    if(input){ input.value=''; setTimeout(()=>input.focus(), 50); }
  }

  function closePatientSearch(){
    document.getElementById('ps-overlay').classList.remove('open');
  }

  function filterPatients(query){
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g,'');
    const list = PATIENTS.filter(p=>{
      if(!q) return true;
      const matchNombre = p.nombre.toLowerCase().includes(q);
      const matchDoc = qDigits && p.documento.replace(/\D/g,'').includes(qDigits);
      return matchNombre || matchDoc;
    });
    renderPatientTable(list);
  }

  function renderPatientTable(list){
    const tbody = document.getElementById('ps-tbody');
    if(!list.length){
      tbody.innerHTML = `<tr class="row-disabled"><td colspan="6" style="text-align:center;color:var(--ink-500);padding:24px;">No se encontraron pacientes</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(p=>{
      const idx = PATIENTS.indexOf(p);
      const selected = psSelectedIdx === idx;
      return `<tr class="${selected?'selected':''}" tabindex="0" onclick="setPsSelected(${idx},this)" ondblclick="setPsSelected(${idx},this); confirmPatientSelection();">
        <td>
          <div class="ps-patient-cell">
            <span class="ps-avatar">${p.iniciales}</span>
            <span class="ps-pname">${p.nombre}</span>
          </div>
        </td>
        <td>${p.documento}</td>
        <td>${p.ciudad}</td>
        <td><span class="badge eps">${p.eps}</span></td>
        <td><span class="estado-badge ${p.estado}"><span class="dot"></span>${PATIENT_ESTADO_LABEL[p.estado]}</span></td>
        <td>
          <button class="row-menu-btn" style="display:inline-flex;" onclick="event.stopPropagation(); togglePsRowMenu(event, ${idx});" aria-label="Más acciones" title="Más acciones">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  /* ---- Menú contextual de fila (Editar / Historial / Desactivar) ---- */
  function togglePsRowMenu(evt, idx){
    const menu = document.getElementById('ps-context-menu');
    const yaAbiertoParaEstaFila = menu.classList.contains('open') && menu.dataset.idx === String(idx);
    cerrarPsRowMenu();
    if(yaAbiertoParaEstaFila) return;
    const rect = evt.currentTarget.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.left = (rect.right - 190) + 'px';
    menu.dataset.idx = idx;
    menu.classList.add('open');
  }

  function cerrarPsRowMenu(){
    document.getElementById('ps-context-menu')?.classList.remove('open');
  }

  function psAccionEditar(){
    const idx = Number(document.getElementById('ps-context-menu').dataset.idx);
    cerrarPsRowMenu();
    apOpenEdit(idx);
  }

  function psAccionHistorial(){
    const idx = document.getElementById('ps-context-menu').dataset.idx;
    ncToast(`Historial de citas de ${PATIENTS[idx]?.nombre || ''} (en desarrollo).`);
    cerrarPsRowMenu();
  }

  function psAccionDesactivar(){
    const idx = document.getElementById('ps-context-menu').dataset.idx;
    ncToast(`Desactivar usuario: ${PATIENTS[idx]?.nombre || ''} (en desarrollo).`);
    cerrarPsRowMenu();
  }

  const psTableWrapEl = document.querySelector('.ps-table-wrap');
  document.addEventListener('click', cerrarPsRowMenu);
  psTableWrapEl?.addEventListener('scroll', cerrarPsRowMenu);


  function setPsSelected(idx, trEl){
    psSelectedIdx = idx;
    document.querySelectorAll('#ps-tbody tr').forEach(tr=>tr.classList.remove('selected'));
    if(trEl) trEl.classList.add('selected');
    document.getElementById('ps-accept-btn').disabled = false;
  }

  function confirmPatientSelection(){
    if(psSelectedIdx === null) return;
    const patient = PATIENTS[psSelectedIdx];
    setPatient(patient);
    closePatientSearch();
    const prefill = ncPendingPrefill;
    ncPendingPrefill = null;
    if(onPatientConfirmed){ onPatientConfirmed(patient); return; }
    ncOpen(prefill);
  }

  /* ================================================================
     WIZARD: NUEVO AGENDAMIENTO
     Paso 1 · Cobertura (5 sub-pasos): Régimen → Especialidad → Médico
       → Contratación → Servicios (cada uno depende del anterior)
     Paso 2 · Información de cita: Finalidad + Teléfono de aviso
     Paso 3 · Resumen (con opción de editar)
     Selección simple = elegir. Doble clic = elegir Y avanzar de una vez,
     sin tener que bajar hasta el botón "Continuar".
  ================================================================= */

  const NC_CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const NC_SEARCH_SVG = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>';
  const NC_CHEVRON_SVG = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const NC_CLOCK_SVG = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
  const NC_EDIT_SVG = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>';

  const NC_FLOW = [
    { key:'regimen',      label:'Régimen',      group:1 },
    { key:'especialidad', label:'Especialidad', group:1 },
    { key:'medico',       label:'Médico',       group:1 },
    { key:'contratacion', label:'Contratación', group:1 },
    { key:'servicios',    label:'Servicios',    group:1 },
    { key:'info',         label:'Información de cita', group:2 },
    { key:'resumen',      label:'Resumen',      group:3 },
  ];

  const NC_TITLES = {
    regimen:'Régimen', especialidad:'Especialidad', medico:'Selección de médico',
    contratacion:'Contratación', servicios:'Servicios contratados',
    info:'Finalidad y Teléfono Aviso', resumen:'Resumen de la cita',
  };

  const NC_REGIMENES = [
    { id:'900686173', nombre:'CONTRIBUTIVO EPS', detalle:[['EPS','Empresa Promotora de Salud Contributiva'],['EPSS','Empresa Promotora de Salud Subsidiada']] },
    { id:'900856678', nombre:'SUBSIDIADO EPS',   detalle:[['EPS','Empresa Promotora de Salud Subsidiada']] },
    { id:'900452246', nombre:'ESPECIAL EPS',     detalle:[['RÉGIMEN','Régimen especial de excepción']] },
    { id:'900740833', nombre:'PARTICULAR EPS',   detalle:[['PAGO','Pago directo por el usuario']] },
  ];

  // El "ID" que se ve en la tabla es SPECIALTIES.codigo (mismo código que
  // muestra el picker de especialidad de Programar Cita); "medicos" se
  // cuenta a partir de DOCTORS, así que un médico nuevo en agendaMockData.js
  // aparece automáticamente aquí también, sin tocar este archivo.
  const NC_ESPECIALIDADES = SPECIALTIES.map(s => ({
    id: s.codigo,
    nombre: s.nombre,
    medicos: DOCTORS.filter(d => d.especialidadId === s.id).length,
  }));

  const NC_MEDICOS = SPECIALTIES.reduce((acc, s) => {
    acc[s.codigo] = DOCTORS
      .filter(d => d.especialidadId === s.id)
      .map(d => ({ id: d.codigo, nombre: d.nombre }));
    return acc;
  }, {});

  // Genera N horarios cada 20 min a partir de una hora inicial (para simular agendas muy llenas de disponibilidad).
  function ncGenerarHorarios(horaInicio, cantidad){
    const [h0, m0] = horaInicio.split(':').map(Number);
    let total = h0 * 60 + m0;
    const horas = [];
    for(let i=0; i<cantidad; i++){
      const h = Math.floor(total / 60) % 24;
      const m = total % 60;
      horas.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      total += 20;
    }
    return horas;
  }

  // Solo se listan horarios DISPONIBLES (al usuario no le interesan los
  // ocupados) — la cantidad por médico reutiliza DOCTORS.citasDisponibles,
  // el mismo número que ya muestra el picker de médico de Programar Cita.
  const NC_SLOTS = DOCTORS.reduce((acc, d) => {
    acc[d.codigo] = ncGenerarHorarios('07:00', d.citasDisponibles);
    return acc;
  }, {});

  // ---- Disponibilidad por día (navegación entre días en el paso "Médico") ----
  // El día 0 (hoy) usa los horarios fijos de NC_SLOTS de arriba (coherentes con
  // la agenda del día en pantalla). Los demás días se generan de forma
  // determinística (mismo médico + mismo día = siempre el mismo resultado).
  const NC_DIAS_VISIBLES = 6; // hoy + 5 días siguientes
  const NC_DIA_NOMBRES = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const NC_DIA_NOMBRES_CORTOS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  function ncHashSeed(str){
    let h = 0;
    for(let i=0;i<str.length;i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
    return h || 1;
  }
  function ncSeededRandom(seed){
    let s = seed % 2147483647;
    if(s <= 0) s += 2147483646;
    return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function ncTodasLasHoras(){
    const horas = [];
    let total = 7 * 60;
    while(total <= 16 * 60 + 40){
      horas.push(`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`);
      total += 20;
    }
    return horas;
  }
  function ncSlotsForDay(medicoId, dayOffset){
    if(dayOffset === 0) return NC_SLOTS[medicoId] || [];
    const rand = ncSeededRandom(ncHashSeed(`${medicoId}-${dayOffset}`));
    const densidad = 0.2 + rand() * 0.35;
    return ncTodasLasHoras().filter(()=> rand() < densidad);
  }
  function ncFechaParaDia(offset){
    const f = new Date();
    f.setDate(f.getDate() + offset);
    return f;
  }
  function ncDiaOptions(){
    const opciones = [];
    for(let i=0; i<NC_DIAS_VISIBLES; i++){
      const f = ncFechaParaDia(i);
      opciones.push({
        offset:i,
        label: i===0 ? 'Hoy' : i===1 ? 'Mañana' : NC_DIA_NOMBRES_CORTOS[f.getDay()],
        numero: f.getDate(),
        mes: f.toLocaleDateString('es-CO',{month:'short'}).replace('.',''),
      });
    }
    return opciones;
  }
  function ncFechaLegible(offset){
    const f = ncFechaParaDia(offset);
    const dia = NC_DIA_NOMBRES[f.getDay()];
    return `${dia} ${f.getDate()} de ${f.toLocaleDateString('es-CO',{month:'long'})}`;
  }

  const NC_CONTRATOS = [
    { id:'12', nCto:'15', contrato:'SURA CONT (VIG 01-01-2025 AL 31-12-2025)' },
    { id:'13', nCto:'22', contrato:'NUEVA EPS EVENTO (VIG 01-03-2025 AL 28-02-2026)' },
  ];

  const NC_SERVICIOS = [
    { id:'890302-98C', nombre:'REVISION DE EXAMENES',                                     valor:0 },
    { id:'890302-99C', nombre:'CONSULTA POSTQUIRURGICA',                                  valor:0 },
    { id:'881202C',    nombre:'ECOCARDIOGRAMA TRANSTORACICO',                             valor:247400 },
    { id:'895100C',    nombre:'ELECTROCARDIOGRAMA DE RITMO O DE SUPERFICIE',              valor:20384 },
    { id:'890228C',    nombre:'CONSULTA DE PRIMERA VEZ POR ESPECIALISTA',                 valor:250000 },
    { id:'890328C',    nombre:'CONSULTA DE CONTROL O DE SEGUIMIENTO',                     valor:250000 },
    { id:'895101C',    nombre:'ELECTROCARDIOGRAMA DE RITMO O DE SUPERFICIE AMBULATORIO',  valor:256000 },
    { id:'810100C',    nombre:'CONSULTA MEDICINA GENERAL',                                valor:28500 },
  ];

  const NC_FINALIDADES = ['Primera vez','Control','Urgencia','Procedimiento','Valoración'];
  // Traduce la finalidad (dominio del wizard) al `tipo` que ya conocen
  // ScheduleGrid/DetalleCitaModal en Programar Cita (TIPO_LABEL/VALOR_BY_TIPO
  // en agendaMockData.js solo tienen esas 3 claves) — ver handleAppointmentConfirmed
  // en ProgramarCita.jsx.
  const NC_FINALIDAD_TIPO = { 'Primera vez':'primera', 'Control':'control', 'Urgencia':'urgencia', 'Procedimiento':'control', 'Valoración':'primera' };

  function fmtCOP(n){ return '$ ' + n.toLocaleString('es-CO'); }

  const NC = { pos:0, maxReached:0, data:null };
  window.NC = NC;

  function ncDataInicial(){
    return { regimenId:null, especialidadId:null, medicoId:null, dia:0, horario:null, contratoId:null, servicios:[], finalidad:null, telefono:'' };
  }

  function ncRegimen(){ return NC_REGIMENES.find(r=>r.id===NC.data.regimenId); }
  function ncEspecialidad(){ return NC_ESPECIALIDADES.find(e=>e.id===NC.data.especialidadId); }
  function ncMedicos(){ return NC_MEDICOS[NC.data.especialidadId] || []; }
  function ncMedico(){ return ncMedicos().find(m=>m.id===NC.data.medicoId); }
  function ncContrato(){ return NC_CONTRATOS.find(c=>c.id===NC.data.contratoId); }

  // Slot pendiente de un clic en una celda vacía de la grilla (ver
  // ScheduleGrid.jsx/ProgramarCita.jsx): si todavía no hay paciente activo,
  // ncOpen() desvía a openPatientSearch() antes de poder aplicar el prefill
  // — se guarda acá para no perderlo y aplicarlo cuando confirmPatientSelection()
  // vuelva a llamar a ncOpen() ya con paciente.
  let ncPendingPrefill = null;

  // `prefill` (opcional): { doctorId, dia, horario } — doctorId es el id real
  // de DOCTORS (no el "codigo" que usa NC.data.medicoId), dia es el offset en
  // días desde hoy (0-5, ver NC_DIAS_VISIBLES) y horario es "HH:MM". Permite
  // que un clic en una celda concreta de la agenda (médico + día + hora ya
  // visibles en pantalla) llegue pre-seleccionado al wizard en vez de forzar
  // a repetir esa misma elección desde el paso "Médico".
  function ncOpen(prefill){
    const patient = getPatient();
    if(!patient){
      ncPendingPrefill = prefill || null;
      openPatientSearch();
      return;
    }
    NC.pos = 0; NC.maxReached = 0; NC.data = ncDataInicial();
    if(prefill && prefill.doctorId){
      const doctor = DOCTORS.find(d=>d.id===prefill.doctorId);
      const especialidad = doctor ? SPECIALTIES.find(s=>s.id===doctor.especialidadId) : null;
      if(doctor && especialidad){
        NC.data.especialidadId = especialidad.codigo;
        NC.data.medicoId = doctor.codigo;
        NC.data.dia = typeof prefill.dia === 'number' ? Math.min(Math.max(prefill.dia,0),5) : 0;
        NC.data.horario = prefill.horario || null;
      }
    }
    document.getElementById('nc-rail-patient-name').textContent = patient.nombre;
    document.getElementById('nc-rail-patient-doc').textContent = `CC ${patient.documento}`;
    document.getElementById('nc-overlay').classList.add('open');
    ncRender();
  }

  function ncClose(){
    // Perder 6 de 7 pasos por un clic accidental en el fondo o en la X es
    // demasiado costoso para no avisar — se pregunta solo si ya se avanzó
    // más allá del primer paso (régimen solo, sin confirmar, no amerita el
    // aviso). Modal propio (nc-discard-overlay, ver NuevaCitaFlow.jsx) en vez
    // de window.confirm() nativo, para que se vea consistente con el resto
    // de la app.
    if(NC.pos > 0){
      document.getElementById('nc-discard-overlay').classList.add('open');
      return;
    }
    document.getElementById('nc-overlay').classList.remove('open');
  }

  function ncCancelDiscard(){
    document.getElementById('nc-discard-overlay').classList.remove('open');
  }

  function ncConfirmDiscard(){
    document.getElementById('nc-discard-overlay').classList.remove('open');
    document.getElementById('nc-overlay').classList.remove('open');
  }

  function handleDiscardOverlayEscape(e){
    if(e.key === 'Escape' && document.getElementById('nc-discard-overlay').classList.contains('open')) ncCancelDiscard();
  }
  document.addEventListener('keydown', handleDiscardOverlayEscape);

  function ncIsValid(key){
    const d = NC.data;
    switch(key){
      case 'regimen':      return !!d.regimenId;
      case 'especialidad': return !!d.especialidadId;
      case 'medico':       return !!d.medicoId && !!d.horario;
      case 'contratacion': return !!d.contratoId;
      case 'servicios':    return d.servicios.length > 0;
      case 'info':         return !!d.finalidad && d.telefono.trim().length >= 7;
      case 'resumen':      return true;
      default:             return false;
    }
  }

  function ncGoTo(idx){
    if(idx > NC.maxReached) return;
    NC.pos = idx;
    ncRender();
  }

  function ncNext(){
    const cur = NC_FLOW[NC.pos].key;
    if(!ncIsValid(cur)) return;
    if(NC.pos < NC_FLOW.length - 1){
      NC.pos++;
      if(NC.pos > NC.maxReached) NC.maxReached = NC.pos;
      ncRender();
    }
  }

  function ncBack(){
    if(NC.pos > 0){ NC.pos--; ncRender(); }
  }

  // Avanza automáticamente al siguiente (sub)paso si la selección ya deja
  // válido el paso actual — así el usuario no tiene que bajar a "Continuar".
  function ncMaybeAdvance(key, advance){
    if(advance && ncIsValid(key) && NC.pos < NC_FLOW.length - 1){
      NC.pos++;
      if(NC.pos > NC.maxReached) NC.maxReached = NC.pos;
    }
    ncRender();
  }

  function ncSelectRegimen(id, advance){ NC.data.regimenId = id; ncMaybeAdvance('regimen', advance); }
  function ncSelectEspecialidad(id, advance){
    NC.data.especialidadId = id; NC.data.medicoId = null; NC.data.dia = 0; NC.data.horario = null;
    ncMaybeAdvance('especialidad', advance);
  }
  // A diferencia de régimen/especialidad/contrato/servicio, seleccionar un
  // médico no deja el paso completo por sí solo (falta elegir día y hora), así
  // que un doble clic sobre la fila NO debe avanzar de paso: solo selecciona,
  // igual que un clic simple. Antes existía ncSelectMedicoQuick(), que tomaba
  // el primer horario libre de hoy y avanzaba en el mismo gesto — desde el
  // punto de vista del usuario eso parecía "saltarse" la elección de horario.
  function ncSelectMedico(id){ NC.data.medicoId = id; NC.data.dia = 0; NC.data.horario = null; ncRender(); }
  function ncSelectDia(offset){
    NC.data.dia = offset;
    NC.data.horario = null;
    ncRender();
  }
  function ncSelectSlot(hora, advance){ NC.data.horario = hora; ncMaybeAdvance('medico', advance); }
  function ncSelectContrato(id, advance){ NC.data.contratoId = id; ncMaybeAdvance('contratacion', advance); }
  function ncToggleServicio(code, advance){
    const i = NC.data.servicios.indexOf(code);
    if(i >= 0) NC.data.servicios.splice(i,1); else NC.data.servicios.push(code);
    ncMaybeAdvance('servicios', advance);
  }
  function ncSelectFinalidad(v){ NC.data.finalidad = v; ncUpdateContinueState(); }

  function ncUpdateContinueState(){
    const cont = document.getElementById('nc-continue-btn');
    if(NC.pos !== NC_FLOW.length - 1){
      cont.disabled = !ncIsValid(NC_FLOW[NC.pos].key);
    }
  }

  function ncRenderStepper(){
    const wrap = document.getElementById('nc-stepper');
    const enGrupo1 = NC_FLOW[NC.pos].group === 1;
    if(!enGrupo1){ wrap.style.display = 'none'; wrap.innerHTML = ''; return; }
    wrap.style.display = 'flex';
    const pasos1 = NC_FLOW.map((s,i)=>({...s, idx:i})).filter(s=>s.group===1);
    wrap.innerHTML = pasos1.map(s=>{
      let cls = 'wiz-step';
      let dot = String(s.idx+1);
      const clickable = s.idx <= NC.maxReached;
      if(s.idx < NC.pos){ cls += ' done'; dot = NC_CHECK_SVG; }
      else if(s.idx === NC.pos){ cls += ' active'; }
      else if(s.idx > NC.maxReached){ cls += ' locked'; }
      return `<div class="${cls}" ${clickable ? `tabindex="0" role="button"` : ''} onclick="ncGoTo(${s.idx})">
        <span class="wiz-step-circle">${dot}</span>
        <span class="wiz-step-label">${s.label}</span>
      </div>`;
    }).join('');
  }

  function ncRenderMainHeader(){
    const key = NC_FLOW[NC.pos].key;
    document.getElementById('nc-main-title').textContent = NC_TITLES[key] || '';
    document.getElementById('nc-progress-text').textContent = `Paso ${NC.pos + 1} de ${NC_FLOW.length}`;
  }

  function ncRailMainStepHtml(idx, numero, titulo, descripcion, extraClickable){
    const pos = NC.pos;
    let cls = 'rail-main-step';
    let circle = String(numero);
    if(idx < pos){ cls += ' done'; circle = NC_CHECK_SVG; }
    else if(idx === pos){ cls += ' active'; }
    else if(idx > NC.maxReached && !extraClickable){ cls += ' locked'; }
    const clickable = extraClickable || idx <= NC.maxReached;
    return `<div class="${cls}" ${clickable ? `tabindex="0" role="button" onclick="ncGoTo(${idx})"` : ''}>
      <span class="rms-circle">${circle}</span>
      <span>
        <div class="rms-title">${titulo}</div>
        <div class="rms-sub">${descripcion}</div>
      </span>
    </div>`;
  }

  function ncRenderRail(){
    const rail = document.getElementById('nc-rail');
    const pos = NC.pos;

    // Grupo 1 · Seleccionar cobertura (siempre accesible desde el inicio)
    let html = ncRailMainStepHtml(0, 1, 'Seleccionar cobertura', 'Régimen, especialidad, médico, contrato, servicio', true);

    html += `<div class="rail-substeps">`;
    NC_FLOW.filter(s=>s.group===1).forEach((s,idx)=>{
      let cls = 'rail-substep';
      let dot = String(idx+1);
      if(idx < pos){ cls += ' done'; dot = NC_CHECK_SVG; }
      else if(idx === pos){ cls += ' active'; }
      else if(idx > NC.maxReached){ cls += ' locked'; }
      const clickable = idx <= NC.maxReached;
      html += `<div class="${cls}" ${clickable ? `tabindex="0" role="button" onclick="ncGoTo(${idx})"` : ''}>
        <span class="rs-dot">${dot}</span>${s.label}
      </div>`;
    });
    html += `</div>`;

    // Grupo 2 · Información de cita
    html += ncRailMainStepHtml(5, 2, 'Información de cita', 'Finalidad y teléfono de aviso', false);

    // Grupo 3 · Resumen
    html += ncRailMainStepHtml(6, 3, 'Resumen', 'Confirmar y guardar', false);

    rail.innerHTML = html;
  }

  function ncStepHeader(title, hint){
    return `<div class="wizard-step-title">${title}</div><div class="wizard-step-hint">${hint}</div>`;
  }

  function ncSearchRow(placeholders){
    return `<div class="wiz-search-row">${placeholders.map((p,i)=>`
      <div class="wiz-search-field">
        ${NC_SEARCH_SVG}
        <input type="text" placeholder="${p}" oninput="ncFiltrar(${i}, this.value)">
      </div>`).join('')}</div>`;
  }

  let NC_FILTROS = ['', ''];

  function ncFiltrar(idx, val){
    NC_FILTROS[idx] = val.trim().toLowerCase();
    ncRenderTableOnly();
  }

  // -------- Paso: Régimen (tabla con acordeón de detalle) --------
  function ncContentRegimen(){
    let html = ncStepHeader('Selecciona el régimen','Define la cobertura con la que se atenderá la cita.');
    html += `<div class="wiz-table-wrap"><table><thead><tr>
      <th style="width:160px;">ID Tercero</th><th>Nombre</th><th style="width:40px;"></th>
    </tr></thead><tbody>`;
    NC_REGIMENES.forEach(r=>{
      const selected = NC.data.regimenId === r.id;
      html += `<tr class="${selected?'selected':''}" tabindex="0" onclick="ncSelectRegimen('${r.id}')" ondblclick="ncSelectRegimen('${r.id}',true)">
        <td>${r.id}</td>
        <td class="wiz-row-name">${r.nombre}</td>
        <td class="wiz-row-chevron">${NC_CHEVRON_SVG}</td>
      </tr>`;
      if(selected){
        html += `<tr class="wiz-detail-row"><td colspan="3"><div class="wiz-detail-inner">
          <table><thead><tr><th style="width:120px;">Tipo</th><th>Detalle</th></tr></thead><tbody>
          ${r.detalle.map(([t,d])=>`<tr><td>${t}</td><td>${d}</td></tr>`).join('')}
          </tbody></table>
        </div></td></tr>`;
      }
    });
    html += `</tbody></table></div>`;
    return html;
  }

  // -------- Paso: Especialidad --------
  function ncContentEspecialidad(){
    let html = ncStepHeader('Selecciona la especialidad', `Especialidades disponibles para ${ncRegimen()?ncRegimen().nombre:'el régimen seleccionado'}.`);
    html += ncSearchRow(['Buscar por Especialidad','Buscar por Id. Especialidad']);
    html += `<div id="nc-table-target">${ncTableEspecialidad()}</div>`;
    return html;
  }
  function ncTableEspecialidad(){
    const f0 = NC_FILTROS[0], f1 = NC_FILTROS[1];
    const rows = NC_ESPECIALIDADES.filter(e=>
      (!f0 || e.nombre.toLowerCase().includes(f0)) &&
      (!f1 || e.id.toLowerCase().includes(f1))
    );
    let html = `<div class="wiz-table-wrap"><table><thead><tr>
      <th style="width:80px;">ID</th><th>Especialidad</th><th style="width:180px;text-align:right;">Cantidad de médicos</th>
    </tr></thead><tbody>`;
    rows.forEach(e=>{
      const selected = NC.data.especialidadId === e.id;
      const disabled = e.medicos === 0;
      html += `<tr class="${selected?'selected':''} ${disabled?'row-disabled':''}"
        ${disabled?'':`tabindex="0" onclick="ncSelectEspecialidad('${e.id}')" ondblclick="ncSelectEspecialidad('${e.id}',true)"`}>
        <td>${e.id}</td>
        <td class="wiz-row-name">${e.nombre}</td>
        <td class="wiz-row-count" style="text-align:right;">${e.medicos}</td>
      </tr>`;
    });
    if(!rows.length) html += `<tr class="row-disabled"><td colspan="3" style="text-align:center;color:var(--ink-500);">Sin resultados</td></tr>`;
    html += `</tbody></table></div>`;
    return html;
  }

  // -------- Paso: Médico + disponibilidad --------
  function ncContentMedico(){
    let html = ncStepHeader('Selecciona el médico', `Médicos de ${ncEspecialidad()?ncEspecialidad().nombre:''} con agenda disponible.`);
    html += ncSearchRow(['Buscar por Nombre Médico','Buscar por ID Médico']);
    html += `<div id="nc-table-target">${ncTableMedico()}</div>`;
    return html;
  }
  function ncTableMedico(){
    const f0 = NC_FILTROS[0], f1 = NC_FILTROS[1];
    const medicos = ncMedicos().filter(m=>
      (!f0 || m.nombre.toLowerCase().includes(f0)) &&
      (!f1 || m.id.toLowerCase().includes(f1))
    );
    let html = `<div class="wiz-table-wrap"><table><thead><tr>
      <th style="width:110px;">ID Médico</th><th>Nombre Médico</th><th style="width:140px;">Citas disponibles</th><th>Especialidad</th>
    </tr></thead><tbody>`;
    medicos.forEach(m=>{
      const selected = NC.data.medicoId === m.id;
      const slots = NC_SLOTS[m.id] || [];
      html += `<tr class="${selected?'selected':''}" tabindex="0" onclick="ncSelectMedico('${m.id}')" ondblclick="ncSelectMedico('${m.id}')">
        <td>${m.id}</td>
        <td class="wiz-row-name">${m.nombre}</td>
        <td class="wiz-row-count">${slots.length}</td>
        <td>${ncEspecialidad()?ncEspecialidad().nombre:''}</td>
      </tr>`;
    });
    if(!medicos.length) html += `<tr class="row-disabled"><td colspan="4" style="text-align:center;color:var(--ink-500);">Sin resultados</td></tr>`;
    html += `</tbody></table></div>`;

    if(NC.data.medicoId){
      const medico = ncMedico();
      const dia = NC.data.dia || 0;
      const slots = ncSlotsForDay(NC.data.medicoId, dia);
      const dias = ncDiaOptions();
      html += `<div class="slots-card">
        <div class="slots-card-head">
          <div class="sch-left">
            ${NC_CLOCK_SVG}
            <div>
              <div class="sch-name">${medico ? medico.nombre : ''}</div>
              <div class="sch-sub">${ncEspecialidad() ? ncEspecialidad().nombre : ''}</div>
            </div>
          </div>
          <span class="slots-badge">${slots.length} horarios disponibles</span>
        </div>
        <div class="day-strip">
          ${dias.map(d=>`<div class="day-chip ${d.offset===dia?'active':''}" tabindex="0" onclick="ncSelectDia(${d.offset})">
            <div class="dc-label">${d.label}</div>
            <div class="dc-date">${d.numero} ${d.mes}</div>
          </div>`).join('')}
        </div>
        <div class="slots-grid">
          ${slots.length ? slots.map(h=>ncSlotBtn(h)).join('') : `<span class="slots-empty">Este médico no tiene horarios disponibles este día. Prueba con otra fecha.</span>`}
        </div>
      </div>`;
    }
    return html;
  }
  // NOTA A11Y: ondblclick es un acelerador SOLO-MOUSE (seleccionar + avanzar en un
  // gesto). No tiene equivalente por teclado -- el listener de keydown global solo
  // mapea Enter/Espacio a un click() simple, nunca a dblclick. Esto es intencional:
  // el flujo de un solo clic + botón "Continuar" sigue siendo 100% funcional por
  // teclado, así que no hay pérdida de paridad, solo de un atajo de conveniencia
  // para usuarios de mouse/trackpad.
  function ncSlotBtn(hora){
    const selected = NC.data.horario === hora;
    return `<div class="slot-btn ${selected?'selected':''}" tabindex="0" onclick="ncSelectSlot('${hora}')" ondblclick="ncSelectSlot('${hora}',true)">
      <div class="sb-h">${hora}</div>
    </div>`;
  }

  // -------- Paso: Contratación --------
  function ncContentContratacion(){
    const d = NC.data;
    let html = ncStepHeader('Selecciona el contrato','Verifica el contexto y elige el contrato vigente.');
    const patienteContratacion = getPatient();
    html += `<dl class="ro-fields">
      <div class="ro-field"><dt>Sede</dt><dd class="ro-value">01 — Sede Norte</dd></div>
      <div class="ro-field"><dt>Administradora</dt><dd class="ro-value">${ncRegimen() ? ncRegimen().id : ''}</dd></div>
      <div class="ro-field"><dt>ID. Afiliado</dt><dd class="ro-value">${patienteContratacion ? patienteContratacion.documento : ''}</dd></div>
      <div class="ro-field"><dt>Área</dt><dd class="ro-value">Consulta Externa</dd></div>
      <div class="ro-field"><dt>Especialidad</dt><dd class="ro-value">${ncEspecialidad() ? ncEspecialidad().nombre : ''}</dd></div>
      <div class="ro-field"><dt>Régimen</dt><dd class="ro-value">${ncRegimen() ? ncRegimen().nombre : ''}</dd></div>
    </dl>`;
    html += `<div class="wiz-table-wrap"><table><thead><tr>
      <th style="width:70px;">ID</th><th style="width:100px;">N° Cto.</th><th>Contrato</th>
    </tr></thead><tbody>`;
    NC_CONTRATOS.forEach(c=>{
      const selected = d.contratoId === c.id;
      html += `<tr class="${selected?'selected':''}" tabindex="0" onclick="ncSelectContrato('${c.id}')" ondblclick="ncSelectContrato('${c.id}',true)">
        <td>${c.id}</td>
        <td class="wiz-row-count">${c.nCto}</td>
        <td class="wiz-row-name">${c.contrato}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
    return html;
  }

  // -------- Paso: Servicios --------
  function ncContentServicios(){
    let html = ncStepHeader('Selecciona los servicios','Puedes elegir uno o varios servicios contratados.');
    html += ncSearchRow(['Buscar por Nombre Procedimiento','Buscar por ID Servicio']);
    html += `<div id="nc-table-target">${ncTableServicios()}</div>`;
    return html;
  }
  function ncTableServicios(){
    const f0 = NC_FILTROS[0], f1 = NC_FILTROS[1];
    const rows = NC_SERVICIOS.filter(s=>
      (!f0 || s.nombre.toLowerCase().includes(f0)) &&
      (!f1 || s.id.toLowerCase().includes(f1))
    );
    let html = `<div class="wiz-table-wrap"><table><thead><tr>
      <th style="width:130px;">ID. Servicio</th><th>Procedimiento</th><th style="width:120px;text-align:right;">Valor</th>
    </tr></thead><tbody>`;
    rows.forEach(s=>{
      const selected = NC.data.servicios.includes(s.id);
      html += `<tr class="${selected?'selected':''}" tabindex="0" onclick="ncToggleServicio('${s.id}')" ondblclick="ncToggleServicio('${s.id}',true)">
        <td>${s.id}</td>
        <td class="wiz-row-name">${s.nombre}</td>
        <td style="text-align:right;">${fmtCOP(s.valor)}</td>
      </tr>`;
    });
    if(!rows.length) html += `<tr class="row-disabled"><td colspan="3" style="text-align:center;color:var(--ink-500);">Sin resultados</td></tr>`;
    html += `</tbody></table></div>`;
    return html;
  }

  // -------- Paso: Información de la cita --------
  function ncContentInfo(){
    const d = NC.data;
    let html = `<div class="info-card">
      <div class="info-card-head">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
  <path d="M14 2v5a1 1 0 0 0 1 1h5" /></svg>
        <span class="title">Información de Atención</span>
      </div>
      <div class="field-block">
        <label>Finalidad<span class="req">*</span></label>
        <select onchange="ncSelectFinalidad(this.value)">
          <option value="" ${!d.finalidad?'selected':''} disabled>-- Seleccionar finalidad --</option>
          ${NC_FINALIDADES.map(f=>`<option value="${f}" ${d.finalidad===f?'selected':''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="field-block" style="margin-bottom:0;">
        <label for="nc-telefono">Teléfono Aviso<span class="req">*</span></label>
        <input id="nc-telefono" type="tel" inputmode="numeric" pattern="[0-9\s]{7,10}" placeholder="Ej: 310 842 9173" value="${d.telefono}" aria-describedby="nc-telefono-hint" oninput="NC.data.telefono=this.value; ncUpdateContinueState();">
        <div class="field-hint" id="nc-telefono-hint">10 dígitos, sin indicativo (ej: 310 842 9173)</div>
      </div>
    </div>`;
    return html;
  }

  // -------- Paso: Resumen --------
  function ncContentResumen(){
    const d = NC.data;
    const medico = ncMedico();
    const contrato = ncContrato();
    const servicios = NC_SERVICIOS.filter(s=>d.servicios.includes(s.id));
    const total = servicios.reduce((a,s)=>a+s.valor, 0);

    let html = `<div class="wizard-step-hint">Verifica la información antes de confirmar el agendamiento.</div>`;

    html += ncSummaryBlock('Cobertura', 0, `
      <div class="summary-row"><span class="sr-k">Régimen</span><span class="sr-v">${ncRegimen() ? ncRegimen().nombre : ''}</span></div>
      <div class="summary-row"><span class="sr-k">Especialidad</span><span class="sr-v">${ncEspecialidad() ? ncEspecialidad().nombre : ''}</span></div>
      <div class="summary-row"><span class="sr-k">Médico</span><span class="sr-v">${medico ? medico.nombre : ''}</span></div>
      <div class="summary-row"><span class="sr-k">Fecha</span><span class="sr-v">${ncFechaLegible(d.dia || 0)}</span></div>
      <div class="summary-row"><span class="sr-k">Horario</span><span class="sr-v">${d.horario || ''}</span></div>
      <div class="summary-row"><span class="sr-k">Contrato</span><span class="sr-v">${contrato ? `${contrato.id} · ${contrato.contrato}` : ''}</span></div>
    `);

    html += ncSummaryBlock(`Servicios (${servicios.length})`, 4, `
      ${servicios.map(s=>`<div class="summary-row"><span class="sr-k">${s.nombre}</span><span class="sr-v">${fmtCOP(s.valor)}</span></div>`).join('')}
      <div class="summary-total"><span>Total</span><span>${fmtCOP(total)}</span></div>
    `);

    html += ncSummaryBlock('Información de la cita', 5, `
      <div class="summary-row"><span class="sr-k">Finalidad</span><span class="sr-v">${d.finalidad || ''}</span></div>
      <div class="summary-row"><span class="sr-k">Teléfono de aviso</span><span class="sr-v">${d.telefono || ''}</span></div>
    `, true);

    return html;
  }

  function ncSummaryBlock(titulo, jumpToIdx, rowsHtml, isLast){
    return `<div class="summary-block${isLast?' last':''}">
      <div class="summary-block-head">
        <span class="sb-title">${titulo}</span>
        <button class="summary-edit-btn" onclick="ncGoTo(${jumpToIdx})" aria-label="Editar" title="Editar">${NC_EDIT_SVG}</button>
      </div>
      ${rowsHtml}
    </div>`;
  }

  function ncRenderTableOnly(){
    // Re-renderiza solo la tabla filtrable, sin perder el foco del buscador.
    const target = document.getElementById('nc-table-target');
    if(!target) return;
    const key = NC_FLOW[NC.pos].key;
    if(key==='especialidad') target.innerHTML = ncTableEspecialidad();
    else if(key==='medico') target.innerHTML = ncTableMedico();
    else if(key==='servicios') target.innerHTML = ncTableServicios();
  }

  function ncRenderContent(){
    const el = document.getElementById('nc-content');
    const key = NC_FLOW[NC.pos].key;
    NC_FILTROS = ['', ''];
    if(key==='regimen') el.innerHTML = ncContentRegimen();
    else if(key==='especialidad') el.innerHTML = ncContentEspecialidad();
    else if(key==='medico') el.innerHTML = ncContentMedico();
    else if(key==='contratacion') el.innerHTML = ncContentContratacion();
    else if(key==='servicios') el.innerHTML = ncContentServicios();
    else if(key==='info') el.innerHTML = ncContentInfo();
    else if(key==='resumen') el.innerHTML = ncContentResumen();
  }

  function ncRenderFooter(){
    const back = document.getElementById('nc-back-btn');
    const cont = document.getElementById('nc-continue-btn');
    back.style.visibility = NC.pos === 0 ? 'hidden' : 'visible';
    const isLast = NC.pos === NC_FLOW.length - 1;
    if(isLast){
      cont.innerHTML = `${NC_CHECK_SVG_BTN}Confirmar cita`;
      cont.onclick = ncConfirmar;
      cont.disabled = false;
    } else {
      cont.innerHTML = `Continuar<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>`;
      cont.onclick = ncNext;
      cont.disabled = !ncIsValid(NC_FLOW[NC.pos].key);
    }
  }
  const NC_CHECK_SVG_BTN = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function ncRender(){
    ncRenderRail();
    ncRenderMainHeader();
    ncRenderStepper();
    ncRenderContent();
    ncRenderFooter();
  }

  function ncConfirmar(){
    const patient = getPatient();
    const d = NC.data;
    const dia = d.dia || 0;
    const servicios = NC_SERVICIOS.filter(s=>d.servicios.includes(s.id));
    const total = servicios.reduce((a,s)=>a+s.valor, 0);
    const medico = ncMedico();
    const doctorRecord = DOCTORS.find(doc=>doc.codigo===d.medicoId);
    const fechaCita = ncFechaParaDia(dia).toLocaleDateString('es-CO');

    const filaNueva = {
      hora:d.horario, dur:'20min',
      paciente:patient ? patient.nombre : '',
      tipo:d.finalidad,
      eps:patient ? patient.eps : (ncRegimen() ? ncRegimen().nombre.replace(' EPS','') : ''),
      valor:fmtCOP(total),
      tel:d.telefono,
      fsol:fechaCita,
      estado:'ocupado',
    };

    // La agenda "de hoy" (tabla de Asignación de Citas) es un concepto propio
    // de esa página, no de este flujo compartido — se delega vía callback
    // opcional para que otras páginas (p. ej. Programar Cita) puedan usar el
    // mismo wizard sin depender de esa tabla. El segundo argumento lleva
    // además los campos que ScheduleGrid necesita y `filaNueva` no tiene
    // (doctorId real, tipo mapeado a las 3 claves de TIPO_LABEL, documento
    // del paciente) — AsignacionCitas solo desestructura `{ dia }`, así que
    // agregar campos acá no rompe ese consumidor existente.
    onAppointmentConfirmed?.(filaNueva, {
      dia,
      doctorId: doctorRecord ? doctorRecord.id : null,
      patientDoc: patient ? `CC ${patient.documento}` : '',
      tipo: NC_FINALIDAD_TIPO[d.finalidad] || 'control',
      horario: d.horario,
      // Nombre(s) real(es) del/los servicio(s) elegidos en el paso
      // "Servicios" — ver DetalleCitaModal.jsx (campo "Servicio"), que antes
      // solo mostraba esta info en el tooltip nativo de la tarjeta.
      servicio: servicios.map(s=>s.nombre).join(', '),
    });

    // Cierre directo (no ncClose()): la cita ya quedó confirmada, no hay
    // nada que "descartar" — ncClose() solo debe pedir confirmación cuando
    // se abandona el wizard CON progreso sin guardar.
    document.getElementById('nc-overlay').classList.remove('open');
    ncToast(`Cita agendada para el ${ncFechaLegible(dia)} a las ${d.horario} con ${medico ? medico.nombre : ''}.`);
    if(clearPatientAfterConfirm) setPatient(null);
  }

  function ncToast(msg){
    let t = document.getElementById('nc-toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'nc-toast';
      t.className = 'nc-toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      t.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg><span id="nc-toast-msg"></span>`;
      document.body.appendChild(t);
    }
    document.getElementById('nc-toast-msg').textContent = msg;
    t.classList.add('show');
    clearTimeout(window.__ncToastTimer);
    window.__ncToastTimer = setTimeout(()=>t.classList.remove('show'), 3500);
  }

  /* ================================================================
     WIZARD: AGREGAR PACIENTE
     4 pasos: Datos básicos → Afiliación → Ubicación → Clasificación
     socioeconómica. Cada paso se valida con el HTML5 nativo (required)
     antes de avanzar — los campos obligatorios vacíos se resaltan en
     ámbar vía CSS (:required:placeholder-shown / :invalid), sin JS
     por campo. Se dispara desde "Agregar paciente" en el buscador.
  ================================================================= */

  const AP_ICON_EYE = '<svg class="icon pf-trailing-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
  const AP_ICON_SEARCH = '<svg class="icon pf-trailing-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>';
  const AP_ICON_CAMERA = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>';
  const AP_ICON_PAPERCLIP = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg>';

  const AP_STEPS = [
    { key:'basicos',        label:'Datos básicos',                  desc:'Documento, nombres y datos personales' },
    { key:'afiliacion',     label:'Afiliación',                     desc:'EPS, tipo de afiliado y estado' },
    { key:'ubicacion',      label:'Ubicación',                      desc:'Dirección, contacto y residencia' },
    { key:'socioeconomica', label:'Clasificación socioeconómica',   desc:'Grupo poblacional y variables sociales' },
  ];

  const AP_OPTS = {
    tipoDocumento: ['CC - Cédula de Ciudadanía','TI - Tarjeta de Identidad','CE - Cédula de Extranjería','PA - Pasaporte','RC - Registro Civil','PEP - Permiso Especial de Permanencia'],
    pais: ['COL - Colombia','VEN - Venezuela','USA - Estados Unidos','ESP - España','ECU - Ecuador'],
    ciudad: ['Bogotá D.C.','Medellín','Cali','Barranquilla','Bucaramanga','Cartagena','Pereira'],
    sexo: ['Masculino','Femenino','Intersexual'],
    genero: ['Masculino','Femenino','Transgénero','No binario','Otro'],
    estadoCivil: ['Soltero(a)','Casado(a)','Unión libre','Divorciado(a)','Viudo(a)'],
    grupoSanguineo: ['O+','O-','A+','A-','B+','B-','AB+','AB-'],
    tipoAfiliado: ['Cotizante','Beneficiario','Adicional'],
    asegurador: ['Sura','Nueva EPS','Compensar','Salud Total','Colsanitas','Famisanar','Coomeva'],
    estadoAfiliacion: ['Activo','Inactivo','Suspendido','Retirado'],
    zona: ['Urbana','Rural'],
    grupoPoblacional: ['Población general','Desplazado','Indígena','ROM / Gitano','Migrante','Habitante de calle'],
    tipoDiscapacidad: ['Ninguna','Física','Visual','Auditiva','Cognitiva','Múltiple'],
    nivelSocioeconomico: ['Estrato 1','Estrato 2','Estrato 3','Estrato 4','Estrato 5','Estrato 6'],
    grupoEtnico: ['Ninguno','Indígena','Afrocolombiano','Raizal','Palenquero','ROM / Gitano'],
    nivelEducativo: ['Ninguno','Primaria','Secundaria','Técnico','Tecnólogo','Universitario','Posgrado'],
    incapacidad: ['No','Temporal','Permanente'],
    religion: ['Católica','Cristiana / Evangélica','Testigo de Jehová','Ninguna','Otra'],
    raza: ['Mestizo','Blanco','Afrodescendiente','Indígena','Otro'],
    siNo: ['Sí','No'],
  };

  let apPos = 0;
  let apMaxReached = 0;
  let apData = {};
  let apEditIndex = null;
  // Modo edición "externo": permite abrir el wizard precargado con datos que
  // NO viven en el PATIENTS interno de este módulo (p.ej. el paciente viene
  // del dataset de Lista de Pacientes/mockPatientsData.js). apSubmit() llama
  // a este callback en vez de tocar PATIENTS[apEditIndex] — ver
  // apOpenEditExternal() y FichaPaciente.jsx.
  let apExternalOnSave = null;

  function apField(f){
    const val = apData[f.name] !== undefined ? apData[f.name] : (f.value || '');
    const reqAttr = f.required ? 'required' : '';
    const star = f.required ? '<span class="req">*</span>' : '';
    const fieldId = `pf-${f.name}`;
    const errId = `pf-err-${f.name}`;
    let control;
    if(f.options){
      const opts = `<option value="" ${!val?'selected':''}>${f.placeholder || 'Seleccionar'}</option>`
        + f.options.map(o=>`<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
      control = `<select id="${fieldId}" name="${f.name}" aria-describedby="${errId}" ${reqAttr}>${opts}</select>`;
    } else {
      control = `<input id="${fieldId}" type="${f.type||'text'}" name="${f.name}" placeholder="${f.placeholder||f.label}" value="${val}" aria-describedby="${errId}" ${reqAttr}>`;
    }
    const wrapCls = f.icon ? 'pf-field-wrap has-icon' : 'pf-field-wrap';
    return `<div class="pf-field">
      <label for="${fieldId}">${f.label}${star}</label>
      <div class="${wrapCls}">${control}${f.icon ? f.icon : ''}</div>
      <div class="field-error" id="${errId}" role="alert"></div>
    </div>`;
  }

  function apRow(cols, fields){
    const cls = cols === 2 ? 'pf-grid' : `pf-grid cols-${cols}`;
    return `<div class="${cls}">${fields.map(apField).join('')}</div>`;
  }

  function apContentBasicos(){
    let html = `<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
      <button type="button" class="pf-photo-link" onclick="ncToast('Función de captura de foto en desarrollo.')">${AP_ICON_CAMERA}Tomar foto</button>
    </div>`;

    html += apRow(2, [
      { name:'tipoDocumento', label:'Tipo de documento', required:true, options:AP_OPTS.tipoDocumento },
      { name:'idAfiliado', label:'Id. Afiliado', required:true },
    ]);
    html += apRow(2, [
      { name:'primerApellido', label:'Primer Apellido', required:true },
      { name:'segundoApellido', label:'Segundo Apellido', required:false },
    ]);
    html += apRow(2, [
      { name:'primerNombre', label:'Primer Nombre', required:true },
      { name:'segundoNombre', label:'Segundo Nombre', required:false },
    ]);
    html += apRow(3, [
      { name:'fechaNacimiento', label:'Fecha de nacimiento', required:true, type:'date' },
      { name:'paisOrigen', label:'País origen', required:true, options:AP_OPTS.pais, icon:AP_ICON_EYE },
      { name:'ciudadNacimiento', label:'Ciudad', required:true, options:AP_OPTS.ciudad, icon:AP_ICON_EYE },
    ]);
    html += apRow(2, [
      { name:'documentoId', label:'Documento Id.', required:false },
      { name:'ciudadExpedicion', label:'Ciudad de expedición', required:true },
    ]);
    html += apRow(4, [
      { name:'sexo', label:'Sexo', required:true, options:AP_OPTS.sexo },
      { name:'genero', label:'Género', required:true, options:AP_OPTS.genero },
      { name:'estadoCivil', label:'Estado civil', required:true, options:AP_OPTS.estadoCivil },
      { name:'grupoSanguineo', label:'Grupo sanguíneo', required:true, options:AP_OPTS.grupoSanguineo },
    ]);
    return html;
  }

  function apContentAfiliacion(){
    let html = apRow(2, [
      { name:'idSede', label:'Id. Sede', required:false, value:'02', icon:AP_ICON_EYE },
    ]);
    html += apRow(2, [
      { name:'tipoAfiliado', label:'Tipo de afiliado', required:true, options:AP_OPTS.tipoAfiliado },
      { name:'fechaAfiliacion', label:'Fecha de afiliación', required:false, type:'date' },
    ]);
    html += `<div class="pf-field" style="margin-bottom:16px;">
      <label for="pf-asegurador">Asegurador<span class="req">*</span></label>
      <div class="pf-field-wrap has-icon">${apFieldControlOnly({name:'asegurador', label:'Asegurador', required:true, options:AP_OPTS.asegurador})}${AP_ICON_EYE}</div>
      <div class="field-error" id="pf-err-asegurador" role="alert"></div>
    </div>`;
    html += apRow(3, [
      { name:'estadoAfiliacion', label:'Estado', required:false, options:AP_OPTS.estadoAfiliacion, value:'Activo' },
      { name:'fechaEstado', label:'Fecha de estado', required:false, type:'date' },
      { name:'ciudadProcedencia', label:'Ciudad procedencia', required:true, options:AP_OPTS.ciudad, icon:AP_ICON_EYE },
    ]);
    return html;
  }

  function apFieldControlOnly(f){
    const val = apData[f.name] !== undefined ? apData[f.name] : (f.value || '');
    const reqAttr = f.required ? 'required' : '';
    const opts = `<option value="" ${!val?'selected':''}>${f.placeholder || 'Seleccionar'}</option>`
      + f.options.map(o=>`<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
    return `<select id="pf-${f.name}" name="${f.name}" aria-describedby="pf-err-${f.name}" ${reqAttr}>${opts}</select>`;
  }

  function apContentUbicacion(){
    let html = apRow(3, [
      { name:'paisResidencia', label:'País residencia', required:true, options:AP_OPTS.pais, icon:AP_ICON_EYE },
      { name:'ciudadResidencia', label:'Ciudad', required:true, options:AP_OPTS.ciudad, icon:AP_ICON_EYE },
      { name:'localidad', label:'Localidad', required:false },
    ]);
    html += apRow(3, [
      { name:'direccionResidencia', label:'Dirección de residencia', required:true },
      { name:'zona', label:'Zona', required:true, options:AP_OPTS.zona },
      { name:'zonaPostal', label:'Zona postal', required:true, icon:AP_ICON_EYE },
    ]);
    html += apRow(3, [
      { name:'celular', label:'Celular', required:true, type:'tel' },
      { name:'telefonoResidencia', label:'Teléfono residencia', required:false, type:'tel' },
      { name:'telefonoLaboral', label:'Teléfono laboral', required:false, type:'tel' },
    ]);
    html += apRow(2, [
      { name:'correoElectronico', label:'Correo electrónico', required:true, type:'email' },
    ]);
    return html;
  }

  function apContentSocioeconomica(){
    let html = apRow(2, [
      { name:'grupoPoblacional', label:'Grupo poblacional', required:true, options:AP_OPTS.grupoPoblacional },
      { name:'tipoDiscapacidad', label:'Tipo de discapacidad', required:true, options:AP_OPTS.tipoDiscapacidad },
    ]);
    html += apRow(2, [
      { name:'nivelSocioeconomico', label:'Nivel socioeconómico', required:true, options:AP_OPTS.nivelSocioeconomico },
      { name:'grupoEtnico', label:'Grupo étnico', required:true, options:AP_OPTS.grupoEtnico },
    ]);
    html += apRow(2, [
      { name:'nivelEducativo', label:'Nivel educativo', required:true, options:AP_OPTS.nivelEducativo },
      { name:'incapacidad', label:'Incapacidad', required:true, options:AP_OPTS.incapacidad },
    ]);
    html += apRow(2, [
      { name:'idOcupacion', label:'Id. Ocupación', required:true, placeholder:'Seleccionar la ocupación', icon:AP_ICON_SEARCH },
    ]);
    html += apRow(2, [
      { name:'religion', label:'Religión', required:true, options:AP_OPTS.religion },
      { name:'raza', label:'Raza', required:true, options:AP_OPTS.raza },
    ]);
    html += apRow(2, [
      { name:'victimaConflicto', label:'Víctima de conflicto', required:true, options:AP_OPTS.siNo },
      { name:'situacionDesplazamiento', label:'Situación de desplazamiento', required:true, options:AP_OPTS.siNo },
    ]);
    html += `<div class="pf-attach-row" style="margin-top:18px;" onclick="ncToast('Función de adjuntar documentos en desarrollo.')">${AP_ICON_PAPERCLIP}Adjuntar documentos</div>`;
    return html;
  }

  const AP_CONTENT_FN = {
    basicos: apContentBasicos,
    afiliacion: apContentAfiliacion,
    ubicacion: apContentUbicacion,
    socioeconomica: apContentSocioeconomica,
  };

  function apSaveCurrentStepValues(){
    const form = document.getElementById('ap-form');
    form.querySelectorAll('input,select').forEach(el=>{
      if(el.name) apData[el.name] = el.value;
    });
  }

  function apRenderRail(){
    const rail = document.getElementById('ap-rail');
    rail.innerHTML = AP_STEPS.map((s,idx)=>{
      let cls = 'rail-main-step';
      let circle = String(idx+1);
      if(idx < apPos){ cls += ' done'; circle = NC_CHECK_SVG; }
      else if(idx === apPos){ cls += ' active'; }
      else if(idx > apMaxReached){ cls += ' locked'; }
      const clickable = idx <= apMaxReached;
      return `<div class="${cls}" ${clickable ? `tabindex="0" role="button" onclick="apGoTo(${idx})"` : ''}>
        <span class="rms-circle">${circle}</span>
        <span>
          <div class="rms-title">${s.label}</div>
          <div class="rms-sub">${s.desc}</div>
        </span>
      </div>`;
    }).join('');
  }

  function apRenderHeader(){
    document.getElementById('ap-progress-text').textContent = `Paso ${apPos + 1} de ${AP_STEPS.length}`;
  }

  function apRenderContent(){
    const key = AP_STEPS[apPos].key;
    document.getElementById('ap-content').innerHTML = AP_CONTENT_FN[key]();
  }

  function apRenderFooter(){
    const back = document.getElementById('ap-back-btn');
    const cont = document.getElementById('ap-continue-btn');
    back.style.visibility = apPos === 0 ? 'hidden' : 'visible';
    const isLast = apPos === AP_STEPS.length - 1;
    if(isLast){
      cont.innerHTML = (apEditIndex !== null || apExternalOnSave) ? `${NC_CHECK_SVG_BTN}Guardar cambios` : `${NC_CHECK_SVG_BTN}Agregar paciente`;
      cont.onclick = apSubmit;
    } else {
      cont.innerHTML = `Siguiente<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>`;
      cont.onclick = apNext;
    }
  }

  function apRender(){
    apRenderRail();
    apRenderHeader();
    apRenderContent();
    apRenderFooter();
  }

  function apOpen(){
    apPos = 0; apMaxReached = 0; apData = {}; apEditIndex = null; apExternalOnSave = null;
    document.getElementById('ap-rail-eyebrow').textContent = 'Nuevo registro';
    document.getElementById('ap-rail-title').textContent = 'Agregar Paciente';
    document.getElementById('ap-rail-sub').textContent = 'Historia clínica nueva';
    closePatientSearch();
    document.getElementById('ap-overlay').classList.add('open');
    apRender();
  }

  // Abre el wizard en modo edición para un paciente que NO vive en el
  // PATIENTS interno de este módulo (p.ej. Lista de Pacientes, que tiene su
  // propio dataset — ver mockPatientDetail.js). `formData` debe traer las
  // mismas claves que usan los pasos del wizard (apContentBasicos/
  // apContentAfiliacion/...). onSave(datosFormulario) se llama en vez de
  // mutar PATIENTS[apEditIndex] cuando el usuario confirma en el último paso.
  function apOpenEditExternal(formData, { titulo, subtitulo, onSave }){
    apEditIndex = null;
    apExternalOnSave = onSave;
    apPos = 0;
    apMaxReached = AP_STEPS.length - 1;
    apData = { ...formData };

    document.getElementById('ap-rail-eyebrow').textContent = 'Editar registro';
    document.getElementById('ap-rail-title').textContent = titulo || '';
    document.getElementById('ap-rail-sub').textContent = subtitulo || '';

    closePatientSearch();
    document.getElementById('ap-overlay').classList.add('open');
    apRender();
  }

  function apOpenEdit(idx){
    const p = PATIENTS[idx];
    if(!p) return;
    apEditIndex = idx;
    apExternalOnSave = null;
    apPos = 0;
    apMaxReached = AP_STEPS.length - 1; // en edición se puede navegar libremente a cualquier paso

    if(p.formData){
      apData = { ...p.formData };
    } else {
      // Paciente sin historial completo (registro previo): reconstruye lo posible.
      const partes = (p.nombre || '').split(' ').filter(Boolean);
      apData = {
        primerNombre: partes[0] || '',
        segundoNombre: partes.length > 3 ? partes[1] : '',
        primerApellido: partes.length > 3 ? partes[2] : (partes[1] || ''),
        segundoApellido: partes.length > 3 ? partes[3] : (partes[2] || ''),
        idAfiliado: p.documento || '',
        sexo: p.sexo || '',
        ciudadResidencia: p.ciudad || '',
        asegurador: p.eps || '',
        celular: p.telefono !== '—' ? (p.telefono || '') : '',
      };
    }

    document.getElementById('ap-rail-eyebrow').textContent = 'Editar registro';
    document.getElementById('ap-rail-title').textContent = p.nombre;
    document.getElementById('ap-rail-sub').textContent = `Documento ${p.documento}`;

    closePatientSearch();
    document.getElementById('ap-overlay').classList.add('open');
    apRender();
  }

  function apClose(){
    document.getElementById('ap-overlay').classList.remove('open');
  }

  function apGoTo(idx){
    if(idx > apMaxReached) return;
    apSaveCurrentStepValues();
    apPos = idx;
    apRender();
  }

  // A11Y: refleja el estado de validación nativa en aria-invalid + mensaje
  // de error asociado (aria-describedby ya apunta a estos contenedores desde apField).
  function apMarkFieldValidity(form){
    form.querySelectorAll('input, select').forEach(el=>{
      const errEl = document.getElementById(`pf-err-${el.name}`);
      if(el.checkValidity()){
        el.removeAttribute('aria-invalid');
        if(errEl){ errEl.textContent = ''; errEl.classList.remove('show'); }
      } else {
        el.setAttribute('aria-invalid', 'true');
        if(errEl){ errEl.textContent = el.validationMessage; errEl.classList.add('show'); }
      }
    });
  }

  function apNext(){
    const form = document.getElementById('ap-form');
    apMarkFieldValidity(form);
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    apSaveCurrentStepValues();
    if(apPos < AP_STEPS.length - 1){
      apPos++;
      if(apPos > apMaxReached) apMaxReached = apPos;
      apRender();
    }
  }

  function apBack(){
    apSaveCurrentStepValues();
    if(apPos > 0){ apPos--; apRender(); }
  }

  function apSubmit(){
    const form = document.getElementById('ap-form');
    apMarkFieldValidity(form);
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    apSaveCurrentStepValues();

    const nombreCompleto = [apData.primerNombre, apData.segundoNombre, apData.primerApellido, apData.segundoApellido]
      .filter(Boolean).join(' ');
    const iniciales = (apData.primerNombre?.[0] || 'P') + (apData.primerApellido?.[0] || 'A');
    let edad = '';
    if(apData.fechaNacimiento){
      const nac = new Date(apData.fechaNacimiento);
      const hoy = new Date();
      edad = hoy.getFullYear() - nac.getFullYear() - ((hoy.getMonth()<nac.getMonth() || (hoy.getMonth()===nac.getMonth() && hoy.getDate()<nac.getDate())) ? 1 : 0);
    }

    const datosFormulario = {
      iniciales: iniciales.toUpperCase(),
      nombre: nombreCompleto || 'Paciente sin nombre',
      edad: edad || '—',
      sexo: apData.sexo || '—',
      ciudad: apData.ciudadResidencia || '—',
      documento: apData.idAfiliado || '—',
      telefono: apData.celular || '—',
      eps: (apData.asegurador || '—'),
      formData: { ...apData },
    };

    if(apExternalOnSave){
      const onSave = apExternalOnSave;
      apExternalOnSave = null;
      apClose();
      onSave(datosFormulario);
      ncToast(`Datos de ${datosFormulario.nombre} actualizados correctamente.`);
    } else if(apEditIndex !== null){
      const paciente = PATIENTS[apEditIndex];
      Object.assign(paciente, datosFormulario);
      if(getPatient() === paciente) setPatient(paciente);
      apClose();
      ncToast(`Datos de ${paciente.nombre} actualizados correctamente.`);
    } else {
      const nuevoPaciente = {
        ...datosFormulario,
        estado: 'activo',
        citasFuturas: 0,
      };
      PATIENTS.push(nuevoPaciente);
      setPatient(nuevoPaciente);
      apClose();
      ncToast(`Paciente ${nuevoPaciente.nombre} agregado correctamente.`);
      // Mismo criterio que confirmPatientSelection(): si el consumidor pidió
      // enterarse de qué paciente quedó activo (ver onPatientConfirmed más
      // arriba), un paciente recién registrado cuenta igual que uno elegido
      // de la tabla — quien busca "Agregar paciente" desde acá normalmente
      // es porque no lo encontró en la lista, no porque quiera un paciente
      // distinto del que ya venía buscando.
      onPatientConfirmed?.(nuevoPaciente);
    }
  }

  // Igual que en AsignacionCitas/legacy-app.js: los atributos de evento
  // inline (onclick="...") resuelven identificadores en el scope global, así
  // que todo lo que el HTML generado necesita llamar vive en `window`.
  const exported = {
    openPatientSearch, closePatientSearch, filterPatients, setPsSelected,
    togglePsRowMenu, psAccionEditar, psAccionHistorial, psAccionDesactivar,
    confirmPatientSelection,
    ncOpen, ncClose, ncCancelDiscard, ncConfirmDiscard, ncBack, ncGoTo, ncSelectRegimen, ncSelectEspecialidad,
    ncSelectMedico, ncSelectDia, ncSelectSlot, ncSelectContrato,
    ncToggleServicio, ncSelectFinalidad, ncFiltrar, ncUpdateContinueState, ncToast,
    apOpen, apOpenEditExternal, apClose, apGoTo, apBack,
  };
  Object.assign(window, exported);

  return function cleanup() {
    // Mismo motivo que el reset al inicio de initNuevaCita(): si esta
    // instancia se desmonta con algún overlay todavía abierto (se navegó a
    // otra ruta sin cerrar el wizard), no debe dejar ese estado visible
    // detrás para la siguiente página que monte este mismo flujo.
    ['ps-overlay', 'nc-overlay', 'nc-discard-overlay', 'ap-overlay', 'ps-context-menu'].forEach((id) => {
      document.getElementById(id)?.classList.remove('open');
    });
    document.removeEventListener('click', cerrarPsRowMenu);
    document.removeEventListener('keydown', handleDiscardOverlayEscape);
    psTableWrapEl?.removeEventListener('scroll', cerrarPsRowMenu);
    clearTimeout(window.__ncToastTimer);
    delete window.NC;
    for (const name of Object.keys(exported)) delete window[name];
  };
}
