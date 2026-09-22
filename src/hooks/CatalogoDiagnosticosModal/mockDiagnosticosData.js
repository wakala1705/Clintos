// Catálogo de diagnósticos (CIE-10) que alimenta @/Components/CatalogoDiagnosticosModal.
// Movido acá desde mockCirugiaData.js (encargo explícito: el buscador CIE-10
// de Historia Clínica → Ingreso a hospitalización debe abrir "el modal de
// CIE-10 que ya tenemos diseñado" en vez de duplicarlo) -- mismo criterio ya
// aplicado a ASEGURADORAS_CATALOGO/@/Components/CatalogoAseguradorasModal:
// este catálogo deja de ser exclusivo de Programación de Sala de Cirugía, así
// que su dato/componente pasan a ser app-wide (ver AGENTS.md "Component
// organization"). Recorte representativo (~40 códigos reales) en vez de los
// "12423 registros" de la captura de referencia original -- la paginación/
// contador del modal reflejan el total real de este array, no un número
// inventado que no tendría datos detrás. `sexo` alimenta el filtro "Todos los
// sexos"/Femenino/Masculino del modal; la mayoría son 'Ambos', con un puñado
// de códigos genuinamente restringidos por sexo (próstata, mama,
// ginecológicos/obstétricos) para que ese filtro tenga un efecto real y no
// sea decorativo.
export const DIAGNOSTICOS_CATALOGO = [
  { codigo: 'A001', descripcion: 'COLERA DEBIDO A VIBRIO CHOLERAE 01, BIOTIPO EL TOR', sexo: 'Ambos' },
  { codigo: 'A009', descripcion: 'COLERA NO ESPECIFICADO', sexo: 'Ambos' },
  { codigo: 'A010', descripcion: 'FIEBRE TIFOIDEA', sexo: 'Ambos' },
  { codigo: 'A011', descripcion: 'FIEBRE PARATIFOIDEA A', sexo: 'Ambos' },
  { codigo: 'A012', descripcion: 'FIEBRE PARATIFOIDEA B', sexo: 'Ambos' },
  { codigo: 'A013', descripcion: 'FIEBRE PARATIFOIDEA C', sexo: 'Ambos' },
  { codigo: 'A014', descripcion: 'FIEBRE PARATIFOIDEA, NO ESPECIFICADA', sexo: 'Ambos' },
  { codigo: 'A020', descripcion: 'ENTERITIS DEBIDA A SALMONELLA', sexo: 'Ambos' },
  { codigo: 'A040', descripcion: 'INFECCION DEBIDA A ESCHERICHIA COLI ENTEROPATOGENA', sexo: 'Ambos' },
  { codigo: 'A090', descripcion: 'DIARREA Y GASTROENTERITIS DE PRESUNTO ORIGEN INFECCIOSO', sexo: 'Ambos' },
  { codigo: 'J039', descripcion: 'AMIGDALITIS AGUDA, NO ESPECIFICADA', sexo: 'Ambos' },
  { codigo: 'J189', descripcion: 'NEUMONIA, NO ESPECIFICADA', sexo: 'Ambos' },
  { codigo: 'J450', descripcion: 'ASMA PREDOMINANTEMENTE ALERGICA', sexo: 'Ambos' },
  { codigo: 'K358', descripcion: 'OTRAS APENDICITIS AGUDAS Y LAS NO ESPECIFICADAS', sexo: 'Ambos' },
  { codigo: 'K802', descripcion: 'CALCULOS DE LA VESICULA BILIAR SIN COLECISTITIS', sexo: 'Ambos' },
  { codigo: 'K810', descripcion: 'COLECISTITIS AGUDA', sexo: 'Ambos' },
  { codigo: 'K269', descripcion: 'ULCERA DUODENAL, NO ESPECIFICADA COMO AGUDA O CRONICA, SIN HEMORRAGIA NI PERFORACION', sexo: 'Ambos' },
  { codigo: 'K449', descripcion: 'HERNIA DIAFRAGMATICA SIN OBSTRUCCION NI GANGRENA', sexo: 'Ambos' },
  { codigo: 'N40X', descripcion: 'HIPERPLASIA DE LA PROSTATA', sexo: 'Masculino' },
  { codigo: 'N411', descripcion: 'PROSTATITIS CRONICA', sexo: 'Masculino' },
  { codigo: 'C61X', descripcion: 'TUMOR MALIGNO DE LA PROSTATA', sexo: 'Masculino' },
  { codigo: 'N832', descripcion: 'OTROS QUISTES DEL OVARIO Y LOS NO ESPECIFICADOS', sexo: 'Femenino' },
  { codigo: 'N800', descripcion: 'ENDOMETRIOSIS DEL UTERO', sexo: 'Femenino' },
  { codigo: 'D250', descripcion: 'LEIOMIOMA SUBMUCOSO DEL UTERO', sexo: 'Femenino' },
  { codigo: 'O82X', descripcion: 'PARTO POR CESAREA, NO ESPECIFICADO', sexo: 'Femenino' },
  { codigo: 'N979', descripcion: 'INFERTILIDAD FEMENINA, NO ESPECIFICADA', sexo: 'Femenino' },
  { codigo: 'C500', descripcion: 'TUMOR MALIGNO DE LA MAMA, PARTE NO ESPECIFICADA', sexo: 'Femenino' },
  { codigo: 'S066', descripcion: 'HEMORRAGIA SUBARACNOIDEA TRAUMATICA', sexo: 'Ambos' },
  { codigo: 'S720', descripcion: 'FRACTURA DEL CUELLO DEL FEMUR', sexo: 'Ambos' },
  { codigo: 'S824', descripcion: 'FRACTURA DE OTRAS PARTES DE LA PIERNA', sexo: 'Ambos' },
  { codigo: 'M170', descripcion: 'GONARTROSIS PRIMARIA, BILATERAL', sexo: 'Ambos' },
  { codigo: 'M160', descripcion: 'COXARTROSIS PRIMARIA BILATERAL', sexo: 'Ambos' },
  { codigo: 'I209', descripcion: 'ANGINA DE PECHO, NO ESPECIFICADA', sexo: 'Ambos' },
  { codigo: 'I500', descripcion: 'INSUFICIENCIA CARDIACA CONGESTIVA', sexo: 'Ambos' },
  { codigo: 'E119', descripcion: 'DIABETES MELLITUS NO INSULINODEPENDIENTE, SIN MENCION DE COMPLICACION', sexo: 'Ambos' },
  { codigo: 'E039', descripcion: 'HIPOTIROIDISMO, NO ESPECIFICADO', sexo: 'Ambos' },
  { codigo: 'Q211', descripcion: 'COMUNICACION INTERAURICULAR', sexo: 'Ambos' },
  { codigo: 'H269', descripcion: 'CATARATA, NO ESPECIFICADA', sexo: 'Ambos' },
  { codigo: 'H040', descripcion: 'DACRIOADENITIS AGUDA', sexo: 'Ambos' },
  { codigo: 'L029', descripcion: 'ABSCESO CUTANEO, FURUNCULO Y ANTRAX DE SITIO NO ESPECIFICADO', sexo: 'Ambos' },
  { codigo: 'T810', descripcion: 'HEMORRAGIA Y HEMATOMA COMPLICANDO UN PROCEDIMIENTO, NO CLASIFICADOS EN OTRA PARTE', sexo: 'Ambos' },
  { codigo: 'Z017', descripcion: 'EXAMEN DE LABORATORIO', sexo: 'Ambos' },
];
