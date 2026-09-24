import AtencionPaciente from '@/Components/HistoriaClinica/AtencionPaciente/AtencionPaciente';

// `?tab=<id>` abre la atención directo en esa pestaña (ej. "Ver órdenes
// médicas" del menú "⋯" de la tabla de HC Hospitalización).
export default async function AtencionHospitalizadoPage({ params, searchParams }) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <AtencionPaciente id={id} variante="hospitalizacion" initialTab={tab} />;
}
