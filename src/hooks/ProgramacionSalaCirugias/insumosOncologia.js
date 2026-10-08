// Insumos (canasta) de cada cirugía oncológica del mock de Programación de Sala
// de Cirugía. Datos puros: tuplas [nombre, cantidad], armadas como en un quirófano
// real -- barrera estéril + material de la vía de abordaje (abierta, laparoscópica,
// menor) + lo específico del procedimiento (grapadoras, drenes, marcadores...).
// Los nombres son únicos dentro de cada lista: la hoja de gasto y el consumo
// identifican el insumo por nombre.

// Une listas por nombre: un insumo repetido conserva su lugar y toma la última cantidad.
export function unir(...partes) {
  const porNombre = new Map();
  partes.flat().forEach(([nombre, cantidad]) => porNombre.set(nombre, cantidad));
  return [...porNombre];
}

const BARRERA = [
  ['Bata quirúrgica estéril', 5], ['Guantes estériles talla 7.5', 6], ['Campo quirúrgico estéril (set de laparotomía)', 1],
  ['Clorhexidina 2% solución antiséptica', 1],
];

// Cirugía abierta mayor (abdomen, cuello, retroperitoneo).
const ABIERTA = unir(BARRERA, [
  ['Compresas de laparotomía', 10], ['Gasas estériles', 20], ['Hoja de bisturí #10', 2], ['Electrobisturí lápiz desechable', 1],
  ['Placa de electrobisturí', 1], ['Solución salina 0.9% 1000 ml', 4], ['Sutura Vicryl 0', 3], ['Sutura Vicryl 2-0', 4],
  ['Grapadora de piel 35 W', 1],
]);

// Laparoscopia: puertos, insuflación, extracción de la pieza y energía.
const LAPAROSCOPIA = unir(BARRERA, [
  ['Aguja de Veress', 1], ['Trocar 12mm', 2], ['Trocar 5mm', 3], ['Bolsa de extracción', 1], ['Clips de titanio', 8],
  ['Bisturí ultrasónico laparoscópico', 1], ['Gasas estériles', 10], ['Hoja de bisturí #11', 1], ['Sutura Vicryl 2-0', 3],
  ['Sutura Monocryl 4-0', 2], ['Solución salina 0.9% 1000 ml', 3], ['Protector de herida (anillo)', 1],
]);

// Cirugía menor / ambulatoria bajo anestesia local o sedación.
const MENOR_BASE = [
  ['Bata quirúrgica estéril', 3], ['Guantes estériles talla 7.5', 4], ['Campo quirúrgico fenestrado estéril', 1],
  ['Clorhexidina 2% solución antiséptica', 1], ['Gasas estériles', 10], ['Hoja de bisturí #15', 1], ['Lidocaína 2% sin epinefrina 20 ml', 1],
  ['Jeringa 10 cc', 2], ['Sutura Vicryl 3-0', 2], ['Sutura Nylon 4-0', 1], ['Apósito transparente 10x12cm', 2],
];
// Con pieza para patología (biopsias, resecciones).
const MENOR = unir(MENOR_BASE, [['Frascos de patología con formol', 1]]);

const ENDOSCOPIA = [
  ['Protector bucal (mordedor)', 1], ['Cánula nasal de oxígeno', 1], ['Guantes de examen talla M', 4], ['Gasas estériles', 5],
  ['Campo desechable', 1], ['Jeringa 20 cc', 1], ['Lubricante hidrosoluble en gel', 1],
];

// Mama: ganglio centinela con trazador + marcación de márgenes.
const CENTINELA = [
  ['Azul de metileno 1% 2 ml', 1], ['Funda estéril para sonda gamma', 1], ['Frascos de patología con formol', 3],
];

export const INS_PORT = unir(MENOR_BASE, [
  ['Reservorio venoso implantable (port) con catéter', 1], ['Introductor desprendible (peel-away) 8 Fr', 1], ['Aguja de punción Seldinger 18G', 1],
  ['Guía metálica 0.035', 1], ['Dilatador venoso 8 Fr', 1], ['Aguja de Huber 20G', 1], ['Funda estéril para ecógrafo', 1],
  ['Gel estéril para ecografía', 1], ['Solución salina 0.9% 10 ml', 4], ['Solución salina 0.9% 100 ml', 1], ['Sutura Nylon 3-0', 1],
]);

export const INS_EGD_BIOPSIAS = unir(ENDOSCOPIA, [
  ['Pinza de biopsia endoscópica desechable', 4], ['Frascos de patología con formol', 4], ['Lidocaína en spray 10%', 1],
]);

export const INS_COLONOSCOPIA_POLIPECTOMIA = unir(ENDOSCOPIA, [
  ['Asa de polipectomía desechable', 1], ['Pinza de biopsia endoscópica desechable', 2], ['Clips hemostáticos endoscópicos', 2],
  ['Tinta india estéril para tatuaje endoscópico', 1], ['Aguja de inyección endoscópica', 1], ['Solución salina 0.9% 10 ml', 4],
  ['Frascos de patología con formol', 2],
]);

export const INS_TACE = unir([
  ['Bata quirúrgica estéril', 3], ['Guantes estériles talla 7.5', 4], ['Campo quirúrgico fenestrado estéril', 1],
  ['Clorhexidina 2% solución antiséptica', 1], ['Gasas estériles', 10], ['Lidocaína 2% sin epinefrina 20 ml', 1],
  ['Introductor arterial 5 Fr', 1], ['Catéter diagnóstico 5 Fr (Cobra)', 1], ['Guía hidrofílica 0.035', 1], ['Microcatéter 2.4 Fr', 1],
  ['Microguía 0.014', 1], ['Microesferas cargadas con doxorrubicina', 1], ['Lipiodol 10 ml', 1], ['Medio de contraste yodado 100 ml', 2],
  ['Jeringa 20 cc', 4], ['Llave de tres vías', 2], ['Set de manifold', 1], ['Solución salina 0.9% 500 ml heparinizada', 2],
  ['Dispositivo de cierre vascular', 1],
]);

const MAMA_ABIERTA = unir(ABIERTA, [
  ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2], ['Sutura Monocryl 4-0', 2], ['Sutura Nylon 3-0', 1], ['Venda elástica 6"', 2],
  ['Frascos de patología con formol', 3], ['Clips de titanio', 6],
]);

// Insumos por cirugía de la semana (clave = id). Las de hoy están más abajo, aparte.
export const INSUMOS_ONCO = {
  // Mastectomía radical modificada + ganglio centinela.
  12401: unir(MAMA_ABIERTA, CENTINELA),
  // Cuadrantectomía con ganglio centinela (marcaje con arpón ya colocado).
  12402: unir(MENOR, CENTINELA, [['Sutura Monocryl 4-0', 2], ['Clips de titanio', 6], ['Electrobisturí lápiz desechable', 1], ['Placa de electrobisturí', 1]]),
  // Gastrectomía subtotal con linfadenectomía D2, reconstrucción en Y de Roux.
  12403: unir(ABIERTA, [
    ['Grapadora lineal cortante 75 mm', 1], ['Cargas para grapadora lineal 75 mm', 3], ['Grapadora circular 25 mm', 1], ['Bisturí ultrasónico', 1],
    ['Sutura PDS 3-0', 3], ['Sutura Prolene 2-0', 2], ['Clips de titanio', 10], ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2],
    ['Sonda nasogástrica 16 Fr', 1], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1], ['Protector de herida (anillo)', 1],
  ]),
  // Hemicolectomía derecha laparoscópica.
  12404: unir(LAPAROSCOPIA, [
    ['Grapadora lineal laparoscópica 60 mm', 1], ['Cargas para grapadora lineal 60 mm', 3], ['Sutura V-Loc 3-0', 2], ['Sonda Foley 16 Fr', 1],
    ['Bolsa recolectora de orina', 1],
  ]),
  // Port-a-Cath (lunes).
  12405: INS_PORT,
  // Tiroidectomía total con vaciamiento central y neuromonitoreo recurrencial.
  12406: unir(ABIERTA, [
    ['Tubo endotraqueal con electrodos (neuromonitoreo)', 1], ['Sellador de vasos (LigaSure)', 1], ['Pinza bipolar desechable', 1],
    ['Clips de titanio', 10], ['Hemostático absorbible (Surgicel)', 2], ['Dren de succión cerrado 10 Fr', 1], ['Sutura Vicryl 3-0', 3],
    ['Sutura Monocryl 4-0', 2],
  ]),
  // Resección amplia de melanoma con ganglio centinela.
  12407: unir(MENOR, CENTINELA, [['Sutura Monocryl 3-0', 2], ['Sutura Nylon 4-0', 2], ['Electrobisturí lápiz desechable', 1], ['Placa de electrobisturí', 1]]),
  // Duodenopancreatectomía cefálica (Whipple).
  12408: unir(ABIERTA, [
    ['Bisturí ultrasónico', 1], ['Grapadora lineal cortante 75 mm', 1], ['Cargas para grapadora lineal 75 mm', 3], ['Sutura PDS 5-0', 4],
    ['Sutura PDS 3-0', 2], ['Sutura Prolene 5-0', 3], ['Stent pancreático 5 Fr', 1], ['Dren de succión cerrado Jackson-Pratt 19 Fr', 3],
    ['Sellante de fibrina', 1], ['Clips de titanio', 12], ['Sonda nasogástrica 16 Fr', 1], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
    ['Catéter de yeyunostomía de alimentación', 1],
  ]),
  // Colonoscopia con polipectomía.
  12409: INS_COLONOSCOPIA_POLIPECTOMIA,
  // Histerectomía radical (Wertheim-Meigs) -- cancelada.
  12410: unir(ABIERTA, [
    ['Sellador de vasos (LigaSure)', 1], ['Clips de titanio', 8], ['Sutura Vicryl 1', 4], ['Sutura Monocryl 3-0', 2],
    ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
  ]),
  // Nefrectomía radical laparoscópica.
  12411: unir(LAPAROSCOPIA, [
    ['Clips de polímero (Hem-o-lok) grandes', 6], ['Grapadora vascular laparoscópica 45 mm', 1], ['Bolsa de extracción de pieza grande', 1],
    ['Dren de succión cerrado Jackson-Pratt 19 Fr', 1], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1], ['Sutura PDS 1', 2],
  ]),
  // Resección anterior baja de recto con ileostomía de protección.
  12412: unir(LAPAROSCOPIA, [
    ['Grapadora lineal laparoscópica 60 mm', 1], ['Cargas para grapadora lineal 60 mm', 3], ['Grapadora circular 29 mm', 1],
    ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
    ['Bolsa de ileostomía', 2], ['Sutura Vicryl 3-0', 3], ['Sutura PDS 1', 2], ['Gasas estériles', 20], ['Compresas de laparotomía', 6],
  ]),
  // Mastectomía simple -- incumplida.
  12413: unir(MAMA_ABIERTA, [['Sutura Vicryl 0', 2]]),
  // Port-a-Cath (hoy, 08:00).
  12414: INS_PORT,
  // Biopsia excisional de ganglio cervical.
  12415: unir(MENOR, [['Electrobisturí lápiz desechable', 1], ['Placa de electrobisturí', 1], ['Clips de titanio', 4], ['Sutura Seda 3-0', 1]]),
  // Esofagogastroduodenoscopia con biopsias (hoy, iniciada).
  12416: INS_EGD_BIOPSIAS,
  // Quimioembolización arterial hepática (TACE).
  12417: INS_TACE,
  // Mastectomía con reconstrucción inmediata con expansor + ganglio centinela.
  12418: unir(MAMA_ABIERTA, CENTINELA, [
    ['Expansor tisular 450 cc', 1], ['Malla biológica (matriz dérmica acelular)', 1], ['Sutura Vicryl 2-0', 4], ['Sutura Monocryl 4-0', 3],
  ]),
  // Laringectomía parcial con vaciamiento cervical.
  12419: unir(ABIERTA, [
    ['Cánula de traqueostomía con balón # 8', 1], ['Sellador de vasos (LigaSure)', 1], ['Pinza bipolar desechable', 1], ['Clips de titanio', 10],
    ['Dren de succión cerrado 10 Fr', 2], ['Sonda nasogástrica 14 Fr', 1], ['Sutura Vicryl 3-0', 3], ['Sutura Monocryl 4-0', 2],
    ['Hemostático absorbible (Surgicel)', 2],
  ]),
  // Prostatectomía radical laparoscópica con linfadenectomía pélvica.
  12420: unir(LAPAROSCOPIA, [
    ['Clips de polímero (Hem-o-lok) grandes', 6], ['Sutura V-Loc 3-0', 2], ['Sonda Foley de silicona 20 Fr', 1], ['Bolsa recolectora de orina', 1],
    ['Dren de succión cerrado Jackson-Pratt 19 Fr', 1], ['Bolsa de extracción de pieza grande', 1],
  ]),
  // Hepatectomía derecha por metástasis colorrectales.
  12421: unir(ABIERTA, [
    ['Aspirador ultrasónico (CUSA), pieza de mano desechable', 1], ['Bisturí ultrasónico', 1], ['Grapadora vascular 45 mm', 2],
    ['Sellante de fibrina', 2], ['Hemostático absorbible (Surgicel)', 4], ['Sutura Prolene 4-0', 3], ['Sutura Prolene 5-0', 2],
    ['Clips de titanio', 12], ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2], ['Sonda nasogástrica 16 Fr', 1], ['Sonda Foley 16 Fr', 1],
    ['Bolsa recolectora de orina', 1],
  ]),
  // Laparotomía exploratoria por obstrucción intestinal maligna (urgencia).
  12422: unir(ABIERTA, [
    ['Grapadora lineal cortante 75 mm', 1], ['Cargas para grapadora lineal 75 mm', 2], ['Sonda nasogástrica 18 Fr', 1], ['Sonda Foley 16 Fr', 1],
    ['Bolsa recolectora de orina', 1], ['Bolsa de colostomía', 2], ['Sutura PDS 1', 3], ['Sutura Nylon 2-0', 2],
  ]),
};

// Cirugías sembradas para hoy (ids de "Canastas de cirugía"). Los nombres y cantidades que
// usan los tests quedan fijos: 12353 con 'Trocar 5mm' (2) antes de 'Gasas estériles' (10), y
// 12356 con 'Gasas estériles' (6).
export const INSUMOS_HOY = {
  // Hemicolectomía derecha laparoscópica (realizada, consumo pendiente).
  12353: unir(INSUMOS_ONCO[12404], [['Trocar 5mm', 2], ['Gasas estériles', 10]]),
  // Colostomía derivativa por obstrucción maligna (urgencia).
  12354: unir(ABIERTA, [
    ['Bolsa de colostomía', 2], ['Soporte de ostomía (varilla)', 1], ['Sutura Vicryl 3-0', 3], ['Sutura PDS 1', 2], ['Sutura Nylon 2-0', 2],
    ['Sonda nasogástrica 18 Fr', 1], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
  ]),
  // Cuadrantectomía con ganglio centinela.
  12355: unir(MENOR, CENTINELA, [['Sutura Monocryl 4-0', 2], ['Clips de titanio', 6], ['Electrobisturí lápiz desechable', 1], ['Placa de electrobisturí', 1]]),
  // Orquiectomía radical inguinal derecha.
  12356: unir(MENOR, [
    ['Gasas estériles', 6], ['Compresas quirúrgicas', 4], ['Hoja de bisturí #10', 1], ['Sutura Prolene 0', 2], ['Sutura Seda 2-0', 1],
    ['Sutura Monocryl 4-0', 1], ['Electrobisturí lápiz desechable', 1], ['Placa de electrobisturí', 1],
  ]),
  // Resección ileocecal laparoscópica por tumor apendicular.
  12357: unir(LAPAROSCOPIA, [
    ['Grapadora lineal laparoscópica 60 mm', 1], ['Cargas para grapadora lineal 60 mm', 2], ['Sutura V-Loc 3-0', 1],
  ]),
  // Histerectomía radical con linfadenectomía pélvica.
  12358: unir(ABIERTA, [
    ['Sellador de vasos (LigaSure)', 1], ['Clips de titanio', 8], ['Sutura Vicryl 1', 4], ['Sutura Monocryl 3-0', 2],
    ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
  ]),
  // Resección de sarcoma de partes blandas de muslo izquierdo.
  12359: unir(ABIERTA, [
    ['Manguito de torniquete neumático desechable', 1], ['Venda de Esmarch', 1], ['Clips de titanio', 8], ['Sutura Seda 2-0 (marcación de márgenes)', 2],
    ['Dren de succión cerrado tipo Hemovac # 14', 2], ['Venda elástica 6"', 4], ['Venda de algodón laminado 6"', 4], ['Frascos de patología con formol', 2],
    ['Apósito compresivo', 1],
  ]),
  // Colecistectomía radical + resección hepática segmentaria + linfadenectomía del hilio.
  12361: unir(LAPAROSCOPIA, [
    ['Bisturí ultrasónico', 1], ['Separador hepático', 1], ['Pinza Maryland', 1], ['Catéter de colangiografía', 1],
    ['Medio de contraste yodado 20 ml', 1], ['Sellante de fibrina', 2], ['Sutura Prolene 4-0', 2], ['Dren de succión cerrado Jackson-Pratt 19 Fr', 2],
    ['Frascos de patología con formol', 2], ['Gasas estériles', 12],
  ]),
};
