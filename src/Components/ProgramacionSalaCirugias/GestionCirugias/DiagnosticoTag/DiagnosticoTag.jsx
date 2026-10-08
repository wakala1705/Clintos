import Badge from '@/Components/Badge/Badge';

// Marca si el diagnóstico oncológico de la solicitud es de primera vez
// ("Primera vez") o recurrente ("Recurrente": el paciente ya tenía el
// diagnóstico). Solo texto: el tono celeste/gris es apoyo, no el único canal.
export default function DiagnosticoTag({ primeraVez = false }) {
  return primeraVez
    ? <Badge tone="info">Primera vez</Badge>
    : <Badge tone="neutral">Recurrente</Badge>;
}
